import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { MediaPreviewScene } from './media-collection'

export interface ImageFocusRegion {
	x: number
	y: number
	width: number
	height: number
}
interface Pose {
	scale: number
	x: number
	y: number
}
/** A document stage with cursor-anchored wheel zoom and keyboard/pointer panning. */
export function ZoomableImage({
	src,
	alt,
	label,
	region,
	regionLabel,
	onError,
}: {
	src: string
	alt: string
	label: string
	region?: ImageFocusRegion
	regionLabel?: string
	onError?: () => void
}) {
	const viewport = useRef<HTMLDivElement>(null)
	const [size, setSize] = useState({ width: 0, height: 0 })
	const [pose, setPose] = useState<Pose>({ scale: 1, x: 0, y: 0 })
	const poseRef = useRef(pose),
		geometry = useRef({ width: 0, height: 0, fit: 1, max: 6 })
	const drag = useRef<{ id: number; x: number; y: number; pose: Pose } | null>(null)
	const commit = (next: Pose) => {
		poseRef.current = next
		setPose(next)
	}
	useEffect(() => {
		const node = viewport.current
		if (!node || !size.width || !size.height) return
		const measure = () => {
			const width = node.clientWidth,
				height = node.clientHeight
			if (!width || !height) return
			const fit = Math.min(width / size.width, height / size.height),
				max = Math.max(fit * 6, 1)
			geometry.current = { width, height, fit, max }
			const scale = region
				? Math.min(
						max,
						Math.max(
							fit,
							Math.min(width / (size.width * region.width * 1.2), height / (size.height * region.height * 1.5)),
						),
					)
				: fit
			commit({
				scale,
				x: width / 2 - (region ? region.x + region.width / 2 : 0.5) * size.width * scale,
				y: height / 2 - (region ? region.y + region.height / 2 : 0.5) * size.height * scale,
			})
		}
		measure()
		const observer = new ResizeObserver(measure)
		observer.observe(node)
		const wheel = (event: WheelEvent) => {
			event.preventDefault()
			event.stopPropagation()
			const rect = node.getBoundingClientRect(),
				old = poseRef.current,
				g = geometry.current
			const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? g.height : 1)
			const scale = Math.max(g.fit, Math.min(g.max, old.scale * Math.exp(-Math.max(-80, Math.min(80, delta)) * 0.0015)))
			const x = event.clientX - rect.left,
				y = event.clientY - rect.top,
				ratio = scale / old.scale
			commit(
				scale <= g.fit
					? { scale: g.fit, x: (g.width - size.width * g.fit) / 2, y: (g.height - size.height * g.fit) / 2 }
					: { scale, x: x - (x - old.x) * ratio, y: y - (y - old.y) * ratio },
			)
		}
		node.addEventListener('wheel', wheel, { passive: false })
		return () => {
			observer.disconnect()
			node.removeEventListener('wheel', wheel)
		}
	}, [src, size.width, size.height, region?.x, region?.y, region?.width, region?.height])
	const end = (event: PointerEvent<HTMLDivElement>) => {
		if (drag.current?.id === event.pointerId) drag.current = null
	}
	return (
		<MediaPreviewScene
			ref={viewport}
			role="group"
			tabIndex={0}
			aria-label={label}
			className="h-full w-full touch-none p-0 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
			style={{ overscrollBehavior: 'contain', cursor: 'grab' }}
			onKeyDown={(event) => {
				const old = poseRef.current,
					g = geometry.current
				if (['+', '=', '-'].includes(event.key)) {
					event.preventDefault()
					const scale = Math.max(g.fit, Math.min(g.max, old.scale * (event.key === '-' ? 1 / 1.15 : 1.15))),
						ratio = scale / old.scale
					commit({
						scale,
						x: g.width / 2 - (g.width / 2 - old.x) * ratio,
						y: g.height / 2 - (g.height / 2 - old.y) * ratio,
					})
				}
				const movement: Record<string, readonly [number, number]> = {
					ArrowLeft: [28, 0],
					ArrowRight: [-28, 0],
					ArrowUp: [0, 28],
					ArrowDown: [0, -28],
				}
				const move = movement[event.key]
				if (move) {
					event.preventDefault()
					commit({ ...old, x: old.x + move[0], y: old.y + move[1] })
				}
			}}
			onPointerDown={(event) => {
				if (event.button !== 0) return
				event.preventDefault()
				event.currentTarget.focus({ preventScroll: true })
				event.currentTarget.setPointerCapture(event.pointerId)
				drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, pose: poseRef.current }
			}}
			onPointerMove={(event) => {
				const start = drag.current
				if (start?.id === event.pointerId)
					commit({
						...start.pose,
						x: start.pose.x + event.clientX - start.x,
						y: start.pose.y + event.clientY - start.y,
					})
			}}
			onPointerUp={end}
			onPointerCancel={end}
			onLostPointerCapture={end}
		>
			<div
				className="absolute start-0 top-0 select-none"
				style={{
					width: size.width || '100%',
					height: size.height || '100%',
					transform: `translate(${pose.x}px,${pose.y}px) scale(${pose.scale})`,
					transformOrigin: '0 0',
				}}
			>
				<img
					key={src}
					src={src}
					alt={alt}
					draggable={false}
					className="pointer-events-none block h-full w-full max-w-none"
					onLoad={(event) =>
						setSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })
					}
					onError={onError}
				/>
				{region ? (
					<div
						role="img"
						aria-label={regionLabel}
						data-testid="document-evidence-region"
						className="pointer-events-none absolute border border-brand-green bg-brand-green/5"
						style={{
							insetInlineStart: `${region.x * 100}%`,
							top: `${region.y * 100}%`,
							width: `${region.width * 100}%`,
							height: `${region.height * 100}%`,
						}}
					/>
				) : null}
			</div>
		</MediaPreviewScene>
	)
}
