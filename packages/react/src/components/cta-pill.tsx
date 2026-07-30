import type { ReactNode } from 'react'

/**
 * CtaPill — the gs Brand Core hero CTA: a GS-green bar reading "Let's create
 * something" (the middle word emphasised) with an action control on the right.
 *
 * The copy is three fragments (`lead` · `emphasis` · `tail`) so a consumer can
 * translate each per-locale while keeping the middle-word highlight. With
 * `mobileHeader`, it adopts the source ExpandableCTA's 99px mobile touch surface;
 * `BrandPageHeader` owns the safe-bottom positioning and returns it to the one-third
 * desktop grid at the `md` breakpoint. Presentational only (hard rule #1): every
 * string arrives via props — no i18n, no domain data.
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
	/**
	 * Use the source mobile header density (99px minimum height and doubled
	 * horizontal content padding). Positioning stays with `BrandPageHeader`.
	 */
	mobileHeader?: boolean
}

export function CtaPill({ lead, emphasis, tail, children, mobileHeader = false }: CtaPillProps) {
	return (
		<div
			className={[
				'flex h-full w-full items-center justify-between gap-nav-x rounded-lg bg-brand-green',
				mobileHeader
					? 'min-h-mobile-cta px-12 py-5 shadow-mobile-cta md:min-h-16 md:py-2.5 md:pr-3 md:pl-4.5 md:shadow-none'
					: 'min-h-16 py-2.5 pr-3 pl-4.5',
			].join(' ')}
		>
			<p className="min-w-0 text-heading4 font-medium leading-5 tracking-tight text-fg-on-brand">
				{lead} <span className="font-semibold">{emphasis}</span> {tail}
			</p>
			<div className="shrink-0">{children}</div>
		</div>
	)
}
