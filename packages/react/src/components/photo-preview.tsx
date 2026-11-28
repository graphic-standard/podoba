import { useEffect, useRef, useState } from 'react'
import { clampPhotoPan, photoPreviewGeometry } from './photo-preview-geometry'

export type PhotoPreviewProps = {
	src: string
	/** The photo's alt text. */
	name: string
	onError?: () => void
	/** The photo's natural size, once it has loaded. */
	onDimensions?: (size: { width: number; height: number }) => void
	/**
	 * Accessible name of the stage; it should say how to zoom and pan. Default: "Photo
	 * preview. Scroll down or press plus to fill the frame. Drag or use arrow keys to move
	 * the zoomed photo. Scroll up or press minus to fit."
	 */
	zoomHint?: string
}

const defaultZoomHint =
	'Photo preview. Scroll down or press plus to fill the frame. Drag or use arrow keys to move the zoomed photo. Scroll up or press minus to fit.'

/**
 * A photo on a preview stage, in two states. `contain` shows the whole photo with an inset;
 * `cover` fills the frame and can be dragged (or moved with the arrow keys) to show the
 * cropped edges, never past them. Wheel down or `+`/`=` fills; wheel up, `-` or `0` fits.
 * A ctrl/cmd wheel (browser zoom) and a sideways wheel are left alone. Fills its
 * positioned parent (`absolute inset-0`).
 */
export function PhotoPreview({ src, name, onError, onDimensions, zoomHint = defaultZoomHint }: PhotoPreviewProps) {
	const [fit, setFit] = useState<'contain' | 'cover'>('contain')
	const surface = useRef<HTMLDivElement>(null)
	const [surfaceSize, setSurfaceSize] = useState({ width: 0, height: 0 })
	const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
	const [pan, setPan] = useState({ x: 0, y: 0 })
	const [dragging, setDragging] = useState(false)
	const drag = useRef<{ id: number; x: number; y: number; startX: number; startY: number } | null>(null)

	useEffect(() => {
		const node = surface.current
		if (!node) return
		const measure = () => setSurfaceSize({ width: node.clientWidth, height: node.clientHeight })
		measure()
		if (typeof ResizeObserver === 'undefined') {
			window.addEventListener('resize', measure)
			return () => window.removeEventListener('resize', measure)
		}
		const observer = new ResizeObserver(measure)
		observer.observe(node)
		return () => observer.disconnect()
	}, [])

	const geometry = photoPreviewGeometry(surfaceSize.width, surfaceSize.height, imageSize.width, imageSize.height)
	const clampPan = (x: number, y: number) =>
		geometry
			? clampPhotoPan(x, y, surfaceSize.width, surfaceSize.height, geometry.width * geometry.coverScale, geometry.height * geometry.coverScale)
			: { x: 0, y: 0 }

	// Back to the centre on fit; on a resize in cover, pull the pan back inside the new edges.
	useEffect(() => {
		if (fit === 'contain') {
			drag.current = null
			setDragging(false)
			setPan({ x: 0, y: 0 })
			return
		}
		setPan((previous) => {
			const next = clampPan(previous.x, previous.y)
			return next.x === previous.x && next.y === previous.y ? previous : next
		})
		// clampPan is derived from exactly these sizes, so they are the dependencies.
	}, [fit, surfaceSize.width, surfaceSize.height, imageSize.width, imageSize.height])

	// A non-passive listener, so the wheel zooms the photo instead of scrolling the page.
	useEffect(() => {
		const node = surface.current
		if (!node) return
		const wheel = (event: WheelEvent) => {
			if (event.ctrlKey || event.metaKey || event.deltaY === 0 || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return
			event.preventDefault()
			event.stopPropagation()
			setFit(event.deltaY > 0 ? 'cover' : 'contain')
		}
		node.addEventListener('wheel', wheel, { passive: false })
		return () => node.removeEventListener('wheel', wheel)
	}, [])

	const endDrag = (pointerId: number) => {
		if (drag.current?.id !== pointerId) return
		drag.current = null
		setDragging(false)
	}

	return (
		<div
			ref={surface}
			data-testid="photo-preview"
			data-fit={fit}
			tabIndex={0}
			role="group"
			aria-label={zoomHint}
			className={`absolute inset-0 flex items-center justify-center overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${fit === 'cover' && geometry ? (dragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
			style={{ touchAction: fit === 'cover' ? 'none' : 'auto' }}
			onPointerDown={(event) => {
				if (fit !== 'cover' || !geometry || event.button !== 0) return
				event.preventDefault()
				event.currentTarget.focus({ preventScroll: true })
				event.currentTarget.setPointerCapture?.(event.pointerId)
				drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, startX: pan.x, startY: pan.y }
				setDragging(true)
			}}
			onPointerMove={(event) => {
				const start = drag.current
				if (!start || start.id !== event.pointerId || fit !== 'cover') return
				setPan(clampPan(start.startX + event.clientX - start.x, start.startY + event.clientY - start.y))
			}}
			onPointerUp={(event) => endDrag(event.pointerId)}
			onPointerCancel={(event) => endDrag(event.pointerId)}
			onLostPointerCapture={(event) => endDrag(event.pointerId)}
			onKeyDown={(event) => {
				if (event.key === '+' || event.key === '=') {
					event.preventDefault()
					setFit('cover')
				}
				if (event.key === '-' || event.key === '0') {
					event.preventDefault()
					setFit('contain')
				}
				const movement: Record<string, [number, number]> = { ArrowLeft: [-24, 0], ArrowRight: [24, 0], ArrowUp: [0, -24], ArrowDown: [0, 24] }
				const delta = movement[event.key]
				if (fit === 'cover' && delta) {
					event.preventDefault()
					setPan((previous) => clampPan(previous.x + delta[0], previous.y + delta[1]))
				}
			}}
		>
			<img
				src={src}
				alt={name}
				draggable={false}
				onError={onError}
				onLoad={(event) => {
					const size = { width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight }
					setImageSize(size)
					onDimensions?.(size)
				}}
				className={
					geometry
						? `pointer-events-none block max-w-none shrink-0 ${dragging ? '' : 'transition-transform duration-500 ease-in-out motion-reduce:transition-none'}`
						: `pointer-events-none h-full w-full ${fit === 'cover' ? 'object-cover' : 'object-contain p-8'}`
				}
				style={
					geometry
						? {
								width: geometry.width,
								height: geometry.height,
								transform: `translate(${pan.x}px, ${pan.y}px) scale(${fit === 'cover' ? geometry.coverScale : 1})`,
							}
						: undefined
				}
			/>
			{fit === 'cover' ? <span aria-hidden="true" className="pointer-events-none absolute right-4 top-4 size-9 rounded-md bg-surface-inverted/50" /> : null}
		</div>
	)
}
