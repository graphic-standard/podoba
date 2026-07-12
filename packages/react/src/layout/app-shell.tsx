import { type ReactNode, useId, useState } from 'react'
import {
	Button as RACButton,
	Dialog as RACDialog,
	Modal as RACModal,
	ModalOverlay as RACModalOverlay,
} from 'react-aria-components'
import { uic } from '../utils/uic'

/**
 * AppShell — top-level application layout (ported pattern from gs-manager's
 * `AppShell` + `AppShell.module.scss`).
 *
 * gs-manager used a full-height flex column (`100vh`, `overflow: hidden`) with
 * a sticky `<header>` topbar and a single scrolling `<main>`. The Phase-1 GS
 * Platform shell adds a left sidebar, so the SCSS intent is reimplemented in
 * Tailwind as a CSS grid:
 *
 *   grid-rows-[auto_1fr]      — topbar row sizes to content, content fills the rest
 *   grid-cols-[auto_1fr]      — sidebar takes its intrinsic width, main fills
 *
 * Slots (all optional except `main`):
 *   banner   — full-bleed bar at the very top of the scroll column; scrolls away
 *   topbar   — sticky header that pins to the top once the banner scrolls past
 *   sidebar  — left rail; `<aside>` landmark. Collapses to a drawer on mobile
 *   main     — `<main>` landmark content region
 *
 * Scroll model: the shell is `h-screen overflow-hidden`; the content side is a
 * single vertical scroll column holding [full-bleed banner · sticky topbar ·
 * main]. The banner sits at the top of that column so it SCROLLS AWAY with the
 * content, while the topbar is `position: sticky; top: 0` and PINS to the top of
 * the viewport once the banner scrolls past it (the classic announcement-bar +
 * sticky-header pattern). The sidebar is a separate full-height rail outside the
 * scroller, so it never scrolls with the content.
 *
 * Responsive: below `md` the sidebar leaves the grid flow and becomes an
 * off-canvas drawer toggled by a hamburger button rendered in the topbar row.
 * The drawer is a React Aria `ModalOverlay`/`Dialog` (accessibility.md): focus
 * moves into the dialog on open and restores to the trigger on close, focus is
 * trapped while open, and `Esc` / clicking the dimmed backdrop dismisses. The
 * trigger advertises the drawer via `aria-expanded` + `aria-controls`.
 *
 * i18n: `@app/ui` ships no i18n, so when `sidebar` is passed the accessible
 * names (`sidebarLabel`, `drawerToggleLabel`) are REQUIRED from the consumer —
 * translated there, never English defaults baked in here.
 */
const Root = uic('div', {
	displayName: 'AppShell',
	baseClass:
		'grid h-screen w-full overflow-hidden bg-surface ' +
		// one full-height row; sidebar (auto) + content (1fr) columns on md+
		'grid-rows-[100%] grid-cols-[1fr] md:grid-cols-[auto_1fr]',
})

const SidebarRail = uic('aside', {
	displayName: 'AppShell.Sidebar',
	baseClass: 'h-full w-64 shrink-0 overflow-y-auto border-r border-border bg-surface',
})

const Main = uic('main', {
	displayName: 'AppShell.Main',
	// gs-manager `.content`: white, 24px horizontal page padding (page-edge-padding-
	// double) so page content is inset from the viewport edge — not flush left.
	// Vertical padding gives every page breathing room. The SCROLL lives on the
	// parent column (so the banner can scroll away under the sticky topbar), not here.
	baseClass: 'min-w-0 flex-1 bg-surface px-6 pb-6 pt-6',
})

export type AppShellProps = {
	/**
	 * Full-bleed banner slot rendered ABOVE the topbar, edge-to-edge (e.g. the
	 * demo-workspace bar). Takes no height when its content is null.
	 */
	banner?: ReactNode
	/** Topbar slot — typically `<Topbar>…</Topbar>`. Spans the full width. */
	topbar?: ReactNode
	/** Main scrollable content region (`<main>` landmark). */
	children: ReactNode
	className?: string
} & (
	| {
			/** Left sidebar; collapses to a drawer below `md`. */
			sidebar: ReactNode
			/** Accessible name of the sidebar landmark + its mobile drawer dialog (translated by the consumer). */
			sidebarLabel: string
			/** Accessible label for the mobile drawer toggle button (translated by the consumer). */
			drawerToggleLabel: string
	  }
	| {
			sidebar?: undefined
			sidebarLabel?: undefined
			drawerToggleLabel?: undefined
	  }
)

export const AppShell = ({
	banner,
	topbar,
	sidebar,
	sidebarLabel,
	drawerToggleLabel,
	children,
	className,
}: AppShellProps) => {
	const [drawerOpen, setDrawerOpen] = useState(false)
	const drawerId = useId()
	const hasSidebar = Boolean(sidebar)

	return (
		<Root className={className}>
			{/* Desktop sidebar — a full-height rail OUTSIDE the scroll column, so it
			    never scrolls with the content. */}
			{hasSidebar ? (
				<SidebarRail aria-label={sidebarLabel} className="hidden md:block">
					{sidebar}
				</SidebarRail>
			) : null}

			{/* Mobile drawer — off-canvas RAC modal dialog toggled by the hamburger.
			    ModalOverlay supplies the focus trap, initial focus move, focus restore,
			    Esc-to-close and backdrop dismissal; the visual (dimmed backdrop +
			    left-anchored rail with shadow) matches the previous hand-rolled drawer. */}
			{hasSidebar ? (
				<RACModalOverlay
					isOpen={drawerOpen}
					onOpenChange={setDrawerOpen}
					isDismissable
					className="fixed inset-0 z-40 bg-black/40 md:hidden"
				>
					<RACModal className="absolute inset-y-0 left-0 z-50 h-full outline-none">
						<RACDialog id={drawerId} aria-label={sidebarLabel} className="h-full outline-none">
							<SidebarRail aria-label={sidebarLabel} className="shadow-lg">
								{sidebar}
							</SidebarRail>
						</RACDialog>
					</RACModal>
				</RACModalOverlay>
			) : null}

			{/* Content column — the single vertical scroller. Holds the full-bleed
			    banner, the sticky topbar, and main. Spans both columns when there is
			    no sidebar so it always fills the viewport. */}
			<div
				className={
					'flex min-h-0 min-w-0 flex-col overflow-y-auto overflow-x-hidden bg-surface' +
					(hasSidebar ? '' : ' col-span-full')
				}
			>
				{/* Full-bleed banner (edge-to-edge, no page padding). Sits at the top of
				    the scroll column so it scrolls away with the content. */}
				{banner ? <div className="shrink-0">{banner}</div> : null}

				{/* Sticky topbar — pins to the top of the viewport once the banner
				    scrolls past. 24px horizontal page padding (gs `.topbar` `padding: 0
				    spacing-6`, zero vertical — the Topbar header carries its own 72px
				    height + bottom border). The border lives on the Topbar header so it
				    aligns (inset) with the padded content below. `bg-surface` keeps content
				    from showing through while pinned. z-20 sits above scrolling content but
				    below the mobile drawer (z-40/z-50); gs's literal z-10001 is to clear a
				    fullscreen overlay we don't have. */}
				<div className="sticky top-0 z-20 flex shrink-0 items-center bg-surface px-6">
					{hasSidebar ? (
						<RACButton
							aria-label={drawerToggleLabel}
							aria-expanded={drawerOpen}
							aria-controls={drawerOpen ? drawerId : undefined}
							onPress={() => setDrawerOpen((open) => !open)}
							className={
								'ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-fg outline-none ' +
								'transition-colors hover:bg-surface-muted md:hidden ' +
								'data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring'
							}
						>
							<span aria-hidden="true">☰</span>
						</RACButton>
					) : null}
					<div className="min-w-0 flex-1">{topbar}</div>
				</div>

				<Main>{children}</Main>
			</div>
		</Root>
	)
}
