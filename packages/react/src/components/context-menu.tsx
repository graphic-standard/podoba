import {
	type CSSProperties,
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from 'react'
import {
	Button as RACButton,
	Header,
	Menu as RACMenu,
	MenuItem as RACMenuItem,
	MenuSection as RACMenuSection,
	Modal as RACModal,
	ModalOverlay as RACModalOverlay,
	Popover as RACPopover,
} from 'react-aria-components'
import { uic } from '../utils/uic'
import {
	CONTEXT_MENU_TARGET_ATTRIBUTE,
	registerContextMenuTarget,
	useLongPressContextMenu,
} from './context-menu-touch'

export { isLongPressContextMenu, LONG_PRESS_MS, useLongPressContextMenu } from './context-menu-touch'

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
 * Touch, with no change on the screen that uses it:
 *  - A long press ({@link LONG_PRESS_MS}) opens the same menu at the finger, on iOS too
 *    (see `context-menu-touch.ts`), and never twice on Android.
 *  - On a phone (coarse pointer, under 768px) the menu is a bottom sheet with large
 *    rows and the same groups. A desktop, and a tablet, keep the panel at the cursor.
 *  - {@link ContextMenuButton} (or the wrapper's `touchButton`) is the visible "⋯" that
 *    opens the same menu; it only shows on a touch screen.
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
	/** See {@link ContextMenuPresentation}. */
	presentation?: ContextMenuPresentation
}

/**
 * `auto` (default): a bottom sheet on a phone ({@link CONTEXT_MENU_SHEET_QUERY}), the
 * cursor panel elsewhere. `sheet` / `panel` force one, e.g. a menu inside a surface
 * that is already a sheet, or a preview of the phone layout.
 */
export type ContextMenuPresentation = 'auto' | 'sheet' | 'panel'

/** Wrapper API — wrap a target; the component owns the open state. */
interface ContextMenuWrapperProps {
	groups: ContextMenuGroup[] | ContextMenuGroupsResolver
	/** Leave native text/editing menus untouched for excluded targets. */
	shouldOpen?: (target: HTMLElement) => boolean
	children: ReactNode
	soonLabel?: ReactNode
	'aria-label'?: string
	className?: string
	/** See {@link ContextMenuPresentation}. */
	presentation?: ContextMenuPresentation
	/**
	 * Notified when the wrapper's menu opens or closes. `target` is the element that
	 * was right-clicked (null on close), so a surface can mark the item the menu acts on.
	 */
	onOpenChange?: (isOpen: boolean, target: HTMLElement | null) => void
	/**
	 * Show a "⋯" button in the wrapper's top end corner on touch screens, opening the
	 * same menu. For a wrapper around ONE item (a card, a row); a wrapper around a whole
	 * list puts a {@link ContextMenuButton} in each item instead. `true` labels it
	 * "More actions"; a string is the label. Positions the wrapper (`relative`) on touch
	 * screens only.
	 */
	touchButton?: boolean | string
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
	// The panel is ALWAYS dark (it does not follow the theme), so its ink and hover
	// wash come from the fixed `context-menu-*` tokens, not `text-fg` /
	// `bg-surface-muted`, which flip with `[data-theme]` and would go dark-on-dark in
	// a light shell.
	baseClass:
		'flex min-w-0 cursor-pointer select-none items-center rounded-context-menu-item ' +
		'tracking-normal font-normal text-context-menu-fg outline-none ' +
		'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-45',
	variants: {
		size: {
			panel:
				'min-h-8.5 gap-2.5 px-3 py-1.5 text-compact leading-4 ' +
				'data-[focused]:bg-context-menu-hover data-[focused]:font-medium data-[hovered]:bg-context-menu-hover data-[hovered]:font-medium',
			// Phone sheet: 48px rows for a thumb. Menu autofocus lands on the first row, so
			// only a keyboard focus ring or the finger's own press paints the wash; a tap
			// must not open with the first action looking selected.
			sheet:
				'min-h-12 gap-3.5 px-4 py-3 text-body leading-6 ' +
				'data-[focus-visible]:bg-context-menu-hover data-[pressed]:bg-context-menu-hover',
		},
		// `context-menu-danger` (#fee2e2), not `danger-light`, which flips to a ~15%
		// translucent red under `[data-theme="dark"]` and would all but vanish here, and
		// not `text-danger`, a light-surface red that fails contrast on the dark panel.
		destructive: { true: 'text-context-menu-danger data-[focused]:text-context-menu-danger' },
	},
	defaultVariants: { size: 'panel' },
}) as (
	props: React.ComponentProps<typeof RACMenuItem> & { destructive?: boolean; size?: 'panel' | 'sheet' },
) => ReturnType<typeof RACMenuItem>

// gs `.panel`: 258px (`--dimension-context-menu-width`), radius 12px, 8px/6px padding,
// the `context-menu-top` to `context-menu-bottom` gradient and `shadow-context-menu`.
// Constrain/scroll the entire panel, INCLUDING its 8px top/bottom padding —
// constraining the inner Menu instead makes a long panel exceed the viewport gutter.
const panelClass =
	'w-[258px] max-w-[calc(100vw-16px)] max-h-[calc(100vh-16px)] box-border overflow-y-auto rounded-xl ' +
	'bg-gradient-to-b from-context-menu-top to-context-menu-bottom ' +
	'px-1.5 py-2 shadow-context-menu outline-none'
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
 * Where the menu is a bottom sheet: a phone, i.e. a coarse primary pointer on a narrow
 * screen. A tablet (coarse, wide) and a touch laptop (fine) keep the cursor panel.
 */
export const CONTEXT_MENU_SHEET_QUERY = '(pointer: coarse) and (max-width: 767px)'

const subscribeSheet = (change: () => void) => {
	if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {}
	const media = window.matchMedia(CONTEXT_MENU_SHEET_QUERY)
	media.addEventListener?.('change', change)
	return () => media.removeEventListener?.('change', change)
}
const sheetSnapshot = () =>
	typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(CONTEXT_MENU_SHEET_QUERY).matches

function useSheetLayout(): boolean {
	return useSyncExternalStore(subscribeSheet, sheetSnapshot, () => false)
}

// The backdrop sits on the visible viewport, like the shared ModalOverlay, so the
// sheet stays above iOS's toolbars and keyboard.
const sheetOverlayClass =
	'fixed inset-x-0 top-0 z-50 flex h-[var(--visual-viewport-height,100dvh)] items-end bg-black/40 ' +
	'data-[entering]:animate-modal-overlay-in data-[exiting]:animate-modal-overlay-out'
// The same dark panel, docked: full width, rounded top, clear of the home indicator.
const sheetClass =
	'box-border flex max-h-[85%] w-full flex-col overflow-y-auto rounded-t-2xl ' +
	'bg-gradient-to-b from-context-menu-top to-context-menu-bottom shadow-context-menu outline-none ' +
	'px-2 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] ' +
	'data-[entering]:animate-context-sheet-in data-[exiting]:animate-context-sheet-out motion-reduce:animate-none'

/**
 * Phone surface: a modal bottom sheet. RAC's Modal contains focus, hides the page from
 * assistive tech while open, closes on Escape and on a tap on the backdrop, and puts
 * focus back where it was; the menu inside is the same RAC `Menu`.
 */
function SheetMenuSurface({
	isOpen,
	onOpenChange,
	panelRef,
	className,
	children,
}: {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	panelRef: React.RefObject<HTMLElement | null>
	className?: string
	children: ReactNode
}) {
	const ref = useCallback((element: HTMLElement | null) => {
		panelRef.current = element
	}, [panelRef])
	return (
		<RACModalOverlay isOpen={isOpen} onOpenChange={onOpenChange} isDismissable className={sheetOverlayClass}>
			<RACModal ref={ref as React.Ref<HTMLDivElement>} data-context-menu-panel="" data-context-menu-sheet="" className={className ? `${sheetClass} ${className}` : sheetClass}>
				<div aria-hidden="true" className="mx-auto mb-2 h-1 w-9 shrink-0 rounded-full bg-white/25" />
				{children}
			</RACModal>
		</RACModalOverlay>
	)
}

/** Cursor panel on a desktop, bottom sheet on a phone; the same menu inside. */
function ContextMenuSurface({
	position,
	panelRef,
	isOpen,
	onOpenChange,
	className,
	children,
	positionKey,
	presentation = 'auto',
}: {
	position: { x: number; y: number }
	panelRef: React.RefObject<HTMLElement | null>
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	className?: string
	children: (sheet: boolean) => ReactNode
	/** Remounts the cursor panel per position (the controlled API's existing behaviour). */
	positionKey?: string
	presentation?: ContextMenuPresentation
}) {
	const phone = useSheetLayout()
	const sheet = presentation === 'sheet' || (presentation === 'auto' && phone)
	if (sheet) {
		return (
			<SheetMenuSurface isOpen={isOpen} onOpenChange={onOpenChange} panelRef={panelRef} className={className}>
				{children(true)}
			</SheetMenuSurface>
		)
	}
	return (
		<CursorMenuPopover
			key={positionKey}
			panelRef={panelRef}
			position={position}
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			placement="bottom start"
			offset={0}
			containerPadding={8}
			className={className}
		>
			{children(false)}
		</CursorMenuPopover>
	)
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
	sheet = false,
}: {
	groups: ContextMenuGroup[]
	soonLabel?: ReactNode
	ariaLabel: string
	onItem?: () => void
	sheet?: boolean
}) {
	const size = sheet ? 'sheet' : 'panel'
	return (
		<RACMenu aria-label={ariaLabel} className={menuClass} autoFocus onClose={onItem}>
			{groups.map((group, gi) => (
				// gs separates groups with an 18px top margin (`.group + .group`), not a
				// rule line — so the first group sits flush, the rest gain the gap.
				<RACMenuSection key={groupId(group, gi)} className={gi > 0 ? 'mt-4.5 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-0.5' : 'grid min-w-0 grid-cols-[minmax(0,1fr)] gap-0.5'}>
					{group.label ? (
						// The grid contributes 2px: 2px margin + 2px gap = source 4px below label.
						<Header className={sheet
							? 'mx-4 mt-1 mb-1 text-small leading-5 tracking-normal font-medium text-white'
							: 'mx-2 mt-1.5 mb-0.5 text-compact leading-4 tracking-normal font-medium text-white'}>{group.label}</Header>
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
								size={size}
								onAction={() => {
									select?.()
									onItem?.()
								}}
							>
								{item.icon ? (
									<span className={`inline-flex ${sheet ? 'h-5 w-5' : 'h-3.5 w-3.5'} shrink-0 items-center justify-center [&>svg]:size-full`}>
										{item.icon}
									</span>
								) : null}
								<span className="min-w-0 flex-1 truncate" title={item.title}>{item.label}</span>
								{badge ? (
									<span className="ml-auto inline-flex h-6 items-center justify-center rounded-full bg-context-menu-badge-bg px-3 py-0.5 text-micro font-medium leading-5 tracking-tight text-context-menu-badge-fg">
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
	presentation,
}: ContextMenuProps): React.JSX.Element | null {
	const popoverRef = useRef<HTMLElement>(null)
	const visibleGroups = visibleGroupsOf(groups)
	if (visibleGroups.length === 0) {
		return null
	}
	const pos = position ?? { x: 0, y: 0 }
	return (
		<ContextMenuSurface
			presentation={presentation}
			positionKey={`${pos.x}:${pos.y}`}
			panelRef={popoverRef}
			position={pos}
			isOpen={isOpen}
			onOpenChange={(open) => {
				if (!open) {
					onClose()
				}
			}}
			className={className}
		>
			{(sheet) => <ContextMenuBody groups={visibleGroups} soonLabel={soonLabel} ariaLabel={ariaLabel} onItem={onClose} sheet={sheet} />}
		</ContextMenuSurface>
	)
}

/** What a {@link ContextMenuButton} inside a wrapper uses to open the wrapper's menu. */
interface WrapperMenuContext {
	openFrom: (target: HTMLElement, x: number, y: number) => void
	isOpen: boolean
	target: HTMLElement | null
}
const WrapperMenu = createContext<WrapperMenuContext | null>(null)

/**
 * Coarse-pointer-only target styling: no iOS link/image callout on a hold, except in
 * text fields, where the callout is paste and select. Text selection is held off by
 * the long-press detector only while a finger rests on a target.
 */
export const contextMenuTargetClass =
	'[-webkit-touch-callout:none] [&_:is(input,textarea,[contenteditable])]:[-webkit-touch-callout:default]'

/** Wrapper context menu — wraps a target and owns its own open state. */
function WrapperContextMenu({
	groups,
	shouldOpen,
	children,
	soonLabel,
	'aria-label': ariaLabel = 'Actions',
	className,
	onOpenChange,
	touchButton,
	presentation,
}: ContextMenuWrapperProps): React.JSX.Element {
	useLongPressContextMenu()
	const [isOpen, setOpenState] = useState(false)
	const onOpenChangeRef = useRef(onOpenChange)
	onOpenChangeRef.current = onOpenChange
	const targetRef = useRef<HTMLElement | null>(null)
	// State twin of targetRef, for a ⋯ button's aria-expanded.
	const [openTarget, setOpenTarget] = useState<HTMLElement | null>(null)
	const setOpen = useCallback((open: boolean) => {
		setOpenState(open)
		if (!open) targetRef.current = null
		setOpenTarget(targetRef.current)
		onOpenChangeRef.current?.(open, open ? targetRef.current : null)
	}, [])
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

	// The detector holds off text selection only on targets that would open the menu.
	useEffect(() => {
		const wrapper = wrapperRef.current
		if (!wrapper) return
		return registerContextMenuTarget(wrapper, (target) =>
			shouldOpenRef.current?.(target instanceof HTMLElement ? target : wrapper) !== false)
	}, [])

	const openAt = (x: number, y: number, target: HTMLElement) => {
		if (typeof groupsRef.current === 'function') {
			setResolved(groupsRef.current({ target }))
		}
		setPosition({ x, y })
		targetRef.current = target
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
			targetRef.current = target
			setOpenTarget(target)
			onOpenChangeRef.current?.(true, target)
		}
		document.addEventListener('contextmenu', handle, true)
		return () => document.removeEventListener('contextmenu', handle, true)
	}, [isOpen])

	const sourceGroups = typeof groups === 'function' ? resolved : groups
	const visibleGroups = visibleGroupsOf(sourceGroups)

	// A ⋯ button is an explicit opener, so `shouldOpen` (which usually turns buttons
	// away to keep their native menu) does not apply to it.
	const context: WrapperMenuContext = { openFrom: (target, x, y) => openAt(x, y, target), isOpen, target: openTarget }
	const wrapperClass = [className, contextMenuTargetClass, touchButton ? 'pointer-coarse:relative' : null].filter(Boolean).join(' ')

	return (
		<div
			ref={wrapperRef}
			className={wrapperClass}
			{...{ [CONTEXT_MENU_TARGET_ATTRIBUTE]: '' }}
			onContextMenu={onContextMenu}
			onKeyDown={onKeyDown}
		>
			<WrapperMenu.Provider value={context}>
				{children}
				{touchButton ? (
					<ContextMenuButton
						aria-label={typeof touchButton === 'string' ? touchButton : undefined}
						className="absolute end-1.5 top-1.5 z-10 size-10 bg-surface/90 text-fg shadow-xs"
					/>
				) : null}
			</WrapperMenu.Provider>
			{visibleGroups.length > 0 ? (
				<ContextMenuSurface presentation={presentation} panelRef={popoverRef} position={position} isOpen={isOpen} onOpenChange={setOpen}>
					{(sheet) => <ContextMenuBody groups={visibleGroups} soonLabel={soonLabel} ariaLabel={ariaLabel} onItem={() => setOpen(false)} sheet={sheet} />}
				</ContextMenuSurface>
			) : null}
		</div>
	)
}

/** What a ⋯ button hands its `onOpen`: the shape `useContextMenu().open` takes. */
export interface ContextMenuOpenEvent {
	preventDefault: () => void
	clientX: number
	clientY: number
	/** The ⋯ button, so a resolver can read `target.closest('[data-…]')`. */
	target: HTMLElement
	currentTarget: HTMLElement
}

export interface ContextMenuButtonProps {
	/** Defaults to "More actions". */
	'aria-label'?: string
	/**
	 * Opens the menu. Omit inside a `<ContextMenu>` wrapper: the button opens the
	 * wrapper's menu as if its item had been right-clicked. Pass `menu.open` from
	 * {@link useContextMenu} for a controlled menu.
	 */
	onOpen?: (event: ContextMenuOpenEvent) => void
	/** For a controlled menu: whether the menu this button opened is open. */
	isExpanded?: boolean
	/**
	 * `touch` (default) shows the button only where there is no right-click: a coarse
	 * pointer. Elsewhere it is not rendered visibly nor in the tab order, so desktop and
	 * keyboard use stay as they were (Shift+F10 / the menu key still open the menu).
	 */
	visibility?: 'touch' | 'always'
	className?: string
	/** Replaces the ⋯ glyph. */
	children?: ReactNode
}

const MoreButtonSurface = uic(RACButton, {
	displayName: 'ContextMenuButton',
	baseClass:
		'inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 ' +
		'text-fg-muted outline-none [-webkit-tap-highlight-color:transparent] ' +
		'data-[pressed]:bg-surface-muted data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring',
	variants: {
		visibility: { touch: 'hidden pointer-coarse:inline-flex', always: '' },
	},
}) as (props: React.ComponentProps<typeof RACButton> & { visibility?: 'touch' | 'always'; className?: string; children?: ReactNode }) => ReturnType<typeof RACButton>

function MoreGlyph() {
	return (
		<svg viewBox="0 0 15 15" width="20" height="20" fill="currentColor" aria-hidden="true">
			<circle cx="3" cy="7.5" r="1.25" />
			<circle cx="7.5" cy="7.5" r="1.25" />
			<circle cx="12" cy="7.5" r="1.25" />
		</svg>
	)
}

/**
 * The visible "⋯" that opens the same context menu, for touch screens, where a
 * right-click does not exist and a long press is not discoverable. Put one in each item
 * of a wrapped list (it opens with that item as the target), or pass `onOpen` for a
 * controlled menu: `<ContextMenuButton onOpen={menu.open} />`.
 */
export function ContextMenuButton({
	'aria-label': ariaLabel = 'More actions',
	onOpen,
	isExpanded,
	visibility = 'touch',
	className,
	children,
}: ContextMenuButtonProps): React.JSX.Element {
	const wrapper = useContext(WrapperMenu)
	const ref = useRef<HTMLButtonElement>(null)
	const expanded = isExpanded ?? (wrapper ? wrapper.isOpen && wrapper.target === ref.current && ref.current !== null : undefined)
	return (
		<MoreButtonSurface
			ref={ref}
			aria-label={ariaLabel}
			aria-haspopup="menu"
			aria-expanded={expanded}
			visibility={visibility}
			className={className}
			// Inside a card that is itself a link or a button, the tap stays on the ⋯.
			onClick={(event: React.MouseEvent) => {
				event.preventDefault()
				event.stopPropagation()
			}}
			onPress={() => {
				const button = ref.current
				if (!button) return
				const rect = button.getBoundingClientRect()
				// The panel's top start corner just under the button; the clamp keeps it on screen.
				const x = rect.left
				const y = rect.bottom + 4
				if (onOpen) {
					onOpen({ preventDefault: () => {}, clientX: x, clientY: y, target: button, currentTarget: button })
				} else {
					wrapper?.openFrom(button, x, y)
				}
			}}
		>
			{children ?? <MoreGlyph />}
		</MoreButtonSurface>
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
 *
 * A touch long press reaches `onContextMenu` too while the hook is mounted. Spreading
 * `menu.targetProps` instead of `onContextMenu={menu.open}` also keeps iOS's callout
 * and text selection off the target during the hold. `<ContextMenuButton
 * onOpen={menu.open} />` is the visible touch opener.
 */
export function useContextMenu(): {
	isOpen: boolean
	position: { x: number; y: number } | null
	open: (e: { preventDefault: () => void; clientX: number; clientY: number }) => void
	close: () => void
	props: Pick<ContextMenuProps, 'isOpen' | 'position' | 'onClose'>
	targetProps: {
		onContextMenu: (e: { preventDefault: () => void; clientX: number; clientY: number }) => void
		className: string
		'data-context-menu-target': ''
	}
} {
	useLongPressContextMenu()
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
		targetProps: { onContextMenu: open, className: contextMenuTargetClass, 'data-context-menu-target': '' },
	}
}
