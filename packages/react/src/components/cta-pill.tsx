import type { ReactNode } from 'react'

/**
 * CtaPill — the gs Brand Core hero CTA: a GS-green bar reading "Let's create
 * something" (the middle word emphasised) with an action control on the right.
 *
 * The copy is three fragments (`lead` · `emphasis` · `tail`) so a consumer can
 * translate each per-locale while keeping the middle-word highlight. Presentational
 * only (hard rule #1): every string arrives via props — no i18n, no domain data.
 *
 * a11y NOTE: the background is the light brand-green (#6eddb1); the emphasised word is
 * rendered WHITE per the gs design — white-on-green is ~1.66:1, below WCAG AA, so it
 * reads as a decorative highlight (it also carries a bold weight), not load-bearing
 * copy. The surrounding text stays on the dark `fg` (~10:1).
 */
export interface CtaPillProps {
	/** Regular lead-in before the emphasised word (e.g. "Let's"). */
	lead: ReactNode
	/** The emphasised bold, white middle word (e.g. "create"). */
	emphasis: ReactNode
	/** Regular trailing text after the emphasis (e.g. "something"). */
	tail: ReactNode
	/** Right-side action control (e.g. a Create button). */
	children: ReactNode
}

export function CtaPill({ lead, emphasis, tail, children }: CtaPillProps) {
	return (
		<div className="flex min-w-[560px] items-center justify-between gap-4 rounded-lg bg-brand-secondary px-6 py-4">
			<p className="text-heading4 font-medium leading-[22px] tracking-normal text-fg">
				{lead} <span className="font-semibold text-white">{emphasis}</span> {tail}
			</p>
			<div className="shrink-0">{children}</div>
		</div>
	)
}
