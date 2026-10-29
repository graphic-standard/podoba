import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Button as AriaButton } from 'react-aria-components'
import { uic } from '../utils/uic'
import { Button } from './button'
import { MediaGallery, type MediaGalleryItem } from './media-gallery'

export const MEDIA_ASSET_PANEL_MODES = ['media', 'grid', 'carousel'] as const
export type MediaAssetPanelMode = (typeof MEDIA_ASSET_PANEL_MODES)[number]
export type MediaAssetPanelProps = {
	items: readonly MediaGalleryItem[]
	mode: MediaAssetPanelMode
	empty: boolean
	heading: ReactNode
	emptyDescription: ReactNode
	emptyHint: ReactNode
	selectLabel: string
	previousLabel: string
	nextLabel: string
	onSelect?: () => void
	/** Optional reference identity; omitted for a media-only gallery. */
	identity?: {
		title: ReactNode
		caption: ReactNode
		count: ReactNode
		titleAppearance?: MediaTextAppearance
		captionAppearance?: MediaTextAppearance
		captionWidth?: number
	}
	className?: string
}
const Surface = uic('div', {
	displayName: 'MediaAssetPanel',
	baseClass:
		'group/media-panel relative isolate h-95 w-full shrink-0 overflow-hidden rounded-lg bg-surface-card text-fg',
})
const PanelAction = uic(AriaButton, {
	displayName: 'MediaAssetPanelAction',
	baseClass:
		'absolute inset-0 z-10 cursor-pointer rounded-lg border-0 bg-transparent p-0 outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-inset data-[focus-visible]:ring-ring',
})

/** Full-bleed media with independent selection and carousel controls. */
export function MediaAssetPanel({
	items,
	mode,
	empty,
	heading,
	emptyDescription,
	emptyHint,
	selectLabel,
	previousLabel,
	nextLabel,
	onSelect,
	identity,
	className,
}: MediaAssetPanelProps) {
	const panelRef = useRef<HTMLDivElement>(null)
	const [multiply, setMultiply] = useState(false)
	useEffect(() => {
		const panel = panelRef.current
		if (!panel) return
		let disposed = false
		const analyze = async () => {
			const image = panel.querySelector<HTMLImageElement>('img')
			if (!image?.complete || !image.naturalWidth) return
			try {
				const readable = await readableMediaImage(image)
				const canvas = document.createElement('canvas')
				canvas.width = 16
				canvas.height = 16
				const ctx = canvas.getContext('2d', { willReadFrequently: true })
				if (!ctx) return
				ctx.fillStyle = 'white'
				ctx.fillRect(0, 0, 16, 16)
				ctx.drawImage(readable, 0, 0, 16, 16)
				const data = ctx.getImageData(0, 0, 16, 16).data
				const white = (pixel: number) =>
					(data[pixel * 4] ?? 0) >= 245 && (data[pixel * 4 + 1] ?? 0) >= 245 && (data[pixel * 4 + 2] ?? 0) >= 245
				// A white backdrop surrounds the subject. Isolated highlights in a photo do not qualify.
				const corners = [0, 15, 240, 255].filter(white).length
				let whites = 0
				for (let i = 0; i < 256; i++) if (white(i)) whites++
				if (!disposed) setMultiply(corners >= 3 && whites / 256 >= 0.25)
			} catch {
				if (!disposed) setMultiply(false)
			}
		}
		panel.addEventListener('load', analyze, true)
		const observer = new MutationObserver(analyze)
		observer.observe(panel, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] })
		void analyze()
		return () => {
			disposed = true
			panel.removeEventListener('load', analyze, true)
			observer.disconnect()
		}
	}, [empty, mode, items.map((item) => item.id).join(',')])
	return (
		<Surface ref={panelRef} className={className} data-media-readability data-media-multiply={multiply}>
			{onSelect ? (
				empty ? (
					<button
						type="button"
						aria-label={selectLabel}
						aria-hidden="true"
						tabIndex={-1}
						onClick={onSelect}
						className="absolute inset-0 z-10 cursor-pointer rounded-lg border-0 bg-transparent p-0"
					/>
				) : (
					<PanelAction aria-label={selectLabel} onPress={onSelect} />
				)
			) : null}
			{empty ? (
				<>
					<div className="pointer-events-none absolute inset-x-4 top-4 z-20 text-body font-medium leading-5">
						{heading}
					</div>
					{onSelect ? (
						<div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
							<Button className="pointer-events-auto h-14 w-48 p-0" onPress={onSelect}>
								{selectLabel}
							</Button>
						</div>
					) : null}
					<p className="pointer-events-none absolute inset-x-4 bottom-4 z-20 m-0 text-small">
						<span className="font-medium text-fg">{emptyDescription}</span>
						<br />
						<span className="text-fg-muted">{emptyHint}</span>
					</p>
				</>
			) : (
				<MediaGallery
					items={mode === 'media' ? items.slice(0, 1) : items}
					mode={mode === 'carousel' ? 'carousel' : 'grid'}
					previousLabel={previousLabel}
					nextLabel={nextLabel}
					className={`pointer-events-none bg-transparent ${multiply ? 'mix-blend-multiply' : ''}`}
				/>
			)}
			{!empty && identity ? (
				<>
					<div className="pointer-events-none absolute inset-4 z-[2] grid grid-rows-[auto_minmax(0,1fr)_auto] gap-6 text-fg">
						<div className="flex items-start justify-between gap-2 text-body font-medium leading-5">
							<div className="min-w-0 flex-1">
								{heading ? <span className="mb-1 block text-caption">{heading}</span> : null}
								<p className="m-0 text-body font-medium leading-5">
									<MediaReadableText appearance={identity.titleAppearance}>{identity.title}</MediaReadableText>
								</p>
							</div>
							<span className="shrink-0 rounded-full bg-surface-muted px-2.5 py-1 text-caption text-fg [text-shadow:none]">
								{identity.count}
							</span>
						</div>
						<span aria-hidden="true" />
						<p className="m-0 text-small">
							<MediaReadableText appearance={identity.captionAppearance} secondary maxWidth={identity.captionWidth}>
								{identity.caption}
							</MediaReadableText>
						</p>
					</div>
				</>
			) : null}
		</Surface>
	)
}

export const MEDIA_TEXT_COLORS = ['auto', 'dark', 'white', 'gray'] as const
export const MEDIA_TEXT_BACKGROUNDS = ['auto', 'none', 'gradient', 'blur'] as const
export type MediaTextColor = (typeof MEDIA_TEXT_COLORS)[number]
export type MediaTextBackground = (typeof MEDIA_TEXT_BACKGROUNDS)[number]
export type MediaTextAppearance = { color?: MediaTextColor; background?: MediaTextBackground }
type Tone = Exclude<MediaTextColor, 'auto'>
export type MediaPixel = readonly [number, number, number]
const inks: Record<Tone, MediaPixel> = { dark: [23, 23, 23], white: [255, 255, 255], gray: [82, 82, 82] }
const luminance = (rgb: MediaPixel) =>
	rgb
		.map((v) => v / 255)
		.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
		.reduce((sum, v, i) => sum + v * ([0.2126, 0.7152, 0.0722][i] ?? 0), 0)
export function mediaContrast(a: MediaPixel, b: MediaPixel): number {
	const x = luminance(a),
		y = luminance(b)
	return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}
/** Conservative local contrast, including the final tint. Blur alone never counts as contrast protection. */
export function resolveMediaText(
	pixels: readonly MediaPixel[],
	appearance: MediaTextAppearance = {},
	_secondary = false,
) {
	const samples = pixels.length ? pixels : [[0, 0, 0] as const, [255, 255, 255] as const]
	const lightness = samples.map(luminance).sort((a, b) => a - b)
	const median = lightness[Math.floor(lightness.length / 2)] ?? 0.5
	const color: Tone =
		appearance.color && appearance.color !== 'auto' ? appearance.color : median >= 0.35 ? 'dark' : 'white'
	const score = Math.min(...samples.map((pixel) => mediaContrast(inks[color], pixel)))
	const range =
		(lightness[Math.floor(lightness.length * 0.9)] ?? median) -
		(lightness[Math.floor(lightness.length * 0.1)] ?? median)
	const busy = range > 0.25
	const requested = appearance.background && appearance.background !== 'auto' ? appearance.background : undefined
	const background = requested ?? (score >= 4.5 && !busy ? 'none' : 'gradient')
	const tint = color === 'white' ? 0 : 255
	const target = busy ? 7 : 4.5
	let opacity = 0
	if (background !== 'none') {
		while (
			opacity < 1 &&
			samples.some(
				(pixel) =>
					mediaContrast(
						inks[color],
						pixel.map((value) => value * (1 - opacity) + tint * opacity) as [number, number, number],
					) < target,
			)
		)
			opacity = Math.min(1, opacity + 0.01)
		if (busy && color !== 'white') opacity = Math.max(0.8, opacity)
	}
	return { color, background, opacity, tint }
}

const toneClass: Record<Tone, string> = { dark: 'text-neutral-900', white: 'text-white', gray: 'text-neutral-600' }

/** Used inside the existing media panel. Each text region measures its own visible image crop. */
export function MediaReadableText({
	children,
	appearance,
	secondary = false,
	maxWidth,
}: {
	children: ReactNode
	appearance?: MediaTextAppearance
	secondary?: boolean
	maxWidth?: number
}) {
	const ref = useRef<HTMLSpanElement>(null)
	const [pixels, setPixels] = useState<MediaPixel[]>([])
	const [panelBox, setPanelBox] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
	const [analysisError, setAnalysisError] = useState<string | null>(null)
	useEffect(() => {
		const text = ref.current,
			panel = text?.closest<HTMLElement>('[data-media-readability]')
		if (!text || !panel) return
		let frame = 0
		const measure = () => {
			cancelAnimationFrame(frame)
			frame = requestAnimationFrame(async () => {
				const image = panel.querySelector<HTMLImageElement>('img')
				if (!image?.complete || !image.naturalWidth) {
					setPixels([])
					return
				}
				const box = text.getBoundingClientRect(),
					rect = image.getBoundingClientRect()
				const bounds = panel.getBoundingClientRect()
				setPanelBox({
					left: bounds.left - box.left,
					top: bounds.top - box.top,
					width: bounds.width,
					height: bounds.height,
				})
				if (!box.width || !box.height || !rect.width || !rect.height) return
				const imageStyle = getComputedStyle(image)
				const scale =
					imageStyle.objectFit === 'contain'
						? Math.min(rect.width / image.naturalWidth, rect.height / image.naturalHeight)
						: Math.max(rect.width / image.naturalWidth, rect.height / image.naturalHeight)
				const position = imageStyle.objectPosition
					.split(' ')
					.map((part) => (part.endsWith('%') ? parseFloat(part) / 100 : 0.5))
				const sx = (image.naturalWidth - rect.width / scale) * (position[0] ?? 0.5) + (box.left - rect.left) / scale
				const sy = (image.naturalHeight - rect.height / scale) * (position[1] ?? 0.5) + (box.top - rect.top) / scale
				const canvas = document.createElement('canvas')
				canvas.width = 32
				canvas.height = 16
				const ctx = canvas.getContext('2d', { willReadFrequently: true })
				if (!ctx) return
				try {
					ctx.fillStyle = getComputedStyle(panel).backgroundColor
					ctx.fillRect(0, 0, 32, 16)
					ctx.globalCompositeOperation = image.closest('.mix-blend-multiply') ? 'multiply' : 'source-over'
					const readable = await readableMediaImage(image)
					if (!text.isConnected) return
					ctx.drawImage(readable, sx, sy, box.width / scale, box.height / scale, 0, 0, 32, 16)
					const data = ctx.getImageData(0, 0, 32, 16).data,
						next: MediaPixel[] = []
					for (let i = 0; i < data.length; i += 4) next.push([data[i] ?? 255, data[i + 1] ?? 255, data[i + 2] ?? 255])
					setAnalysisError(null)
					setPixels(next)
				} catch (error) {
					setAnalysisError(error instanceof Error ? error.message : 'Unavailable')
					setPixels([
						[0, 0, 0],
						[255, 255, 255],
					])
				}
			})
		}
		const resize = new ResizeObserver(measure)
		resize.observe(panel)
		resize.observe(text)
		const mutation = new MutationObserver(measure)
		mutation.observe(panel, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'class'] })
		panel.addEventListener('load', measure, true)
		panel.addEventListener('error', measure, true)
		measure()
		return () => {
			cancelAnimationFrame(frame)
			resize.disconnect()
			mutation.disconnect()
			panel.removeEventListener('load', measure, true)
			panel.removeEventListener('error', measure, true)
		}
	}, [children])
	const resolved = resolveMediaText(pixels, appearance, secondary)
	const tint = `rgba(${resolved.tint},${resolved.tint},${resolved.tint},${resolved.opacity})`
	const effectStyle: CSSProperties = panelBox
		? {
				left: panelBox.left,
				top: panelBox.top,
				width: panelBox.width,
				height: panelBox.height,
				background: tint,
				maskImage: `radial-gradient(ellipse 110% 95% at left ${secondary ? 'bottom' : 'top'},black 0%,black 40%,rgba(0,0,0,.8) 55%,rgba(0,0,0,.35) 75%,transparent 100%)`,
			}
		: {
				inset: 'calc(var(--spacing) * -12)',
				background: `radial-gradient(ellipse at center,${tint} 0%,${tint} 35%,transparent 75%)`,
			}

	return (
		<span
			ref={ref}
			className={`relative isolate block w-fit max-w-full ${toneClass[resolved.color]}`}
			style={{ maxWidth: maxWidth ? `${maxWidth * 100}%` : undefined, textShadow: 'none' }}
			data-media-analysis-error={analysisError ?? undefined}
			data-media-text-color={resolved.color}
			data-media-text-background={resolved.background}
		>
			{resolved.background !== 'none' ? (
				<span
					aria-hidden="true"
					className={`pointer-events-none absolute -z-10 ${panelBox ? '' : ''} ${resolved.background === 'blur' ? 'backdrop-blur-sm' : ''}`}
					style={effectStyle}
				/>
			) : null}
			{children}
		</span>
	)
}

// A CORS-enabled copy keeps image analysis separate from the visible preview.
const readableMediaImages = new WeakMap<HTMLImageElement, { src: string; image: Promise<HTMLImageElement> }>()
function readableMediaImage(source: HTMLImageElement): Promise<HTMLImageElement> {
	const src = source.currentSrc || source.src
	const cached = readableMediaImages.get(source)
	if (cached?.src === src) return cached.image
	const image = new Promise<HTMLImageElement>((resolve, reject) => {
		const copy = new Image()
		copy.crossOrigin = 'anonymous'
		copy.onload = () => resolve(copy)
		copy.onerror = () => reject(new Error('Media analysis unavailable'))
		copy.src = src
	})
	readableMediaImages.set(source, { src, image })
	return image
}
