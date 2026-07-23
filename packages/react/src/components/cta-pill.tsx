import type { ReactNode } from 'react'

/**
 * CtaPill — the gs Brand Core hero CTA: a GS-green bar reading "Let's create
 * something" (the middle word emphasised) with an action control on the right.
 *
 * The copy is three fragments (`lead` · `emphasis` · `tail`) so a consumer can
 * translate each per-locale while keeping the middle-word highlight. Presentational
 * only (hard rule #1): every string arrives via props — no i18n, no domain data.
 *
 * a11y NOTE: the background is the FIXED light brand-secondary (#6eddb1) — it does
 * not flip with the theme, so every sentence fragment sits on `fg-on-brand` (stable
 * dark ink, ~11:1 in both themes). The gs design's white emphasis word failed WCAG AA
 * (~1.66:1) and turned the whole sentence white-on-green in a dark shell; the
 * emphasis is now carried by weight alone.
 */
export interface CtaPillProps {
	/** Regular lead-in before the emphasised word (e.g. "Let's"). */
	lead: ReactNode
	/** The emphasised bold middle word (e.g. "create"). */
	emphasis: ReactNode
	/** Regular trailing text after the emphasis (e.g. "something"). */
	tail: ReactNode
	/** Right-side action control (e.g. a Create button). */
	children: ReactNode
}

export function CtaPill({ lead, emphasis, tail, children }: CtaPillProps) {
	return (
		<div className="flex w-full items-center justify-between gap-4 rounded-lg bg-brand-secondary px-6 py-4">
			<p className="min-w-0 text-heading4 font-medium leading-[22px] tracking-normal text-fg-on-brand">
				{lead} <span className="font-semibold">{emphasis}</span> {tail}
			</p>
			<div className="shrink-0">{children}</div>
		</div>
	)
}
