import { type ReactNode, useEffect, useId, useRef, useState } from 'react'
import { Button } from './button'
import { DisplayHeading } from './text'

/**
 * BrandPageHeader — the brand-workspace page header (port of gs-platform
 * `GSPageHeader` + `ExpandableCTA`).
 *
 * gs-platform's header is a two-column grid: a left "welcome" section
 * (optional breadcrumbs + a large greeting line) and a right section holding an
 * `ExpandableCTA` — a collapsed teal pill that expands into a create-hub panel.
 * The supplied hero `CtaPill` owns the source mobile fixed-bar treatment; this
 * header switches to the desktop 2/3 + 1/3 grid at the matching 768px breakpoint.
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

export type BrandPageHeaderCtaRenderProps = {
	expanded: boolean
	controls: string
	toggle: () => void
}

export type BrandPageHeaderProps = {
	/** The large greeting / page-title slot (e.g. "Good morning Jonas 👋"). */
	greeting: ReactNode
	/** Semantic heading level. Use 2 or 3 when the header is nested below a page title. */
	headingLevel?: 1 | 2 | 3
	/**
	 * gs-style "title to go back": a muted, clickable PARENT link rendered as the
	 * line ABOVE the title (so the title reads "Parent ⏎ Current"). Pass a real
	 * router `<Link>` so it's an anchor (cmd/middle-click, deep-link-safe), exactly
	 * like gs's `parentLink`. Rendered in `fg-muted` with a hover→fg affordance —
	 * the source's decorative `fg-subtle` is 2.10:1 on `surface`, and this row is a
	 * navigation link, not ornament (#25).
	 */
	parentLink?: ReactNode
	/** Optional breadcrumb trail rendered above the greeting. */
	breadcrumbs?: BrandPageHeaderCrumb[]
	/**
	 * Arbitrary right-column CTA node (e.g. the gs hero `CtaPill` banner), or a
	 * render function receiving the disclosure state and generated controls id.
	 * Prefer the render function when the CTA opens `createHub`, so its trigger can
	 * expose `aria-expanded` and `aria-controls`.
	 */
	cta?: ReactNode | ((state: BrandPageHeaderCtaRenderProps) => ReactNode)
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
	/**
	 * Dock the supplied CTA to the safe bottom edge below 768px, matching the
	 * source Manager's collapsed ExpandableCTA. Enabled by default.
	 */
	mobileCtaDocked?: boolean
	className?: string
}

export function BrandPageHeader({
	greeting,
	headingLevel = 1,
	parentLink,
	breadcrumbs,
	cta,
	ctaLabel,
	createHub,
	expanded: expandedProp,
	onExpandedChange,
	closeLabel = 'Close',
	sticky = false,
	mobileCtaDocked = true,
	className,
}: BrandPageHeaderProps) {
	const [internalExpanded, setInternalExpanded] = useState(false)
	const [mobileSheet, setMobileSheet] = useState(false)
	const [mobileFull, setMobileFull] = useState(false)
	const isControlled = expandedProp !== undefined
	const expanded = isControlled ? expandedProp : internalExpanded
	const hasExpandable = Boolean(createHub)
	const HeadingTag = `h${headingLevel}` as const
	const panelId = useId()
	const panelRef = useRef<HTMLDivElement>(null)
	const contentRef = useRef<HTMLDivElement>(null)
	const returnFocusRef = useRef<HTMLElement | null>(null)
	const touchStartYRef = useRef(0)
	const touchStartScrollTopRef = useRef(0)

	const setExpanded = (next: boolean) => {
		if (!isControlled) setInternalExpanded(next)
		onExpandedChange?.(next)
	}
	const renderedCta =
		typeof cta === 'function'
			? cta({
					expanded,
					controls: panelId,
					toggle: () => setExpanded(!expanded),
				})
			: cta

	useEffect(() => {
		if (!expanded || !hasExpandable || typeof window === 'undefined') return

		returnFocusRef.current =
			document.activeElement instanceof HTMLElement ? document.activeElement : null

		let lockedScrollY = 0
		let restoreBody: (() => void) | undefined

		const updateComposition = () => {
			const isMobile = window.innerWidth < 768
			setMobileSheet(isMobile)

			const content = contentRef.current
			setMobileFull(Boolean(isMobile && content && content.scrollHeight >= window.innerHeight * 0.4))

			if (isMobile && !restoreBody) {
				lockedScrollY = window.scrollY
				const previous = {
					overflow: document.body.style.overflow,
					position: document.body.style.position,
					top: document.body.style.top,
					width: document.body.style.width,
				}
				document.body.style.overflow = 'hidden'
				document.body.style.position = 'fixed'
				document.body.style.top = `-${lockedScrollY}px`
				document.body.style.width = '100%'
				restoreBody = () => {
					document.body.style.overflow = previous.overflow
					document.body.style.position = previous.position
					document.body.style.top = previous.top
					document.body.style.width = previous.width
					window.scrollTo(0, lockedScrollY)
				}
			} else if (!isMobile && restoreBody) {
				restoreBody()
				restoreBody = undefined
			}
		}

		const keepFocusInsideMobileSheet = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				event.preventDefault()
				setExpanded(false)
				return
			}
			if (event.key !== 'Tab' || window.innerWidth >= 768 || !panelRef.current) return

			const focusable = Array.from(
				panelRef.current.querySelectorAll<HTMLElement>(
					'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
				),
			).filter((node) => {
				const style = window.getComputedStyle(node)
				return (
					!node.hidden &&
					!node.closest('[hidden]') &&
					node.getAttribute('aria-hidden') !== 'true' &&
					style.display !== 'none' &&
					style.visibility !== 'hidden'
				)
			})
			if (focusable.length === 0) {
				event.preventDefault()
				panelRef.current.focus()
				return
			}
			const first = focusable[0]
			const last = focusable[focusable.length - 1]
			if (!panelRef.current.contains(document.activeElement)) {
				event.preventDefault()
				const boundary = event.shiftKey ? last : first
				boundary?.focus()
				return
			}
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault()
				last?.focus()
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault()
				first?.focus()
			}
		}

		updateComposition()
		const observer =
			typeof ResizeObserver === 'undefined' || !contentRef.current
				? undefined
				: new ResizeObserver(updateComposition)
		if (contentRef.current) observer?.observe(contentRef.current)
		window.addEventListener('resize', updateComposition)
		document.addEventListener('keydown', keepFocusInsideMobileSheet)

		return () => {
			observer?.disconnect()
			window.removeEventListener('resize', updateComposition)
			document.removeEventListener('keydown', keepFocusInsideMobileSheet)
			restoreBody?.()
			returnFocusRef.current?.focus()
			returnFocusRef.current = null
			setMobileSheet(false)
			setMobileFull(false)
		}
	}, [expanded, hasExpandable])

	useEffect(() => {
		if (!expanded || !hasExpandable || typeof window === 'undefined') return
		const frame = window.requestAnimationFrame(() => {
			const selector = mobileSheet
				? '[data-create-hub-focus="mobile"]'
				: '[data-create-hub-focus="desktop"]'
			panelRef.current?.querySelector<HTMLElement>(selector)?.focus()
		})
		return () => window.cancelAnimationFrame(frame)
	}, [expanded, hasExpandable, mobileSheet])

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
			<div className="flex flex-col gap-2 md:grid md:grid-cols-3 md:items-stretch md:gap-4">
				<div className="flex min-w-0 flex-1 flex-col gap-1 md:col-span-2">
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
					<DisplayHeading asChild className="tracking-tight">
						<HeadingTag>
							{parentLink ? (
								// gs "title to go back": muted clickable parent line above the title.
								// `[&_a]` styles the nested router <Link> (anchor) without @app/ui
								// importing the router. #25: the source's decorative grey is 2.10:1
								// on `surface` — this row is a navigation LINK, so it takes the
								// readable `fg-muted` (5.98:1) instead.
								<>
									<span className="text-fg-muted transition-colors [&_a:hover]:text-fg [&_a]:text-fg-muted [&_a]:no-underline [&_a]:outline-none [&_a:focus-visible]:underline">
										{parentLink}
									</span>
									<br />
								</>
							) : null}
							{greeting}
						</HeadingTag>
					</DisplayHeading>
				</div>

				{cta ? (
					// Hero CTA spans 4 of 12 columns (one third) — the greeting takes the rest.
					<div
						className={
							[
								mobileCtaDocked
									? 'fixed inset-x-0 bottom-0 z-40 min-w-0 px-3 pb-mobile-cta-bottom md:static md:inset-auto md:z-auto md:h-full md:p-0'
									: 'h-full min-w-0',
								expanded ? 'hidden' : '',
							].join(' ')
						}
					>
						{renderedCta}
					</div>
				) : ctaLabel ? (
					<div className="shrink-0">
						{hasExpandable ? (
							<Button
								onPress={() => setExpanded(!expanded)}
								aria-expanded={expanded}
								aria-controls={panelId}
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

			{hasExpandable && expanded ? (
				<>
					<div
						aria-hidden="true"
						onClick={() => setExpanded(false)}
						className="fixed inset-0 z-40 bg-black/50 animate-create-hub-backdrop md:hidden motion-reduce:animate-none"
					/>
					<div
						ref={panelRef}
						id={panelId}
						role={mobileSheet ? 'dialog' : 'region'}
						aria-modal={mobileSheet || undefined}
						aria-label={typeof ctaLabel === 'string' ? ctaLabel : undefined}
						tabIndex={-1}
						onTouchStart={(event) => {
							const touch = event.touches[0]
							if (!touch || !contentRef.current) return
							touchStartYRef.current = touch.clientY
							touchStartScrollTopRef.current = contentRef.current.scrollTop
						}}
						onTouchMove={(event) => {
							const touch = event.touches[0]
							if (
								!touch ||
								touchStartScrollTopRef.current > 10 ||
								touch.clientY - touchStartYRef.current < 80
							) {
								return
							}
							event.preventDefault()
							setExpanded(false)
						}}
						className={[
							'fixed inset-x-0 bottom-0 z-50 flex flex-col overflow-hidden bg-brand-green',
							'outline-none motion-reduce:animate-none',
							'md:relative md:inset-auto md:z-auto md:mt-4 md:max-h-none md:origin-top-right md:rounded-lg md:animate-create-hub-desktop',
							mobileFull
								? 'top-0 max-h-create-hub-full animate-create-hub-full'
								: 'max-h-create-hub-partial animate-create-hub-sheet',
						].join(' ')}
					>
						<Button
							variant="ghost"
							aria-label={closeLabel}
							data-create-hub-focus="mobile"
							onPress={() => setExpanded(false)}
							className="h-10 w-full shrink-0 rounded-none p-0 md:hidden data-[hovered]:bg-transparent"
						>
							<span className="h-1 w-10 rounded-full bg-fg/25" aria-hidden="true" />
						</Button>
						<Button
							variant="ghost"
							aria-label={closeLabel}
							data-create-hub-focus="desktop"
							onPress={() => setExpanded(false)}
							className="absolute right-4 top-14 z-10 hidden h-8 w-8 rounded-md p-0 text-fg md:flex data-[hovered]:bg-black/5"
						>
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
								<path
									d="M6 6l12 12M18 6L6 18"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
								/>
							</svg>
						</Button>
						<div
							ref={contentRef}
							className="min-h-0 flex-1 overflow-y-auto overscroll-contain md:overflow-visible"
						>
							{createHub}
						</div>
					</div>
				</>
			) : null}
		</div>
	)
}
