import { useEffect, useRef, useState, type ElementType } from 'react'

/**
 * CountUp — animates a number from 0 up to `value` on mount (and whenever `value`
 * changes), for the subtle "counting up" effect on dashboard stats. easeOutCubic over
 * ~900ms by default. Respects `prefers-reduced-motion` (renders the final value
 * immediately). Presentational only — pass formatting via `format`.
 */
export interface CountUpProps {
	/** Target value to count up to. */
	value: number
	/** Animation duration in ms (default 900). */
	durationMs?: number
	/** Format the displayed number (default `toLocaleString`). */
	format?: (n: number) => string
	/** Element to render as (default `span`). */
	as?: ElementType
	className?: string
}

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3)

export function CountUp({
	value,
	durationMs = 900,
	format = (n) => n.toLocaleString(),
	as: Tag = 'span',
	className,
}: CountUpProps) {
	const [display, setDisplay] = useState(value)
	const rafRef = useRef<number | null>(null)
	const startRef = useRef<number | null>(null)

	useEffect(() => {
		if (typeof window === 'undefined') return
		const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
		if (reduce || durationMs <= 0) {
			setDisplay(value)
			return
		}
		startRef.current = null
		const tick = (now: number) => {
			if (startRef.current === null) startRef.current = now
			const progress = Math.min(1, (now - startRef.current) / durationMs)
			setDisplay(Math.round(value * easeOutCubic(progress)))
			if (progress < 1) rafRef.current = requestAnimationFrame(tick)
		}
		rafRef.current = requestAnimationFrame(tick)
		return () => {
			if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
		}
	}, [value, durationMs])

	return (
		<Tag className={className} aria-label={format(value)}>
			{format(display)}
		</Tag>
	)
}
