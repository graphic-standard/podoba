import { type PointerEvent, useEffect, useRef, useState } from 'react'
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
	 * preview. Double-tap, scroll down or press plus to fill the frame. Drag or use the
	 * arrow keys to move the zoomed photo. Double-tap again, scroll up or press minus to fit."
	 */
	zoomHint?: string
}

const defaultZoomHint =
	'Photo preview. Double-tap, scroll down or press plus to fill the frame. Drag or use the arrow keys to move the zoomed photo. Double-tap again, scroll up or press minus to fit.'

/** A smaller wheel step is ignored (e.g. the reverse tail of a trackpad's momentum). */
const WHEEL_THRESHOLD = 4
/** Two taps this close in time (ms) and space (px) are a double-tap. */
const DOUBLE_TAP_MS = 300
const DOUBLE_TAP_PX = 30
/** A pointer that moves further than this between down and up was a drag, not a tap. */
const TAP_SLOP_PX = 10

/**
 * A photo on a preview stage, in two states. `contain` shows the whole photo with an inset;
 * `cover` fills the frame and can be dragged (or moved with the arrow keys) to show the
 * cropped edges, never past them. A double-tap (or double-click) toggles the two. Wheel
 * down or `+`/`=` fills; wheel up, `-` or `0` fits. A wheel that would not change the state
 * scrolls the page as usual, and a ctrl/cmd wheel (browser zoom) or a sideways wheel is
 * left alone. A new `src` starts fitted. Fills its positioned parent (`absolute inset-0`).
 */
export function PhotoPreview(props: PhotoPreviewProps) {
	// A new file starts fresh: fit, pan and the measured size do not carry over to it.
	return <PhotoPreviewStage key={props.src} {...props} />
}

function PhotoPreviewStage({ src, name, onError, onDimensions, zoomHint = defaultZoomHint }: PhotoPreviewProps) {
	const [fit, setFit] = useState<'contain' | 'cover'>('contain')
	const fitRef = useRef(fit)
	fitRef.current = fit
	const tap = useRef<{ x: number; y: number } | null>(null)
	// The last pointer's type. Browsers also send a dblclick after a touch double-tap,
	// which the tap detection already handled, so dblclick only counts for a mouse.
	const lastPointerType = useRef('mouse')
	const lastTap = useRef<{ time: number; x: number; y: number } | null>(null)
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

	// A non-passive listener, so a wheel that changes the state does not also scroll the page.
	useEffect(() => {
		const node = surface.current
		if (!node) return
		const wheel = (event: WheelEvent) => {
			if (event.ctrlKey || event.metaKey || Math.abs(event.deltaY) < WHEEL_THRESHOLD || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return
			const next = event.deltaY > 0 ? 'cover' : 'contain'
			if (next === fitRef.current) return
			event.preventDefault()
			event.stopPropagation()
			setFit(next)
		}
		node.addEventListener('wheel', wheel, { passive: false })
		return () => node.removeEventListener('wheel', wheel)
	}, [])

	const toggleFit = () => setFit((current) => (current === 'cover' ? 'contain' : 'cover'))

	const endDrag = (pointerId: number) => {
		if (drag.current?.id !== pointerId) return
		drag.current = null
		setDragging(false)
	}

	// Touch and pen have no double-click, so a double-tap is detected from pointer ups:
	// two short taps close together. Mouse uses onDoubleClick.
	const tapUp = (event: PointerEvent) => {
		const start = tap.current
		tap.current = null
		if (event.pointerType === 'mouse' || !start) return
		if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > TAP_SLOP_PX) return
		const previous = lastTap.current
		const now = event.timeStamp
		if (previous && now - previous.time <= DOUBLE_TAP_MS && Math.hypot(event.clientX - previous.x, event.clientY - previous.y) <= DOUBLE_TAP_PX) {
			lastTap.current = null
			toggleFit()
			return
		}
		lastTap.current = { time: now, x: event.clientX, y: event.clientY }
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
			// `manipulation` turns off the browser's own double-tap zoom, so the double-tap is ours.
			style={{ touchAction: fit === 'cover' ? 'none' : 'manipulation' }}
			onDoubleClick={(event) => {
				event.preventDefault()
				if (lastPointerType.current === 'mouse') toggleFit()
			}}
			onPointerDown={(event) => {
				lastPointerType.current = event.pointerType || 'mouse'
				tap.current = { x: event.clientX, y: event.clientY }
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
			onPointerUp={(event) => {
				endDrag(event.pointerId)
				tapUp(event)
			}}
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
