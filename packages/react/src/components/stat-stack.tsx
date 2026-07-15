import type { ReactNode } from 'react'
import { CountUp } from './count-up'

/**
 * StatStack — a "production compass" infographic: a fanned deck of coloured rounded
 * bars, each showing an animated count + label (e.g. 55 Progress · 36 Done · 26
 * Review). Bars cascade with a left inset that shrinks top→bottom and overlap
 * vertically, later bars in front. The counts animate up via <CountUp>. Sits inside a
 * dark data tile. Presentational only.
 */
export type StatStackTone = 'neutral' | 'green' | 'mint' | 'yellow' | 'pink' | 'blue'

const TONE: Record<StatStackTone, string> = {
	// Fixed decorative chip colours (they sit on a dark tile in both themes, so they
	// do NOT theme-flip); dark text reads on all of them.
	neutral: 'bg-[#eae7e0] text-fg',
	green: 'bg-brand-green text-fg',
	mint: 'bg-accent-mint text-fg',
	yellow: 'bg-accent-yellow text-fg',
	pink: 'bg-accent-pink text-fg',
	blue: 'bg-accent-blue text-white',
}

export interface StatStackSegment {
	value: number
	label: ReactNode
	tone: StatStackTone
}

export interface StatStackProps {
	segments: StatStackSegment[]
	className?: string
}

export function StatStack({ segments, className }: StatStackProps) {
	const n = segments.length
	return (
		<div className={['flex flex-col', className].filter(Boolean).join(' ')}>
			{segments.map((s, i) => (
				<div
					key={i}
					className={[
						'flex items-baseline gap-2 rounded-lg px-5 py-4 shadow-sm',
						TONE[s.tone],
					].join(' ')}
					style={{
						// Cascade: most-inset at the top, flush-left at the bottom; overlap the
						// bar above; later bars sit in front.
						marginLeft: `${(n - 1 - i) * 1.75}rem`,
						marginRight: `${i * 1.25}rem`,
						marginTop: i === 0 ? 0 : '-1rem',
						zIndex: i + 1,
					}}
				>
					<CountUp value={s.value} className="text-heading1 font-medium leading-none" />
					<span className="text-heading3 font-medium leading-none">{s.label}</span>
				</div>
			))}
		</div>
	)
}
