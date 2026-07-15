import { type ReactNode, useState } from 'react'
import { Button } from './button'

/**
 * BrandPageHeader — the brand-workspace page header (port of gs-platform
 * `GSPageHeader` + `ExpandableCTA`).
 *
 * gs-platform's header is a two-column grid: a left "welcome" section
 * (optional breadcrumbs + a large greeting line) and a right section holding an
 * `ExpandableCTA` — a collapsed teal pill that expands into an inline
 * create-hub panel. We port that interaction to React Aria + Tailwind + the
 * teal accent token (`brand-secondary`), dropping gs-platform's mobile
 * fixed-sheet behaviour for a simpler inline disclosure.
 *
 * The expandable CTA is a controlled disclosure: the collapsed teal pill is a
 * React Aria `Button` (keyboard + focus ring + press handling) wired to a
 * `region` with `aria-expanded`/`aria-controls`, so it follows the WAI-ARIA
 * disclosure pattern without pulling in extra markup.
 *
 * Presentational only (hard rule #1): every string (greeting, breadcrumb
 * labels, CTA label) arrives via props — no API, no i18n.
 */

export type BrandPageHeaderCrumb = {
	label: ReactNode
	/** Optional click handler — when set the crumb renders as a button. */
	onPress?: () => void
}

export type BrandPageHeaderProps = {
	/** The large greeting / page-title slot (e.g. "Good morning Jonas 👋"). */
	greeting: ReactNode
	/**
	 * gs-style "title to go back": a muted, clickable PARENT link rendered as the
	 * line ABOVE the title (so the title reads "Parent ⏎ Current"). Pass a real
	 * router `<Link>` so it's an anchor (cmd/middle-click, deep-link-safe), exactly
	 * like gs's `parentLink`. The header styles it muted with a hover→fg affordance.
	 */
	parentLink?: ReactNode
	/** Optional breadcrumb trail rendered above the greeting. */
	breadcrumbs?: BrandPageHeaderCrumb[]
	/**
	 * Arbitrary right-column CTA node (e.g. the gs hero `CtaPill` banner). When
	 * set it REPLACES the collapsed-pill ExpandableCTA — use this for the
	 * gs-faithful "Let's create something" hero. `ctaLabel`/`createHub` are ignored.
	 */
	cta?: ReactNode
	/** Label on the collapsed teal "Create" pill. Required to render the CTA. */
	ctaLabel?: ReactNode
	/** Inline content revealed when the CTA expands (the create hub). */
	createHub?: ReactNode
	/** Controlled expansion (optional — uncontrolled by default). */
	expanded?: boolean
	onExpandedChange?: (expanded: boolean) => void
	/** Accessible label for the close control when expanded. Defaults to "Close". */
	closeLabel?: string
	/** Sticky header on scroll. */
	sticky?: boolean
	className?: string
}

const PANEL_ID = 'brand-page-header-create-hub'

export function BrandPageHeader({
	greeting,
	parentLink,
	breadcrumbs,
	cta,
	ctaLabel,
	createHub,
	expanded: expandedProp,
	onExpandedChange,
	closeLabel = 'Close',
	sticky = false,
	className,
}: BrandPageHeaderProps) {
	const [internalExpanded, setInternalExpanded] = useState(false)
	const isControlled = expandedProp !== undefined
	const expanded = isControlled ? expandedProp : internalExpanded
	const hasExpandable = Boolean(createHub)

	const setExpanded = (next: boolean) => {
		if (!isControlled) setInternalExpanded(next)
		onExpandedChange?.(next)
	}

	return (
		<div
			className={[
				'mb-6 w-full',
				sticky ? 'sticky top-0 z-30 bg-surface' : '',
				className,
			]
				.filter(Boolean)
				.join(' ')}
		>
			<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
				<div className="flex min-w-0 flex-col gap-1">
					{breadcrumbs && breadcrumbs.length > 0 ? (
						<nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-compact text-fg-muted">
							{breadcrumbs.map((crumb, i) => (
								<span key={i} className="inline-flex items-center gap-1">
									{i > 0 ? <span aria-hidden="true">/</span> : null}
									{crumb.onPress ? (
										<Button
											variant="ghost"
											onPress={crumb.onPress}
											className="h-auto rounded-sm p-0 text-compact font-normal text-fg-muted data-[hovered]:bg-transparent data-[hovered]:text-fg data-[hovered]:underline"
										>
											{crumb.label}
										</Button>
									) : (
										<span>{crumb.label}</span>
									)}
								</span>
							))}
						</nav>
					) : null}
					<h1 className="text-display font-medium leading-[1.12] tracking-wide text-fg">
						{parentLink ? (
							// gs "title to go back": muted clickable parent line above the title.
							// `[&_a]` styles the nested router <Link> (anchor) without @app/ui
							// importing the router.
							<>
								<span className="text-fg-muted transition-colors [&_a:hover]:text-fg [&_a]:text-fg-muted [&_a]:no-underline [&_a]:outline-none [&_a:focus-visible]:underline">
									{parentLink}
								</span>
								<br />
							</>
						) : null}
						{greeting}
					</h1>
				</div>

				{cta ? (
					<div className="w-full shrink-0 sm:w-auto sm:min-w-[360px]">{cta}</div>
				) : ctaLabel ? (
					<div className="shrink-0">
						{hasExpandable ? (
							<Button
								onPress={() => setExpanded(!expanded)}
								aria-expanded={expanded}
								aria-controls={PANEL_ID}
								className="h-10 rounded-full bg-brand-secondary px-5 text-small font-medium text-fg data-[hovered]:opacity-90 data-[pressed]:opacity-80"
							>
								{ctaLabel}
							</Button>
						) : (
							<Button className="h-10 rounded-full bg-brand-secondary px-5 text-small font-medium text-fg data-[hovered]:opacity-90 data-[pressed]:opacity-80">
								{ctaLabel}
							</Button>
						)}
					</div>
				) : null}
			</div>

			{hasExpandable ? (
				<div
					id={PANEL_ID}
					role="region"
					aria-label={typeof ctaLabel === 'string' ? ctaLabel : undefined}
					hidden={!expanded}
					className="mt-4"
				>
					{expanded ? (
						<div className="relative rounded-lg border border-border bg-surface-card p-4 animate-expand-cta motion-reduce:animate-none">
							<Button
								variant="ghost"
								aria-label={closeLabel}
								onPress={() => setExpanded(false)}
								className="absolute right-2 top-2 h-7 w-7 rounded-full p-0 text-fg-muted data-[hovered]:bg-surface-muted data-[hovered]:text-fg"
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
									<path
										d="M6 6l12 12M18 6L6 18"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
									/>
								</svg>
							</Button>
							{createHub}
						</div>
					) : null}
				</div>
			) : null}
		</div>
	)
}
