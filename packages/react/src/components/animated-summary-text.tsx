import type { CSSProperties, ReactNode } from 'react'

/**
 * AnimatedSummaryText: the gs `SummaryContentTile` sentence reveal (Tasks summary,
 * project and brand dashboard summary tiles).
 *
 * Every character is its own `inline-block` token playing `summary-token-reveal`
 * (680ms `cubic-bezier(0.19, 1, 0.22, 1)`: opacity 0, 8px down and 6px blur, clear
 * by 58%, settled at 100%), delayed `min(index * 22, 1800)ms`. Words are
 * `inline-block whitespace-nowrap` so a word never breaks mid-reveal, and a `\n`
 * in the text becomes a line break (pass an already balanced sentence).
 *
 * Accessibility: the per-character copy is `aria-hidden`; assistive technology
 * reads one visually hidden string instead of single letters. Under
 * `prefers-reduced-motion: reduce` no token animates and the sentence is simply
 * shown. The reveal replays whenever `text` changes.
 *
 * Renders inline (`<span>`): place it inside the caller's paragraph, which owns the
 * type scale, colour and `max-width`. Presentational only: no i18n, no data.
 */

export interface AnimatedSummarySegment {
	text: string
	/** Highlighted runs take `highlightClassName` (gs `summaryHighlight`, primary ink). */
	highlighted?: boolean
}

export interface AnimatedSummaryTextProps {
	/** The full sentence. `\n` renders as a line break. */
	text: string
	/**
	 * Optional highlighted runs. Their texts joined must equal `text`; when omitted the
	 * whole sentence is one plain segment.
	 */
	segments?: ReadonlyArray<AnimatedSummarySegment>
	/** Class for highlighted words (e.g. `text-fg`). */
	highlightClassName?: string
	/** Per-character delay step (source 22ms). */
	stepMs?: number
	/** Delay ceiling (source 1800ms). */
	maxDelayMs?: number
	className?: string
}

const tokenClass = 'inline-block animate-summary-token will-change-[opacity,filter,transform] motion-reduce:animate-none'

export function AnimatedSummaryText({
	text,
	segments,
	highlightClassName,
	stepMs = 22,
	maxDelayMs = 1800,
	className,
}: AnimatedSummaryTextProps) {
	const parts = segments && segments.length > 0 ? segments : [{ text, highlighted: false }]
	let tokenIndex = 0
	const nodes: ReactNode[] = []

	parts.forEach((segment, segmentIndex) => {
		segment.text.split(/(\n|\s+)/).forEach((part, partIndex) => {
			if (!part) return
			const key = `${segmentIndex}-${partIndex}`
			if (part === '\n') {
				nodes.push(<br key={`${key}-br`} />)
				return
			}
			if (/^\s+$/.test(part)) {
				nodes.push(part)
				return
			}
			const wordClass = ['inline-block whitespace-nowrap', segment.highlighted ? highlightClassName : '']
				.filter(Boolean)
				.join(' ')
			nodes.push(
				<span key={key} className={wordClass}>
					{Array.from(part).map((character, characterIndex) => {
						const style: CSSProperties = { animationDelay: `${Math.min(tokenIndex * stepMs, maxDelayMs)}ms` }
						tokenIndex += 1
						return (
							<span key={characterIndex} className={tokenClass} style={style} data-summary-token="">
								{character}
							</span>
						)
					})}
				</span>,
			)
		})
	})

	return (
		<span className={className} data-animated-summary="">
			<span className="sr-only">{text.replace(/\s*\n\s*/g, ' ')}</span>
			<span key={text} aria-hidden="true">
				{nodes}
			</span>
		</span>
	)
}
