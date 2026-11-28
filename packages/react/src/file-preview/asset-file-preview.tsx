import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from 'pdfjs-dist'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { AudioPlayer, type AudioPlayerLabels } from '../components/audio-player'
import { Button } from '../components/button'
import { LibraryAssetPreview } from '../components/library-asset-preview'
import type { LibraryPreviewFullscreenLabels } from '../components/library-preview-fullscreen'
import {
	type AssetPreviewFetcher,
	type AssetPreviewKind,
	type DocumentPreviewSection,
	decodePreviewText,
	loadAssetPreviewBytes,
	officePreviewSections,
} from './document-preview'

export type AssetFilePreviewLabels = {
	loading: string
	unsupported: string
	unavailable: string
	retry: string
	/** Under the error, e.g. where to download the original. Empty hides it. */
	downloadHint: string
	/** Above an Office preview: what it leaves out. */
	contentOnly: string
	/** Above a text preview. */
	textOnly: string
	/** A PDF page's name: "Manual, page 2 of 5". */
	page: (name: string, page: number, total: number) => string
	/** `aria-roledescription` of the PDF page carousel. */
	pages: string
	previous: string
	next: string
	expand: string
	position: (current: number, total: number) => string
	audio: AudioPlayerLabels
	fontTitle: (name: string) => string
	fontSample: string
	/** Shown under the sample in the font specimen. */
	fontAlphabet: string
	fullscreen?: LibraryPreviewFullscreenLabels
}

export const defaultAssetFilePreviewLabels: AssetFilePreviewLabels = {
	loading: 'Loading preview…',
	unsupported: 'A preview is not available for this file format.',
	unavailable: 'Could not display this file. It may be too large, protected, damaged or temporarily unavailable.',
	retry: 'Try again',
	downloadHint: '',
	contentOnly:
		'Content preview · formatting, charts and embedded media may differ from the original. Limited to 50 sections, 200 rows per sheet and 100,000 characters.',
	textOnly: 'Text preview · up to 100,000 characters. File content is displayed without executing it.',
	page: (name, page, total) => `${name}, page ${page} of ${total}`,
	pages: 'Document pages',
	previous: 'Previous page',
	next: 'Next page',
	expand: 'Expand preview',
	position: (current, total) => `${current} of ${total}`,
	audio: { play: 'Play', pause: 'Pause', position: 'Playback position', volume: 'Volume' },
	fontTitle: (name) => `Font preview: ${name}`,
	fontSample: 'The quick brown fox jumps over the lazy dog.',
	fontAlphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ\nabcdefghijklmnopqrstuvwxyz\n0123456789 · !?@&€$%',
}

type FileKind = Exclude<AssetPreviewKind, 'image'>

export type AssetFilePreviewProps = {
	/** The file's URL. Fetched only within `pathPrefix` (see `loadAssetPreviewBytes`). */
	source: string
	/** The file's name, for accessible names and the page labels. */
	name: string
	/** From `assetPreviewKind`. Images have their own viewers (`PhotoPreview`, `LogoPreview`). */
	kind: FileKind
	/** Only sources whose path starts with this are fetched, e.g. `/media/`. */
	pathPrefix: string
	/**
	 * URL of pdf.js's worker (`pdfjs-dist/build/pdf.worker.min.mjs`), served by the app.
	 * Needed for PDFs; without it a PDF shows the "unavailable" state.
	 */
	pdfWorkerSrc?: string
	/** Sample text for the font specimen. Default `labels.fontSample`. */
	fontSample?: string
	/** Sample size in px. Default 48. */
	fontSize?: number
	/** A single large editable "Ag" instead of the sample and alphabet. */
	editableFontPreview?: boolean
	labels?: Partial<AssetFilePreviewLabels>
	/** For tests or a custom transport. Default `fetch`. */
	fetcher?: AssetPreviewFetcher
}

function PdfPages({ bytes, name, workerSrc, labels, onError }: { bytes: Uint8Array; name: string; workerSrc: string; labels: AssetFilePreviewLabels; onError: () => void }) {
	const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
	const [page, setPage] = useState(0)
	useEffect(() => {
		let active = true
		let task: PDFDocumentLoadingTask | undefined
		void import('pdfjs-dist')
			.then(async (module) => {
				if (!active) return
				module.GlobalWorkerOptions.workerSrc = workerSrc
				task = module.getDocument({ data: bytes.slice(), enableXfa: false, useSystemFonts: true })
				const document = await task.promise
				if (document.numPages > 500) {
					await task.destroy()
					throw Error('PREVIEW_TOO_LARGE')
				}
				if (active) setPdf(document)
			})
			.catch(() => {
				if (active) onError()
			})
		return () => {
			active = false
			void task?.destroy()
		}
	}, [bytes, workerSrc, onError])
	if (!pdf) return <p role="status" className="text-body text-fg-inverted">{labels.loading}</p>
	return (
		<div className="h-full min-h-0 w-full">
			<LibraryAssetPreview
				fitArtwork
				items={Array.from({ length: pdf.numPages }, (_, index) => ({
					id: String(index),
					name: labels.page(name, index + 1, pdf.numPages),
					preview: <PdfPage key={index} pdf={pdf} page={index + 1} name={name} labels={labels} onError={onError} />,
				}))}
				activeIndex={page}
				onActiveIndexChange={setPage}
				ariaLabel={name}
				carouselLabel={labels.pages}
				previousLabel={labels.previous}
				nextLabel={labels.next}
				expandLabel={labels.expand}
				positionLabel={labels.position}
				announcement={(_item, current, total) => labels.page(name, current, total)}
				fullscreenLabels={labels.fullscreen}
			/>
		</div>
	)
}

/** Each mounted page owns its canvas, including the one in the fullscreen view. */
function PdfPage({ pdf, page, name, labels, onError }: { pdf: PDFDocumentProxy; page: number; name: string; labels: AssetFilePreviewLabels; onError: () => void }) {
	const canvas = useRef<HTMLCanvasElement>(null)
	const [pageText, setPageText] = useState('')
	const [rendering, setRendering] = useState(true)
	useEffect(() => {
		let active = true
		let render: RenderTask | undefined
		void pdf
			.getPage(page)
			.then(async (document) => {
				if (!active || !canvas.current) return
				const original = document.getViewport({ scale: 1 })
				const viewport = document.getViewport({ scale: Math.min(1.5, 1200 / original.width, 1600 / original.height) })
				canvas.current.width = Math.ceil(viewport.width)
				canvas.current.height = Math.ceil(viewport.height)
				render = document.render({ canvas: canvas.current, viewport })
				await render.promise
				const text = await document.getTextContent()
				if (active) {
					// The page's text, for screen readers: the canvas itself is only an image.
					setPageText(
						text.items
							.flatMap((item) => ('str' in item ? [item.str] : []))
							.join(' ')
							.slice(0, 100_000),
					)
					setRendering(false)
				}
			})
			.catch(() => {
				if (active) onError()
			})
		return () => {
			active = false
			render?.cancel()
		}
	}, [pdf, page, onError])
	return (
		<div className="flex h-full min-h-0 w-full flex-col items-center justify-center">
			<canvas ref={canvas} role="img" aria-label={labels.page(name, page, pdf.numPages)} className="max-h-full max-w-full bg-surface object-contain" />
			<p className="sr-only">{pageText}</p>
			{rendering ? (
				<p role="status" className="text-small text-fg-inverted">
					{labels.loading}
				</p>
			) : null}
		</div>
	)
}

/** A temporary browser font face for the specimen: never installed, removed on unmount. */
function FontSpecimen({
	bytes,
	name,
	labels,
	onError,
	sample,
	size,
	light = false,
	displaySize = '96px',
}: {
	bytes: Uint8Array
	name: string
	labels: AssetFilePreviewLabels
	onError: () => void
	sample: string
	size: number
	light?: boolean
	displaySize?: string
}) {
	const id = useId()
	const family = `podoba-preview-font-${id.replaceAll(':', '')}`
	const [ready, setReady] = useState(false)
	useEffect(() => {
		let active = true
		let face: FontFace
		try {
			face = new FontFace(family, bytes.slice().buffer)
		} catch {
			onError()
			return
		}
		void face
			.load()
			.then((loaded) => {
				if (!active) return
				document.fonts.add(loaded)
				setReady(true)
			})
			.catch(() => {
				if (active) onError()
			})
		return () => {
			active = false
			document.fonts.delete(face)
		}
	}, [bytes, family, onError])
	if (!ready) {
		return (
			<p role="status" className={light ? 'text-body text-fg-muted' : 'text-body text-white'}>
				{labels.loading}
			</p>
		)
	}
	if (light) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<span
					data-testid="asset-font-specimen"
					contentEditable
					suppressContentEditableWarning
					role="textbox"
					aria-label={labels.fontTitle(name)}
					spellCheck={false}
					className="max-w-full break-words text-center text-fg outline-none"
					style={{ fontFamily: JSON.stringify(family), fontSize: displaySize, lineHeight: 1 }}
				>
					Ag
				</span>
			</div>
		)
	}
	return (
		<section aria-label={labels.fontTitle(name)} className="flex h-full w-full flex-col gap-5 overflow-auto rounded-lg bg-surface p-5 text-fg">
			{/* The specimen size is the user's content, not the UI type scale. */}
			<p data-testid="asset-font-specimen" className="whitespace-pre-wrap break-words leading-normal" style={{ fontFamily: JSON.stringify(family), fontSize: `${size}px` }}>
				{sample}
			</p>
			<p className="whitespace-pre-wrap break-words text-body leading-relaxed" style={{ fontFamily: JSON.stringify(family) }}>
				{labels.fontAlphabet}
			</p>
		</section>
	)
}

/** Preview a font the user picked (before upload) as a large editable "Ag". */
export function LocalFontPreview({ file, labels: labelOverrides }: { file: File; labels?: Partial<AssetFilePreviewLabels> }) {
	const labels = { ...defaultAssetFilePreviewLabels, ...labelOverrides }
	const [bytes, setBytes] = useState<Uint8Array | null>(null)
	const [error, setError] = useState(false)
	const fail = useCallback(() => setError(true), [])
	useEffect(() => {
		let active = true
		void file
			.arrayBuffer()
			.then((buffer) => {
				if (active) setBytes(new Uint8Array(buffer))
			})
			.catch(() => {
				if (active) setError(true)
			})
		return () => {
			active = false
		}
	}, [file])
	if (error) {
		return (
			<p role="status" className="text-small text-fg-muted">
				{labels.unavailable}
			</p>
		)
	}
	if (!bytes) {
		return (
			<p role="status" className="text-small text-fg-muted">
				{labels.loading}
			</p>
		)
	}
	return <FontSpecimen bytes={bytes} name={file.name} labels={labels} onError={fail} sample={labels.fontSample} size={48} light />
}

/**
 * A viewer for a file that isn't an image: PDF pages (pdf.js, in a carousel with a
 * fullscreen view), the text of Office documents, plain text, a font specimen, audio and
 * video. Everything happens in the browser: no Office viewer or iframe, no HTML rendered
 * from the file, no macros. Text is shown as text. Failure shows a message and a retry.
 */
export function AssetFilePreview({
	source,
	name,
	kind,
	pathPrefix,
	pdfWorkerSrc,
	fontSample,
	fontSize = 48,
	editableFontPreview = false,
	labels: labelOverrides,
	fetcher,
}: AssetFilePreviewProps) {
	const labels = { ...defaultAssetFilePreviewLabels, ...labelOverrides }
	const [attempt, setAttempt] = useState(0)
	const [bytes, setBytes] = useState<Uint8Array | null>(null)
	const [sections, setSections] = useState<DocumentPreviewSection[]>([])
	const [error, setError] = useState(false)
	const fail = useCallback(() => setError(true), [])
	// In a ref, so an inline fetcher does not refetch on every render.
	const fetcherRef = useRef(fetcher)
	fetcherRef.current = fetcher
	useEffect(() => {
		if (kind === 'unsupported' || kind === 'video' || kind === 'audio') return
		if (kind === 'pdf' && !pdfWorkerSrc) {
			setError(true)
			return
		}
		const controller = new AbortController()
		void loadAssetPreviewBytes(source, { signal: controller.signal, pathPrefix, fetcher: fetcherRef.current })
			.then((value) => {
				if (controller.signal.aborted) return
				if (kind === 'font') setBytes(value)
				else if (kind === 'pdf') {
					if (new TextDecoder().decode(value.subarray(0, 1024)).indexOf('%PDF-') < 0) throw Error('PREVIEW_INVALID')
					setBytes(value)
				} else setSections(kind === 'office' ? officePreviewSections(value) : [{ title: '', text: decodePreviewText(value) }])
			})
			.catch(() => {
				if (!controller.signal.aborted) setError(true)
			})
		return () => controller.abort()
	}, [source, kind, pathPrefix, pdfWorkerSrc, attempt])

	if (kind === 'unsupported' || error) {
		return (
			<div role="status" className="flex max-w-96 flex-col items-center gap-4 rounded-lg bg-surface p-6 text-center text-fg">
				<p className="text-body">{kind === 'unsupported' ? labels.unsupported : labels.unavailable}</p>
				{error ? (
					<Button
						variant="secondary"
						onPress={() => {
							setBytes(null)
							setSections([])
							setError(false)
							setAttempt((value) => value + 1)
						}}
					>
						{labels.retry}
					</Button>
				) : null}
				{labels.downloadHint ? <p className="text-small text-fg-muted">{labels.downloadHint}</p> : null}
			</div>
		)
	}
	if (kind === 'video') {
		return <video controls playsInline preload="metadata" aria-label={name} src={source} onError={fail} className="h-auto max-h-full w-auto max-w-full object-contain" />
	}
	if (kind === 'audio') return <AudioPlayer src={source} name={name} onError={fail} labels={labels.audio} />
	if (kind === 'font' && bytes) {
		return (
			<FontSpecimen
				bytes={bytes}
				name={name}
				labels={labels}
				onError={fail}
				sample={fontSample ?? labels.fontSample}
				size={fontSize}
				light={editableFontPreview}
				displaySize={editableFontPreview ? 'min(12vw, 160px)' : undefined}
			/>
		)
	}
	if (kind === 'pdf' && bytes && pdfWorkerSrc) return <PdfPages bytes={bytes} name={name} workerSrc={pdfWorkerSrc} labels={labels} onError={fail} />
	if (sections.length) {
		return (
			<section aria-label={name} className="h-full w-full overflow-auto rounded-lg bg-surface p-5 text-fg">
				<p className="mb-4 text-small text-fg-muted">{kind === 'office' ? labels.contentOnly : labels.textOnly}</p>
				{sections.map((section, index) => (
					<div key={index} className="mb-6">
						{section.title ? <h2 className="mb-3 text-body font-medium">{section.title}</h2> : null}
						<pre className="whitespace-pre-wrap break-words font-mono text-small">{section.text}</pre>
					</div>
				))}
			</section>
		)
	}
	return (
		<p role="status" className="text-body text-white">
			{labels.loading}
		</p>
	)
}
