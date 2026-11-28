import { type ReactNode, useRef, useState } from 'react'
import { useReducedMotion } from '../utils/use-reduced-motion'
import { Tile } from './tile'

/** The file a summary card shows: usually the latest one in a library group. */
export type LibrarySummaryFile = {
	/** Display name, used in the document layout. */
	name: string
	/** Resolved URL of the file, for an image or video preview. */
	src?: string
	/** MIME type; decides the layout (image or video cover, inset SVG, or a document line). */
	contentType?: string
	/** Original filename; its extension labels files without a preview. */
	filename?: string
	/**
	 * Still frame for a video. Touch screens have no hover, so the video never plays
	 * there, and some mobile browsers draw no frame from `preload="metadata"` alone.
	 */
	poster?: string
}

export type LibrarySummaryCardProps = {
	/**
	 * Eyebrow, e.g. the group's name ("Videos"). The pressable tile is named by its whole
	 * visible text (title, headline, type and footer), so nothing is lost to a screen reader.
	 */
	title: string
	/** The file to show. Without it the card shows `emptyTitle`. */
	file?: LibrarySummaryFile
	/** Headline when there is no file, e.g. "No videos yet." */
	emptyTitle?: ReactNode
	/**
	 * Headline of the document layout (audio, PDF, anything without a picture).
	 * Defaults to the file's name; pass e.g. "Your latest document is <name>." to say more.
	 */
	fileTitle?: ReactNode
	/** Footer, e.g. "3 other files" or "Added 1 Mar 2026". */
	footer?: ReactNode
	/**
	 * `line` (default): files without a picture show `fileTitle` with the extension beside it.
	 * `centered`: they show only the extension, centred (for a "Recently added" card).
	 */
	documentLayout?: 'line' | 'centered'
	/** Shown in place of an image or video that failed to load. */
	previewUnavailableLabel?: string
	/** Label for a file with neither an extension nor a MIME subtype. */
	unknownTypeLabel?: string
	onPress?: () => void
	className?: string
}

const coverText = 'relative z-10 text-white'

/**
 * A short type label: the filename's extension, else a short MIME subtype with its
 * parameters and structured suffix dropped (`text/plain; charset=utf-8` → `PLAIN`,
 * `image/svg+xml` → `SVG`). A long vendor subtype gives `undefined`, for the caller's label.
 */
export function libraryFileTypeLabel(filename?: string, contentType?: string): string | undefined {
	const extension = filename?.includes('.') ? filename.split('.').pop()?.trim() : undefined
	if (extension) return extension.toUpperCase()
	const subtype = contentType?.split(';')[0]?.split('/')[1]?.split('+')[0]?.trim()
	return subtype && subtype.length <= 6 ? subtype.toUpperCase() : undefined
}

/**
 * One tile of a library overview: the latest file of a group, previewed by its type.
 * - Images and videos fill the tile, with a scrim behind the white eyebrow and footer.
 *   A video plays on hover or focus (never under reduced motion) and is muted.
 * - SVG artwork stays whole, inset on the tile.
 * - Everything else shows a line about the file and its extension.
 * Text comes in as props; what goes into each card (groups, counts, wording) is the app's.
 */
export function LibrarySummaryCard({
	title,
	file,
	emptyTitle,
	fileTitle,
	footer,
	documentLayout = 'line',
	previewUnavailableLabel = 'Preview unavailable.',
	unknownTypeLabel = 'File',
	onPress,
	className,
}: LibrarySummaryCardProps) {
	const video = useRef<HTMLVideoElement>(null)
	const reducedMotion = useReducedMotion()
	const [failedSource, setFailedSource] = useState<string | null>(null)
	const src = file?.src
	const mime = (file?.contentType ?? '').split(';')[0]?.trim().toLowerCase() ?? ''
	const isVideo = mime.startsWith('video/')
	const inset = mime === 'image/svg+xml'
	const visual = Boolean(file && src && (mime.startsWith('image/') || isVideo))
	const typeLabel = libraryFileTypeLabel(file?.filename, mime) ?? unknownTypeLabel
	const typeLabelClass = 'max-w-full text-center text-fg-muted [overflow-wrap:anywhere]'

	// No `aria-label` on the tiles below: the button is named by its visible text, so a
	// screen reader hears the headline and footer too, not just the eyebrow.
	if (!file) {
		return <Tile className={className} eyebrow={title} title={emptyTitle} titleAlign="top" onPress={onPress} />
	}

	const preview = !visual ? undefined : failedSource === src ? (
		// Under a cover the eyebrow and footer are white, so the fallback is a fixed dark
		// surface in both themes (an inverted token turns light in the dark theme).
		<div
			className={`flex h-full w-full items-center justify-center p-6 text-small ${inset ? 'text-fg-muted' : 'bg-black text-white'}`}
		>
			{previewUnavailableLabel}
		</div>
	) : isVideo ? (
		<video
			key={src}
			ref={video}
			src={src}
			poster={file.poster}
			aria-hidden="true"
			muted
			loop
			playsInline
			preload="metadata"
			onError={() => setFailedSource(src ?? null)}
			className="h-full w-full object-cover"
		/>
	) : (
		<img
			key={src}
			src={src}
			alt=""
			loading="lazy"
			decoding="async"
			onError={() => setFailedSource(src ?? null)}
			className={`h-full w-full ${inset ? 'object-contain' : 'object-cover'}`}
		/>
	)

	if (visual && !inset) {
		const start = () => {
			if (!reducedMotion) void video.current?.play().catch(() => {})
		}
		const stop = () => {
			if (!video.current) return
			video.current.pause()
			video.current.currentTime = 0
		}
		return (
			<div
				className={`h-full ${className ?? ''}`}
				data-library-summary-cover=""
				onMouseEnter={start}
				onMouseLeave={stop}
				onFocus={start}
				onBlur={stop}
			>
				<Tile
					className="relative isolate"
					eyebrow={<span className={coverText}>{title}</span>}
					footer={footer ? <span className={coverText}>{footer}</span> : undefined}
					onPress={onPress}
				>
					{/* Fixed dark backdrop: the white text stays legible while the file loads or if it fails. */}
					<div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 bg-black">
						{preview}
						<div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
					</div>
				</Tile>
			</div>
		)
	}

	if (inset || documentLayout === 'centered') {
		return (
			<Tile className={className} eyebrow={title} footer={footer} onPress={onPress}>
				<div className="flex min-h-0 w-full flex-1 items-center justify-center p-6">
					{preview ?? <span className={typeLabelClass}>{typeLabel}</span>}
				</div>
			</Tile>
		)
	}

	return (
		<Tile
			className={className}
			eyebrow={title}
			title={<span className="block min-w-0 break-words text-fg [overflow-wrap:anywhere]">{fileTitle ?? file.name}</span>}
			titleAlign="top"
			footer={footer}
			onPress={onPress}
			image={
				<div className="flex h-40 w-full items-center justify-center rounded-lg">
					<span className={typeLabelClass}>{typeLabel}</span>
				</div>
			}
		/>
	)
}
