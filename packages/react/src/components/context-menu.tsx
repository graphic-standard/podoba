import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import {
	Header,
	Menu as RACMenu,
	MenuItem as RACMenuItem,
	MenuSection as RACMenuSection,
	Popover as RACPopover,
} from 'react-aria-components'
import { uic } from '../utils/uic'

/**
 * ContextMenu — right-click action menu (port of gs-platform `ContextActionPanel`).
 *
 * gs-platform renders a fixed dark panel of grouped action buttons at the cursor,
 * hand-rolling outside-click / Escape / viewport-clamping (its `EDGE_GAP = 8`). We
 * re-implement on a React Aria standalone `Popover` + `Menu`, which provides the
 * WAI-ARIA menu pattern for free: roving focus, arrow / Home / End navigation,
 * type-ahead, Escape-to-close, outside-press dismissal, focus restoration and —
 * crucially — viewport-aware collision handling (the popover flips / shifts to stay
 * on-screen, replacing the manual edge clamp). The popover is anchored to a
 * zero-size element placed at the click coordinates.
 *
 * Two ways to drive it, sharing one renderer:
 *  - **Controlled** (the documented API): pass `isOpen` + `position` + `onClose`
 *    and own the open state yourself — pair with {@link useContextMenu} so a
 *    surface can do `<div onContextMenu={menu.open} />` + `<ContextMenu
 *    {...menu.props} groups={…} />`. Renders nothing while closed or when every
 *    group is empty / hidden.
 *  - **Wrapper**: wrap a target with `<ContextMenu groups={…}>{target}</ContextMenu>`;
 *    the right-click on the wrapper opens the menu and the component owns the state.
 *    `groups` may be a {@link ContextMenuGroupsResolver} for contextual menus.
 *
 * Presentational only (hard rule #1) — no app imports.
 */

export interface ContextMenuItem {
	/** Stable identity + React key. Either `id` (preferred) or `key` must be set. */
	id?: string
	/** @deprecated alias of `id`, kept for the wrapper-API callers. */
	key?: string
	label: ReactNode
	icon?: ReactNode
	/**
	 * Trailing pill (e.g. a count or status). When omitted, a disabled item falls
	 * back to the `soonLabel` pill so unbuilt actions read as upcoming.
	 */
	badge?: ReactNode
	disabled?: boolean
	/** Styled with the danger token (red text). */
	destructive?: boolean
	/** Filtered out before render. */
	hidden?: boolean
	/** Invoked on activation; the menu then closes. */
	onSelect?: () => void
	/** @deprecated alias of `onSelect`, kept for the wrapper-API callers. */
	onAction?: () => void
}

export interface ContextMenuGroup {
	id?: string
	/** @deprecated alias of `id`, kept for the wrapper-API callers. */
	key?: string
	label?: ReactNode
	items: ContextMenuItem[]
}

/**
 * Resolves the menu groups for a given right-click. Receives the element that was
 * actually clicked, so wrapper-API callers can prepend item-specific actions (the
 * "context" in context menu) ahead of the shared groups — e.g. read
 * `event.target.closest('[data-context-item]')` to learn which card / row the
 * cursor was over.
 */
export type ContextMenuGroupsResolver = (ctx: { target: HTMLElement }) => ContextMenuGroup[]

/** Controlled API — the shape {@link useContextMenu} drives. */
export interface ContextMenuProps {
	groups: ContextMenuGroup[]
	isOpen: boolean
	position: { x: number; y: number } | null
	onClose: () => void
	/** Names the menu for assistive tech. Defaults to "Actions". */
	'aria-label'?: string
	/** Label shown on the fallback pill of disabled items. Defaults to "Soon". */
	soonLabel?: ReactNode
	className?: string
}

/** Wrapper API — wrap a target; the component owns the open state. */
interface ContextMenuWrapperProps {
	groups: ContextMenuGroup[] | ContextMenuGroupsResolver
	children: ReactNode
	soonLabel?: ReactNode
	'aria-label'?: string
	className?: string
}

const itemId = (item: ContextMenuItem, fallback: number): string => item.id ?? item.key ?? String(fallback)
const groupId = (group: ContextMenuGroup, fallback: number): string => group.id ?? group.key ?? String(fallback)

/** Drop hidden items, then drop groups that end up empty. */
const visibleGroupsOf = (groups: ContextMenuGroup[]): ContextMenuGroup[] =>
	groups
		.map((group) => ({ ...group, items: group.items.filter((item) => !item.hidden) }))
		.filter((group) => group.items.length > 0)

const MenuItem = uic(RACMenuItem, {
	displayName: 'ContextMenuItem',
	// Dark panel (gs `ContextActionPanel`): light text on the inverted surface, a
	// solid #2f2f2f wash + weight bump on hover / focus (gs `.itemButton:hover`).
	baseClass:
		'flex min-h-[34px] cursor-pointer select-none items-center gap-2.5 rounded-[10px] px-3 py-1.5 ' +
		'text-compact text-white outline-none ' +
		'data-[focused]:bg-[#2f2f2f] data-[focused]:font-medium data-[hovered]:bg-[#2f2f2f] data-[hovered]:font-medium ' +
		'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-45',
	variants: {
		// gs uses `--color-error-light` (#ffb5b5) — a light red tuned for the dark
		// panel; our `text-danger` (#dc2626) is a light-surface red that fails
		// contrast here, and there is no danger-light token.
		destructive: { true: 'text-[#ffb5b5] data-[focused]:text-[#ffb5b5]' },
	},
}) as (
	props: React.ComponentProps<typeof RACMenuItem> & { destructive?: boolean },
) => ReturnType<typeof RACMenuItem>

// gs `.panel`: 258px, radius 12px, 8px/6px padding, 180deg #242424→#1f1f1f
// gradient, 0 12px 28px rgba(0,0,0,.22) shadow. No token covers the gradient/shadow.
const panelClass =
	'w-[258px] max-w-[calc(100vw-16px)] rounded-lg bg-gradient-to-b from-[#242424] to-[#1f1f1f] ' +
	'px-1.5 py-2 shadow-[0_12px_28px_rgba(0,0,0,0.22)] outline-none'
const menuClass = 'grid max-h-[calc(100vh-16px)] gap-0.5 overflow-y-auto outline-none'

/**
 * The popover body shared by both modes — the RAC `Menu` of grouped items. `onItem`
 * fires after an item's own handler so the controlled mode can close the menu.
 */
function ContextMenuBody({
	groups,
	soonLabel,
	ariaLabel,
	onItem,
}: {
	groups: ContextMenuGroup[]
	soonLabel: ReactNode
	ariaLabel: string
	onItem?: () => void
}) {
	return (
		<RACMenu aria-label={ariaLabel} className={menuClass}>
			{groups.map((group, gi) => (
				// gs separates groups with an 18px top margin (`.group + .group`), not a
				// rule line — so the first group sits flush, the rest gain the gap.
				<RACMenuSection key={groupId(group, gi)} className={gi > 0 ? 'mt-[18px] grid gap-0.5' : 'grid gap-0.5'}>
					{group.label ? (
						<Header className="mx-2 mt-1.5 mb-1 text-compact font-medium text-white">{group.label}</Header>
					) : null}
					{group.items.map((item, ii) => {
						const id = itemId(item, ii)
						const select = item.onSelect ?? item.onAction
						const badge = item.badge ?? (item.disabled ? soonLabel : null)
						return (
							<MenuItem
								key={id}
								id={id}
								textValue={typeof item.label === 'string' ? item.label : id}
								isDisabled={item.disabled}
								destructive={item.destructive}
								onAction={() => {
									select?.()
									onItem?.()
								}}
							>
								{item.icon ? (
									<span className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center">
										{item.icon}
									</span>
								) : null}
								<span className="min-w-0 flex-1 truncate">{item.label}</span>
								{badge ? (
									// gs `.badge`: 24px pill, #333437 bg / #c8c8ca text, 10px (text-micro).
									<span className="ml-auto inline-flex h-6 items-center justify-center rounded-full bg-[#333437] px-3 py-0.5 text-micro font-medium leading-5 tracking-tight text-[#c8c8ca]">
										{badge}
									</span>
								) : null}
							</MenuItem>
						)
					})}
				</RACMenuSection>
			))}
		</RACMenu>
	)
}

/** Controlled context menu — anchored at `position`, open/close owned by the caller. */
function ControlledContextMenu({
	groups,
	isOpen,
	position,
	onClose,
	soonLabel = 'Soon',
	'aria-label': ariaLabel = 'Actions',
	className,
}: ContextMenuProps): React.JSX.Element | null {
	const anchorRef = useRef<HTMLSpanElement>(null)
	const visibleGroups = visibleGroupsOf(groups)
	if (visibleGroups.length === 0) {
		return null
	}
	const pos = position ?? { x: 0, y: 0 }
	return (
		<>
			{/* Zero-size anchor at the cursor; the Popover attaches here. Keyed by
			    position so a re-open at a new spot re-measures (RAC only measures the
			    anchor when the popover opens). */}
			<span
				ref={anchorRef}
				aria-hidden="true"
				style={{ position: 'fixed', left: pos.x, top: pos.y, width: 0, height: 0 }}
			/>
			<RACPopover
				key={`${pos.x}:${pos.y}`}
				isOpen={isOpen}
				onOpenChange={(open) => {
					if (!open) {
						onClose()
					}
				}}
				triggerRef={anchorRef}
				placement="bottom start"
				className={className ? `${panelClass} ${className}` : panelClass}
			>
				<ContextMenuBody groups={visibleGroups} soonLabel={soonLabel} ariaLabel={ariaLabel} onItem={onClose} />
			</RACPopover>
		</>
	)
}

/** Wrapper context menu — wraps a target and owns its own open state. */
function WrapperContextMenu({
	groups,
	children,
	soonLabel = 'Soon',
	'aria-label': ariaLabel = 'Actions',
	className,
}: ContextMenuWrapperProps): React.JSX.Element {
	const [isOpen, setOpen] = useState(false)
	const anchorRef = useRef<HTMLSpanElement>(null)
	const wrapperRef = useRef<HTMLDivElement>(null)
	const popoverRef = useRef<HTMLElement>(null)
	const [position, setPosition] = useState({ x: 0, y: 0 })
	// When `groups` is a resolver, the groups depend on WHAT was clicked, so they
	// are computed at right-click time and held until the next open. A static array
	// is read straight from props (stays live while the menu is open).
	const [resolved, setResolved] = useState<ContextMenuGroup[]>([])
	// Latest `groups` reachable from the document listener without re-subscribing on
	// every parent render (resolvers are usually inline functions).
	const groupsRef = useRef(groups)
	groupsRef.current = groups

	const openAt = (x: number, y: number, target: HTMLElement) => {
		if (typeof groupsRef.current === 'function') {
			setResolved(groupsRef.current({ target }))
		}
		setPosition({ x, y })
		setOpen(true)
	}

	const onContextMenu = (e: React.MouseEvent) => {
		e.preventDefault()
		openAt(e.clientX, e.clientY, e.target as HTMLElement)
	}

	// While the panel is open, a second right-click would otherwise be swallowed by
	// the overlay's outside-press dismissal and surface the BROWSER's native menu.
	// Intercept it ourselves: keep the OS menu suppressed and re-anchor our panel to
	// the new cursor. Re-anchoring needs a close + reopen across a frame so the
	// popover recomputes its position (it only measures the anchor on open). A
	// right-click on our own panel just suppresses the OS menu; one outside our
	// region closes the panel and behaves normally.
	useEffect(() => {
		if (!isOpen) {
			return
		}
		const handle = (e: MouseEvent) => {
			const target = e.target as HTMLElement
			if (popoverRef.current?.contains(target)) {
				// On our own panel: suppress the OS menu, leave the panel as-is. Stop
				// propagation so the wrapper's onContextMenu doesn't also fire.
				e.preventDefault()
				e.stopImmediatePropagation()
				return
			}
			if (!wrapperRef.current?.contains(target)) {
				setOpen(false)
				return
			}
			// In our region with the panel open: take over fully. stopImmediatePropagation
			// keeps the wrapper's bubble onContextMenu from re-opening synchronously —
			// otherwise isOpen never commits `false` and the popover never re-anchors.
			e.preventDefault()
			e.stopImmediatePropagation()
			setOpen(false)
			const { clientX, clientY } = e
			requestAnimationFrame(() => {
				if (typeof groupsRef.current === 'function') {
					setResolved(groupsRef.current({ target }))
				}
				setPosition({ x: clientX, y: clientY })
				setOpen(true)
			})
		}
		document.addEventListener('contextmenu', handle, true)
		return () => document.removeEventListener('contextmenu', handle, true)
	}, [isOpen])

	const sourceGroups = typeof groups === 'function' ? resolved : groups
	const visibleGroups = visibleGroupsOf(sourceGroups)

	return (
		<div ref={wrapperRef} className={className} onContextMenu={onContextMenu}>
			{children}
			{/* Zero-size anchor positioned at the cursor; the Popover attaches here. */}
			<span
				ref={anchorRef}
				aria-hidden="true"
				style={{ position: 'fixed', left: position.x, top: position.y, width: 0, height: 0 }}
			/>
			{visibleGroups.length > 0 ? (
				<RACPopover
					ref={popoverRef}
					isOpen={isOpen}
					onOpenChange={setOpen}
					triggerRef={anchorRef}
					placement="bottom start"
					className={panelClass}
				>
					<ContextMenuBody groups={visibleGroups} soonLabel={soonLabel} ariaLabel={ariaLabel} />
				</RACPopover>
			) : null}
		</div>
	)
}

/**
 * Right-click action menu. Pass `isOpen` / `position` / `onClose` for the controlled
 * API (drive it with {@link useContextMenu}), or `children` for the wrapper API.
 */
export function ContextMenu(props: ContextMenuProps | ContextMenuWrapperProps): React.JSX.Element | null {
	if ('isOpen' in props) {
		return <ControlledContextMenu {...props} />
	}
	return <WrapperContextMenu {...props} />
}

/**
 * Drives a controlled {@link ContextMenu} from a right-click. `open` calls
 * `preventDefault()` (suppressing the native OS menu), records the cursor and opens.
 *
 * ```tsx
 * const menu = useContextMenu()
 * return (
 *   <>
 *     <div onContextMenu={menu.open}>…</div>
 *     <ContextMenu {...menu.props} groups={groups} aria-label="Actions" />
 *   </>
 * )
 * ```
 */
export function useContextMenu(): {
	isOpen: boolean
	position: { x: number; y: number } | null
	open: (e: { preventDefault: () => void; clientX: number; clientY: number }) => void
	close: () => void
	props: Pick<ContextMenuProps, 'isOpen' | 'position' | 'onClose'>
} {
	const [state, setState] = useState<{ isOpen: boolean; position: { x: number; y: number } | null }>({
		isOpen: false,
		position: null,
	})

	const open = useCallback((e: { preventDefault: () => void; clientX: number; clientY: number }) => {
		e.preventDefault()
		setState({ isOpen: true, position: { x: e.clientX, y: e.clientY } })
	}, [])

	const close = useCallback(() => {
		setState((prev) => ({ ...prev, isOpen: false }))
	}, [])

	return {
		isOpen: state.isOpen,
		position: state.position,
		open,
		close,
		props: { isOpen: state.isOpen, position: state.position, onClose: close },
	}
}
