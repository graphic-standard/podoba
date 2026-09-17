import type { ComponentProps, Key, ReactNode } from 'react'
import {
	Button as RACButton,
	ComboBox as RACComboBox,
	type ComboBoxProps as RACComboBoxProps,
	Input as RACInput,
	Label,
	ListBox,
	ListBoxItem,
	type ListBoxItemProps,
	Header,
	Menu as RACMenu,
	MenuItem as RACMenuItem,
	type MenuItemProps,
	MenuSection,
	MenuTrigger,
	Popover,
} from 'react-aria-components'
import { uic } from '../utils/uic'
import { dropdownMenuItemClass, dropdownMenuPanelClass, DropdownMenuSeparator } from '../components/dropdown-menu'

/**
 * Topbar — sticky application header (ported pattern from gs-manager's
 * `Topbar` / `AppShell.topbar`; gs AppHeader bar ~52px → `h-14`).
 *
 * The gs-manager original is a flex row (`justify-between`, `height: 72px`,
 * bottom border, background) with a left "brand row" (logo + primary subnav)
 * and a right "actions" cluster (theme toggle, user info, logout). That SCSS
 * intent is reimplemented here in Tailwind via `uic`, decomposed into slots so
 * `@app/ui` consumers compose their own brand / nav / actions content:
 *
 *   <Topbar>
 *     <Topbar.Brand>…</Topbar.Brand>
 *     <Topbar.Nav>…</Topbar.Nav>      // grows to fill, holds NavLink items
 *     <Topbar.Actions>…</Topbar.Actions>
 *   </Topbar>
 *
 * Landmark: renders a `<header>` so it is an accessible banner landmark.
 * AppShell keeps it visually sticky via its grid rows (`auto 1fr`).
 */
// gs-manager `Topbar.topbar`: title/logo left, nav + actions clustered on the
// right — with a 1px bottom border (`--color-border`). gs sets
// `padding: 0 spacing-6`; the horizontal page padding is supplied by AppShell's
// sticky topbar row, so only the fixed height + border live here. The border sits
// on this header so it aligns (inset) with the padded content below. The source
// Embedded Manager topbar contract is exactly 77px.
const TopbarRoot = uic('header', {
	displayName: 'Topbar',
	baseClass: 'flex h-[77px] w-full items-center gap-5 border-b border-border px-6',
})

// Embedded Hub brand treatment: 14/18, medium, normal tracking.
const TopbarBrand = uic('div', {
	displayName: 'Topbar.Brand',
	baseClass:
		'flex min-w-0 items-center gap-3 text-small leading-[18px] font-medium tracking-[0] text-fg',
})

// `ml-auto` pushes the nav (and the actions after it) to the right, matching gs's
// title-left / nav-right layout.
const TopbarNavBase = uic('nav', {
	displayName: 'Topbar.Nav',
	baseClass: 'ml-auto flex h-9 min-w-0 items-start gap-2 overflow-x-auto',
})

// `@app/ui` ships no i18n — the accessible name of the nav landmark is REQUIRED
// from the consumer (translated there), never an English default baked in here.
type TopbarNavProps = ComponentProps<typeof TopbarNavBase> & { 'aria-label': string }
const TopbarNav = (props: TopbarNavProps) => <TopbarNavBase {...props} />

const TopbarActions = uic('div', {
	displayName: 'Topbar.Actions',
	baseClass: 'ml-auto flex items-center gap-4',
})

/**
 * NavLink — a single primary-navigation item. Mirrors gs-manager's AppHeader
 * nav-tab styling: 6px × 13px padding, 2px corners and 13/16 typography.
 * Hover and active share the neutral-100 fill without changing font weight.
 * gs maps BOTH `--color-background-hover` and `--color-background-active` to
 * `--color-neutral-100`, so a single `surface-muted` token covers both states
 * (no distinct active token to map). Renders an `<a>` by default; pass `asChild`
 * to delegate to a router `Link`.
 *
 * Active state keys on the bare `data-active` attribute (presence). `@buzola/router`'s
 * `<Link>` sets `data-active=""` when the target matches the current URL (and, with
 * `activeExact={false}`, on prefix match too), so the selector must be `data-[active]`,
 * NOT `data-[active=true]` — the latter never matches buzola's empty-string value.
 */
const TopbarNavLink = uic('a', {
	displayName: 'Topbar.NavLink',
	baseClass:
		// gs inactive ink is `#242423` (the neutral that `surface-inverted` carries in
		// light theme and flips to a light ink on the dark shell); hover/active darken to
		// `fg`. gs `Button.module.scss` eases bg + colour over 120ms `ease`.
		'inline-flex items-center rounded-sm px-[13px] py-[6px] text-compact leading-4 tracking-[0] whitespace-nowrap ' +
		'text-surface-inverted no-underline transition-colors duration-120 ease-[ease] motion-reduce:transition-none ' +
		'hover:bg-surface-muted hover:text-fg outline-none ' +
		'focus-visible:ring-2 focus-visible:ring-ring ' +
		'data-[active]:bg-surface-muted data-[active]:text-fg',
	// `active` is accepted both as an explicit prop (uic emits `data-active=""` when
	// true, nothing when false/unset — see dataAttribute) and, via `asChild`, from
	// @buzola/router's <Link> which also sets `data-active=""` on match. Either way the
	// `data-[active]` presence selectors above apply. NOTE the value is the EMPTY
	// string, so a `data-[active=true]` selector would never match — keep `data-[active]`.
	variants: {
		active: { true: '', false: '' },
	},
	variantsAsDataAttrs: ['active'],
})

export type WorkspaceOption = {
	id: string
	name: string
}

export type WorkspaceSwitcherProps = Omit<
	RACComboBoxProps<WorkspaceOption>,
	'children' | 'items'
> & {
	/**
	 * Visible (or screen-reader-only) label for the combobox. REQUIRED — `@app/ui`
	 * ships no i18n, so the consumer passes a translated string.
	 */
	label: ReactNode
	/** Workspaces available to the current user (from the `whoami` query). */
	workspaces: WorkspaceOption[]
	/** Hide the visible label, keeping it for assistive tech only. */
	hideLabel?: boolean
}

/**
 * WorkspaceSwitcher — RAC `ComboBox` listing the user's workspaces. Phase 1
 * is presentational: the consumer feeds `workspaces` (from `whoami`) and wires
 * `selectedKey` / `onSelectionChange`. RAC supplies the combobox ARIA pattern,
 * typeahead filtering and keyboard nav.
 */
export const WorkspaceSwitcher = ({
	label,
	workspaces,
	hideLabel = true,
	...props
}: WorkspaceSwitcherProps) => (
	<RACComboBox {...props} items={workspaces} className="flex flex-col gap-1">
		<Label className={hideLabel ? 'sr-only' : 'text-small font-medium text-fg'}>{label}</Label>
		<div className="flex items-center">
			<RACInput
				className={
					'h-9 w-48 rounded-md border border-border bg-surface px-3 text-small text-fg outline-none ' +
					'data-[focused]:ring-2 data-[focused]:ring-ring'
				}
			/>
		</div>
		<Popover className="min-w-[var(--trigger-width)] rounded-md border border-border bg-surface p-1 shadow-lg">
			<ListBox>
				{(workspace: WorkspaceOption) => (
					<WorkspaceSwitcherItem id={workspace.id} textValue={workspace.name}>
						{workspace.name}
					</WorkspaceSwitcherItem>
				)}
			</ListBox>
		</Popover>
	</RACComboBox>
)

const WorkspaceSwitcherItem = uic(ListBoxItem, {
	displayName: 'WorkspaceSwitcher.Item',
	baseClass:
		'flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-small text-fg outline-none ' +
		'data-[focused]:bg-surface-muted data-[selected]:font-medium',
}) as (props: ListBoxItemProps) => ReactNode

export type UserMenuProps = {
	/** Trigger label / avatar content (e.g. user initials or name). */
	trigger: ReactNode
	/**
	 * Accessible label for the trigger button. REQUIRED — `@app/ui` ships no
	 * i18n, so the consumer passes a translated string.
	 */
	triggerLabel: string
	/** Called when the user activates a menu item; the item's `id` is passed. */
	onAction?: (key: Key) => void
	children: ReactNode
}

/**
 * UserMenu — RAC `Menu` for the account cluster (settings link, sign out).
 * gs-manager rendered avatar + name + a logout button inline; here it is a
 * proper menu so additional items (settings, profile) compose cleanly. RAC
 * handles the menu ARIA pattern, focus trapping and keyboard nav.
 */
export const UserMenu = ({ trigger, triggerLabel, onAction, children }: UserMenuProps) => (
	<MenuTrigger>
		<RACButton
			aria-label={triggerLabel}
			className={
				'flex h-9 items-center gap-2 rounded-md px-2 text-small font-medium text-fg outline-none ' +
				'transition-colors hover:bg-surface-muted ' +
				'data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring'
			}
		>
			{trigger}
		</RACButton>
		{/* gs Hub account menu = the shared gs DropdownMenu panel, bottom-end aligned. */}
		<Popover placement="bottom end" className={dropdownMenuPanelClass}>
			<RACMenu onAction={onAction} className="outline-none">
				{children}
			</RACMenu>
		</Popover>
	</MenuTrigger>
)

export const UserMenuItem = uic(RACMenuItem, {
	displayName: 'UserMenu.Item',
	baseClass: `${dropdownMenuItemClass} data-[disabled]:pointer-events-none`,
}) as (props: MenuItemProps) => ReactNode

/**
 * Two-line item copy (gs `.menuItemStack`): a primary label with a small muted hint
 * underneath, e.g. "Manager / Current" or "Settings / Opens in GS Manager".
 */
export const UserMenuItemText = ({ label, hint }: { label: ReactNode; hint?: ReactNode }) => (
	<span className="flex min-w-0 flex-col items-start gap-1">
		<span>{label}</span>
		{hint ? <span className="text-micro leading-5 font-normal text-fg-muted">{hint}</span> : null}
	</span>
)

/**
 * Non-interactive identity block at the top of the account menu (gs
 * `.userMenuLabel`): the person's name (13px medium) over a muted detail line.
 */
export const UserMenuIdentity = ({ name, detail }: { name: ReactNode; detail?: ReactNode }) => (
	<MenuSection>
		<Header className="flex flex-col gap-1 px-4 py-3">
			<span className="text-compact font-medium text-fg">{name}</span>
			{detail ? <span className="mt-1 text-micro leading-5 font-medium text-fg-muted">{detail}</span> : null}
		</Header>
	</MenuSection>
)

export type UserMenuSectionProps = { label?: ReactNode; children: ReactNode; 'aria-label'?: string }

/** A labelled group of account-menu items (gs `.menuSectionLabel`, e.g. "Apps"). */
export const UserMenuSection = ({ label, children, ...props }: UserMenuSectionProps) => (
	<MenuSection {...props}>
		{label ? <Header className="px-2 pt-2 pb-1 text-micro leading-5 font-medium text-fg-muted">{label}</Header> : null}
		{children}
	</MenuSection>
)

/**
 * Non-interactive muted line at the foot of the account menu, e.g. the running app
 * version (`v2026.09.17 · a1b2c3d`). Like `UserMenuIdentity` it is a section header,
 * so it is never focusable and never announced as an action. The text stays
 * selectable so it can be copied into a bug report.
 *
 * `label` names the line for assistive tech only ("App version: v2026.09.17 · …").
 * It has to live inside the header: React Aria names the section from its header,
 * which would override an `aria-label` on the section. REQUIRED and a plain string,
 * because podoba ships no i18n.
 */
export const UserMenuMeta = ({ label, children }: { label: string; children: ReactNode }) => (
	<MenuSection>
		<Header className="select-text px-4 py-2 text-micro leading-5 font-normal tabular-nums text-fg-muted">
			<span className="sr-only">{`${label}: `}</span>
			{children}
		</Header>
	</MenuSection>
)

/** 1px rule between account-menu groups (gs `.separator`). */
export const UserMenuSeparator = DropdownMenuSeparator

export const Topbar = Object.assign(TopbarRoot, {
	Brand: TopbarBrand,
	Nav: TopbarNav,
	NavLink: TopbarNavLink,
	Actions: TopbarActions,
})
