import { type CSSProperties, type ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
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
 * type-ahead, Escape-to-close, outside-press dismissal and focus restoration.
 * The source cursor clamp is retained instead of RAC's anchor flip: close to the
 * lower edge, the panel slides up only as far as needed to keep an 8px gutter.
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
	 * Explicit trailing pill (e.g. a count or status). A disabled item only falls
	 * back to a pill when its caller supplies `soonLabel`; disabled is not "unbuilt".
	 */
	badge?: ReactNode
	disabled?: boolean
	/** Native hover hint for disabled/unavailable actions. */
	title?: string
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
	/** Optional fallback pill for disabled items. No implicit badge. */
	soonLabel?: ReactNode
	className?: string
}

/** Wrapper API — wrap a target; the component owns the open state. */
interface ContextMenuWrapperProps {
	groups: ContextMenuGroup[] | ContextMenuGroupsResolver
	/** Leave native text/editing menus untouched for excluded targets. */
	shouldOpen?: (target: HTMLElement) => boolean
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
	// Source `.itemButton`: normal ink weight, with a weight bump on hover/focus.
	// The panel is ALWAYS dark — it does not follow the theme — so its ink and hover
	// wash are literal, not semantic tokens: `text-fg` / `bg-surface-muted` flip with
	// `[data-theme]` and would go dark-on-dark in a light shell. Raw values (rather
	// than new `--color-context-menu-*` custom properties) because every token in
	// this design system is generated into @podoba/tokens' `variables.css` from the
	// upstream API — a hand-written custom property has nowhere to be defined and
	// silently resolves to nothing.
	baseClass:
		'flex min-h-8.5 min-w-0 cursor-pointer select-none items-center gap-2.5 rounded-[10px] px-3 py-1.5 ' +
		'text-compact leading-4 tracking-normal font-normal text-white outline-none ' +
		'data-[focused]:bg-[#2f2f2f] data-[focused]:font-medium data-[hovered]:bg-[#2f2f2f] data-[hovered]:font-medium ' +
		'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-45',
	variants: {
		// gs `var(--color-error-light, #ffb5b5)`: the Manager defines `--color-error-light`
		// as #fee2e2, so the rendered source ink is #fee2e2 (the #ffb5b5 fallback never
		// applies). `--color-danger-light` DOES exist, but it flips to a ~15% translucent
		// red under `[data-theme="dark"]` and would all but vanish here; `text-danger`
		// (#dc2626) is a light-surface red that fails contrast on #242424.
		destructive: { true: 'text-[#fee2e2] data-[focused]:text-[#fee2e2]' },
	},
}) as (
	props: React.ComponentProps<typeof RACMenuItem> & { destructive?: boolean },
) => ReturnType<typeof RACMenuItem>

// gs `.panel`: 258px, radius 12px, 8px/6px padding, 180deg #242424→#1f1f1f gradient,
// 0 12px 28px rgba(0,0,0,.22) shadow. No token covers the gradient or the shadow, and
// see the note on MenuItem for why these stay literal rather than becoming tokens.
// Constrain/scroll the entire panel, INCLUDING its 8px top/bottom padding —
// constraining the inner Menu instead makes a long panel exceed the viewport gutter.
const panelClass =
	'w-[258px] max-w-[calc(100vw-16px)] max-h-[calc(100vh-16px)] box-border overflow-y-auto rounded-xl ' +
	'bg-gradient-to-b from-[#242424] to-[#1f1f1f] ' +
	'px-1.5 py-2 shadow-[0_12px_28px_rgba(0,0,0,0.22)] outline-none'
// `minmax(0, 1fr)` tracks: an `auto` grid column grows to the items' nowrap
// min-content, so a long label plus a trailing pill pushed rows past the 258px panel.
const menuClass = 'grid grid-cols-[minmax(0,1fr)] gap-0.5 outline-none'

const CursorPopoverSurface = uic(RACPopover, {
	displayName: 'ContextMenuPopoverSurface',
	baseClass: panelClass,
})

/** RAC owns interaction; source-style fixed cursor geometry owns placement. */
function CursorMenuPopover({
	position,
	panelRef,
	...props
}: Omit<React.ComponentProps<typeof RACPopover>, 'ref' | 'key' | 'children' | 'className'> & {
	position: { x: number; y: number }
	panelRef: React.RefObject<HTMLElement | null>
	/**
	 * Plain children only. `uic` intersects RAC's `ChildrenOrFunction` with a bare
	 * `ReactNode`, which is an impossible type (a render function AND a string), so
	 * the render-prop form cannot be forwarded through this wrapper — and this menu
	 * never uses it.
	 */
	children?: ReactNode
	/** Plain class string only, for the same reason as `children` above. */
	className?: string
}) {
	// This menu is anchored to a viewport coordinate, not a scrollable DOM trigger.
	// With automatic positioning disabled, a null trigger also avoids RAC dismissing
	// it when a trigger ancestor scrolls. Focus restoration belongs to RAC's FocusScope.
	const cursorAnchorRef = useRef<HTMLElement | null>(null)
	const [panel, setPanel] = useState<HTMLElement | null>(null)
	const [measured, setMeasured] = useState<{
		panel: HTMLElement; sourceX: number; sourceY: number; x: number; y: number
	} | null>(null)
	const ref = useCallback((element: HTMLElement | null) => {
		panelRef.current = element
		setPanel(element)
	}, [panelRef])
	const { x: sourceX, y: sourceY } = position
	useLayoutEffect(() => {
		if (!panel || !props.isOpen) return
		let active = true
		const measure = () => {
			if (!active) return
			// offsetHeight includes the padding and respects the panel's viewport cap.
			const x = Math.max(8, Math.min(sourceX, window.innerWidth - panel.offsetWidth - 8))
			const y = Math.max(8, Math.min(sourceY, window.innerHeight - panel.offsetHeight - 8))
			setMeasured(previous => previous?.panel === panel && previous.sourceX === sourceX && previous.sourceY === sourceY && previous.x === x && previous.y === y
				? previous : { panel, sourceX, sourceY, x, y })
		}
		measure()
		window.addEventListener('resize', measure)
		// Dynamic permissions, translated labels or group counts can resize an open menu.
		const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure)
		observer?.observe(panel)
		return () => {
			active = false
			window.removeEventListener('resize', measure)
			observer?.disconnect()
		}
	}, [panel, props.isOpen, sourceX, sourceY])
	const onOpenChange = props.onOpenChange
	useEffect(() => {
		if (!panel || !props.isOpen) return
		// Source uses outside mousedown, without consuming the background's action.
		// Non-modal RAC keeps its blur/Escape/focus handling but does not supply this listener.
		const dismissOutside = (event: Event) => {
			if (event.target instanceof Node && !panel.contains(event.target)) onOpenChange?.(false)
		}
		const dismissTouch = (event: PointerEvent) => {
			if (event.pointerType !== 'mouse') dismissOutside(event)
		}
		document.addEventListener('mousedown', dismissOutside)
		document.addEventListener('pointerdown', dismissTouch)
		return () => {
			document.removeEventListener('mousedown', dismissOutside)
			document.removeEventListener('pointerdown', dismissTouch)
		}
	}, [panel, props.isOpen, onOpenChange])
	const resolved = measured && measured.panel === panel && measured.sourceX === sourceX && measured.sourceY === sourceY ? measured : null
	// Annotated rather than inlined: RAC types `style` as a union with a render-prop
	// function, so an inline literal is not contextually narrowed and `position`
	// widens to `string`.
	const panelStyle: CSSProperties = {
		position: 'fixed',
		left: resolved?.x ?? sourceX,
		top: resolved?.y ?? sourceY,
		// Override RAC's unmeasured inline 100vh, which would otherwise beat the CSS cap.
		maxHeight: 'calc(100vh - 16px)',
		opacity: resolved ? 1 : 0, // Unlike visibility:hidden, keeps RAC's initial autofocus possible.
	}
	return <CursorPopoverSurface
		{...props}
		ref={ref}
		triggerRef={cursorAnchorRef}
		data-context-menu-panel=""
		shouldUpdatePosition={false}
		shouldFlip={false}
		isNonModal
		style={panelStyle}
	/>
}

/**
 * The popover body shared by both modes — the RAC `Menu` of grouped items. `onItem`
 * fires after an item's own handler so either mode can close the menu.
 */
function ContextMenuBody({
	groups,
	soonLabel,
	ariaLabel,
	onItem,
}: {
	groups: ContextMenuGroup[]
	soonLabel?: ReactNode
	ariaLabel: string
	onItem?: () => void
}) {
	return (
		<RACMenu aria-label={ariaLabel} className={menuClass} autoFocus onClose={onItem}>
			{groups.map((group, gi) => (
				// gs separates groups with an 18px top margin (`.group + .group`), not a
				// rule line — so the first group sits flush, the rest gain the gap.
				<RACMenuSection key={groupId(group, gi)} className={gi > 0 ? 'mt-4.5 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-0.5' : 'grid min-w-0 grid-cols-[minmax(0,1fr)] gap-0.5'}>
					{group.label ? (
						// The grid contributes 2px: 2px margin + 2px gap = source 4px below label.
						<Header className="mx-2 mt-1.5 mb-0.5 text-compact leading-4 tracking-normal font-medium text-white">{group.label}</Header>
					) : null}
					{group.items.map((item, ii) => {
						const id = itemId(item, ii)
						const select = item.onSelect ?? item.onAction
						const badge = item.badge ?? (item.disabled && !select ? soonLabel : null)
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
									<span className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center [&>svg]:size-full">
										{item.icon}
									</span>
								) : null}
								<span className="min-w-0 flex-1 truncate" title={item.title}>{item.label}</span>
								{badge ? (
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
	soonLabel,
	'aria-label': ariaLabel = 'Actions',
	className,
}: ContextMenuProps): React.JSX.Element | null {
	const popoverRef = useRef<HTMLElement>(null)
	const visibleGroups = visibleGroupsOf(groups)
	if (visibleGroups.length === 0) {
		return null
	}
	const pos = position ?? { x: 0, y: 0 }
	return (
			<CursorMenuPopover
				key={`${pos.x}:${pos.y}`}
				panelRef={popoverRef}
				position={pos}
				isOpen={isOpen}
				onOpenChange={(open) => {
					if (!open) {
						onClose()
					}
				}}
				placement="bottom start"
				offset={0}
				containerPadding={8}
				className={className}
			>
				<ContextMenuBody groups={visibleGroups} soonLabel={soonLabel} ariaLabel={ariaLabel} onItem={onClose} />
			</CursorMenuPopover>
	)
}

/** Wrapper context menu — wraps a target and owns its own open state. */
function WrapperContextMenu({
	groups,
	shouldOpen,
	children,
	soonLabel,
	'aria-label': ariaLabel = 'Actions',
	className,
}: ContextMenuWrapperProps): React.JSX.Element {
	const [isOpen, setOpen] = useState(false)
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
	const shouldOpenRef = useRef(shouldOpen)
	shouldOpenRef.current = shouldOpen

	const openAt = (x: number, y: number, target: HTMLElement) => {
		if (typeof groupsRef.current === 'function') {
			setResolved(groupsRef.current({ target }))
		}
		setPosition({ x, y })
		setOpen(true)
	}

	const onContextMenu = (e: React.MouseEvent) => {
		if (e.defaultPrevented) return
		const target = e.target instanceof HTMLElement ? e.target : e.currentTarget as HTMLElement
		if (shouldOpenRef.current?.(target) === false) {
			setOpen(false)
			return
		}
		e.preventDefault()
		openAt(e.clientX, e.clientY, target)
	}

	const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.defaultPrevented || (e.key !== 'ContextMenu' && !(e.key === 'F10' && e.shiftKey))) return
		const target = e.target instanceof HTMLElement ? e.target : e.currentTarget
		if (shouldOpenRef.current?.(target) === false) return
		e.preventDefault()
		e.stopPropagation()
		const rect = target.getBoundingClientRect()
		openAt(rect.left, rect.bottom, target)
	}

	// While the panel is open, a second right-click would otherwise be swallowed by
	// the overlay's outside-press dismissal and surface the BROWSER's native menu.
	// Intercept it ourselves: keep the OS menu suppressed and move our panel to
	// the new cursor in-place (no queued close/reopen frame). A
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
			if (shouldOpenRef.current?.(target) === false) {
				setOpen(false)
				return
			}
			// In our region with the panel open: update target and pointer atomically.
			// The cursor clamp reacts to position changes without dismissing the menu.
			e.preventDefault()
			e.stopImmediatePropagation()
			const { clientX, clientY } = e
			if (typeof groupsRef.current === 'function') {
				setResolved(groupsRef.current({ target }))
			}
			setPosition({ x: clientX, y: clientY })
		}
		document.addEventListener('contextmenu', handle, true)
		return () => document.removeEventListener('contextmenu', handle, true)
	}, [isOpen])

	const sourceGroups = typeof groups === 'function' ? resolved : groups
	const visibleGroups = visibleGroupsOf(sourceGroups)

	return (
		<div ref={wrapperRef} className={className} onContextMenu={onContextMenu} onKeyDown={onKeyDown}>
			{children}
			{visibleGroups.length > 0 ? (
				<CursorMenuPopover
					panelRef={popoverRef}
					position={position}
					isOpen={isOpen}
					onOpenChange={setOpen}
					placement="bottom start"
					offset={0}
					containerPadding={8}
				>
					<ContextMenuBody groups={visibleGroups} soonLabel={soonLabel} ariaLabel={ariaLabel} onItem={() => setOpen(false)} />
				</CursorMenuPopover>
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
