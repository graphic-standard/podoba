import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react'

/**
 * Preview loading and reveal motion, ported from gs-platform `PreviewSkeletonGradient`
 * and `TemplatePreview`'s particulate reveal.
 *
 * - {@link PreviewSkeleton}: the mint shimmer shown while a template preview renders
 *   (80deg gradient, 240% background, 2400ms ease-in-out pan). Pair it with
 *   {@link useMinimumVisible} for the source 500ms minimum.
 * - {@link PreviewReveal}: wraps rendered artwork. When `revealKey` changes (a new
 *   preview decoded) or the artwork is pressed, the artwork dims to 22% with
 *   `saturate(.7) contrast(.86)` for `durationMs` (source 1400ms) while a blurred
 *   green/blue sweep and 64 resolving particles play over it, then fades back in.
 *
 * All of it is ornamental: every layer is `aria-hidden`, nothing here carries content,
 * and under `prefers-reduced-motion: reduce` neither the timed states nor any motion
 * run (the skeleton shows the source static gradient, the reveal never engages).
 * Colours are the source literals; the skeleton is a fixed light surface by design.
 */

function usePrefersReducedMotion(): boolean {
	const [reduce, setReduce] = useState(false)
	useEffect(() => {
		if (typeof window === 'undefined' || !window.matchMedia) return
		const media = window.matchMedia('(prefers-reduced-motion: reduce)')
		const change = () => setReduce(media.matches)
		change()
		media.addEventListener('change', change)
		return () => media.removeEventListener('change', change)
	}, [])
	return reduce
}

/**
 * Keeps `active` true for at least `minMs` after it turns on (source 500ms skeleton
 * minimum), so a cached preview does not flash a one-frame skeleton. Under reduced
 * motion it returns `active` unchanged.
 */
export function useMinimumVisible(active: boolean, minMs = 500): boolean {
	const reduce = usePrefersReducedMotion()
	const [held, setHeld] = useState(active)
	const since = useRef<number | null>(active ? Date.now() : null)
	useEffect(() => {
		if (reduce) {
			setHeld(active)
			return
		}
		if (active) {
			if (since.current === null) since.current = Date.now()
			setHeld(true)
			return
		}
		if (since.current === null) {
			setHeld(false)
			return
		}
		const remaining = minMs - (Date.now() - since.current)
		if (remaining <= 0) {
			since.current = null
			setHeld(false)
			return
		}
		const timer = setTimeout(() => {
			since.current = null
			setHeld(false)
		}, remaining)
		return () => clearTimeout(timer)
	}, [active, minMs, reduce])
	return reduce ? active : held
}

const SKELETON_ANIMATED =
	'linear-gradient(80deg, #ffffff 0%, #ffffff 12.5%, #c7fee0 27.5%, #ffffff 41.5%, #ffffff 50%, #ffffff 62.5%, #c7fee0 77.5%, #ffffff 91.5%, #ffffff 100%)'
const SKELETON_STATIC = 'linear-gradient(80deg, #ffffff 25%, #c7fee0 55%, #ffffff 83%)'

export interface PreviewSkeletonProps {
	/** Accessible status text (translated by the caller), e.g. "Rendering preview". */
	label?: string
	className?: string
}

/** The source mint shimmer. Fills its positioned parent. */
export function PreviewSkeleton({ label, className }: PreviewSkeletonProps) {
	const reduce = usePrefersReducedMotion()
	const style: CSSProperties = reduce
		? { backgroundImage: SKELETON_STATIC, backgroundSize: '100% 100%', backgroundPosition: '50% 50%' }
		: { backgroundImage: SKELETON_ANIMATED, backgroundSize: '240% 240%' }
	return (
		<div
			role={label ? 'status' : undefined}
			aria-label={label}
			aria-hidden={label ? undefined : true}
			data-preview-skeleton=""
			className={['absolute inset-0 overflow-hidden', reduce ? '' : 'animate-preview-skeleton-shimmer', className]
				.filter(Boolean)
				.join(' ')}
			style={style}
		/>
	)
}

const PARTICLES = Array.from({ length: 64 }, (_, index) => ({
	x: 3 + ((index * 37) % 94),
	y: 3 + ((index * 53) % 94),
	size: 6 + (index % 7) * 2,
	dx: ((index * 29) % 48) - 24,
	dy: ((index * 17) % 44) - 22,
	delay: (index % 16) * 45,
	duration: 1200 + (index % 5) * 140,
	color: index % 5 === 0 ? 'var(--color-accent-blue)' : index % 3 === 0 ? 'var(--color-brand-green)' : '#0d0d0d',
	square: index % 4 === 3,
	wide: index % 6 === 5,
}))

export interface PreviewRevealProps {
	children: ReactNode
	/**
	 * Changing this (e.g. to the decoded preview URL or a render revision) plays the
	 * reveal. `null`/`undefined` means nothing is rendered yet.
	 */
	revealKey?: string | number | null
	/** How long the reveal stays visible (source 1400ms). */
	durationMs?: number
	/** Replay the reveal when the artwork is pressed (source behaviour, default true). */
	replayOnPress?: boolean
	className?: string
}

export function PreviewReveal({ children, revealKey, durationMs = 1400, replayOnPress = true, className }: PreviewRevealProps) {
	const reduce = usePrefersReducedMotion()
	const [revealing, setRevealing] = useState(false)
	const [run, setRun] = useState(0)
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

	const play = () => {
		if (reduce) return
		setRun((n) => n + 1)
		setRevealing(true)
		if (timer.current) clearTimeout(timer.current)
		timer.current = setTimeout(() => setRevealing(false), durationMs)
	}

	useEffect(() => {
		if (revealKey === null || revealKey === undefined) return
		play()
		// Replays only when the artwork identity changes; `play` is recreated each render.
	}, [revealKey])

	useEffect(() => () => {
		if (timer.current) clearTimeout(timer.current)
	}, [])

	const active = revealing && !reduce
	return (
		<div
			className={['relative', className].filter(Boolean).join(' ')}
			data-revealing={active || undefined}
			onPointerDown={replayOnPress ? play : undefined}
		>
			<div
				className={`h-full w-full transition-[opacity,filter] duration-220 ease-[ease] motion-reduce:transition-none ${
					active ? 'opacity-22 saturate-70 contrast-86' : ''
				}`}
			>
				{children}
			</div>
			<div
				aria-hidden="true"
				className={`pointer-events-none absolute inset-0 z-2 transition-opacity duration-180 ease-[ease] ${active ? 'opacity-100' : 'opacity-0'}`}
			>
				{active ? (
					<div
						key={run}
						className="absolute inset-0 overflow-hidden"
						style={{
							background:
								'radial-gradient(circle at 18% 24%, color-mix(in srgb, var(--color-accent-blue) 18%, transparent), transparent 22%), radial-gradient(circle at 82% 74%, color-mix(in srgb, var(--color-brand-green) 22%, transparent), transparent 24%)',
						}}
					>
						<div
							className="absolute -top-[36%] -bottom-[36%] -left-[32%] w-[44%] animate-preview-sweep opacity-90 blur-[14px]"
							style={{
								background:
									'linear-gradient(90deg, transparent 0%, color-mix(in srgb, #ffffff 52%, transparent) 42%, color-mix(in srgb, var(--color-brand-green) 58%, transparent) 54%, color-mix(in srgb, var(--color-accent-blue) 32%, transparent) 66%, transparent 100%)',
							}}
						/>
						{PARTICLES.map((p, index) => (
							<span
								// Fixed, index-derived particle field; the order never changes.
								key={index}
								className={`absolute animate-preview-particle opacity-58 mix-blend-screen ${p.square ? 'rounded-[4px] rotate-24' : p.wide ? 'rounded-[4px]' : 'rounded-full'}`}
								style={
									{
										left: `${p.x}%`,
										top: `${p.y}%`,
										width: p.wide ? p.size * 1.8 : p.size,
										height: p.size,
										marginLeft: -p.size / 2,
										marginTop: -p.size / 2,
										background: p.color,
										boxShadow: `0 0 0 1px color-mix(in srgb, #ffffff 38%, transparent), 0 0 18px color-mix(in srgb, ${p.color} 72%, transparent)`,
										animationDuration: `${p.duration}ms`,
										animationDelay: `${p.delay}ms`,
										'--particle-dx': `${p.dx}px`,
										'--particle-dy': `${p.dy}px`,
									} as CSSProperties
								}
							/>
						))}
					</div>
				) : null}
			</div>
		</div>
	)
}
