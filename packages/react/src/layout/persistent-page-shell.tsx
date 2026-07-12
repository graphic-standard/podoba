import { type ReactNode, useEffect } from 'react'
import { uic } from '../utils/uic'

/**
 * PersistentPageShell — page-level shell with a persistent header (hero +
 * actions + navigation) and a content region that swaps between ready / loading
 * / empty / error states without the header shifting (ported pattern from
 * gs-manager's `PersistentPageShell`).
 *
 * gs-manager SCSS intent → Tailwind:
 *   .shell      flex column, gap-6, full width        → `flex flex-col gap-6 w-full`
 *   .header     flex column header cluster, optionally sticky
 *   .topRow     grid 2fr/1fr (hero | actions)         → `grid grid-cols-[2fr_1fr]`
 *   .actionSlotPlaceholder  reserves action space     → `invisible pointer-events-none`
 *   .navigationSlotEmpty    reserves nav row height   → `min-h-10`
 *   .contentSlot            `<main>` content region    → `w-full`
 *
 * "Persistent" = the header (hero/actions/navigation) stays mounted while the
 * content region swaps via `contentState`; reserving action/nav space (the
 * placeholder modifiers) prevents layout shift when those slots are empty,
 * which is also what keeps viewport-locked modals from nudging the page.
 *
 * Page title: pass `title` and it is written to `document.title` (React 19,
 * SSR-safe via `useEffect` so `renderToString` is a no-op).
 */
export type PersistentPageShellContentState = 'ready' | 'loading' | 'empty' | 'error'
export type PersistentPageShellNavigationMode = 'auto' | 'preserve' | 'hidden'

export type PersistentPageShellProps = {
	className?: string
	/** Page heading / title region (left of the top row). */
	heroSlot?: ReactNode
	/** Primary actions (right of the top row). Space is reserved if absent. */
	actionSlot?: ReactNode
	/** Secondary navigation row beneath the top row (tabs, breadcrumbs…). */
	navigationSlot?: ReactNode
	/** Main content, shown when `contentState === 'ready'`. */
	contentSlot: ReactNode
	/** When set, drives which slot the content region renders. */
	contentState?: PersistentPageShellContentState
	loadingSlot?: ReactNode
	emptySlot?: ReactNode
	errorSlot?: ReactNode
	/** `preserve` always reserves the nav row; `auto` only when content exists. */
	navigationMode?: PersistentPageShellNavigationMode
	/** Reserve horizontal space for actions even when `actionSlot` is empty. */
	preserveActionSlotSpace?: boolean
	/** Keep the header pinned to the top while content scrolls. */
	sticky?: boolean
	/** Document title; written to `document.title` on mount (React 19). */
	title?: string
}

const defaultLoadingSlot = <div className="text-sm text-fg-muted">Loading…</div>
const defaultEmptySlot = <div className="text-sm text-fg-muted">No content available.</div>
const defaultErrorSlot = <div className="text-sm text-danger">Failed to load content.</div>

const Header = uic('header', {
	displayName: 'PersistentPageShell.Header',
	baseClass: 'flex w-full flex-col gap-6 bg-surface',
	variants: {
		sticky: { true: 'sticky top-0 z-[1]', false: '' },
	},
	defaultVariants: { sticky: false },
})

export const PersistentPageShell = ({
	className,
	heroSlot,
	actionSlot,
	navigationSlot,
	contentSlot,
	contentState = 'ready',
	loadingSlot,
	emptySlot,
	errorSlot,
	navigationMode = 'preserve',
	preserveActionSlotSpace = true,
	sticky = false,
	title,
}: PersistentPageShellProps) => {
	useEffect(() => {
		if (title !== undefined && typeof document !== 'undefined') {
			document.title = title
		}
	}, [title])

	const shouldRenderActionSlot = Boolean(actionSlot) || preserveActionSlotSpace
	const shouldRenderNavigation =
		navigationMode === 'preserve' || (navigationMode === 'auto' && Boolean(navigationSlot))

	const resolvedContent =
		contentState === 'loading'
			? (loadingSlot ?? defaultLoadingSlot)
			: contentState === 'empty'
				? (emptySlot ?? defaultEmptySlot)
				: contentState === 'error'
					? (errorSlot ?? defaultErrorSlot)
					: contentSlot

	return (
		<div className={['flex w-full flex-col gap-6', className].filter(Boolean).join(' ')}>
			<Header sticky={sticky}>
				<div className="grid w-full grid-cols-1 items-stretch gap-4 md:grid-cols-[2fr_1fr]">
					<div className="min-w-0">{heroSlot}</div>
					{shouldRenderActionSlot ? (
						<div
							className={[
								'flex min-w-0 items-stretch justify-end',
								actionSlot ? '' : 'invisible pointer-events-none',
							]
								.filter(Boolean)
								.join(' ')}
							aria-hidden={actionSlot ? undefined : true}
						>
							{actionSlot}
						</div>
					) : null}
				</div>

				{shouldRenderNavigation ? (
					<div
						className={['min-w-0', navigationSlot ? '' : 'min-h-10'].filter(Boolean).join(' ')}
						aria-hidden={navigationSlot ? undefined : true}
					>
						{navigationSlot}
					</div>
				) : null}
			</Header>

			<main className="w-full min-w-0">{resolvedContent}</main>
		</div>
	)
}
