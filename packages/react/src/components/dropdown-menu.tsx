import type { ReactNode } from 'react'
import {
	Header,
	Menu as RACMenu,
	MenuItem as RACMenuItem,
	type MenuItemProps as RACMenuItemProps,
	type MenuProps as RACMenuProps,
	MenuSection as RACMenuSection,
	type MenuSectionProps as RACMenuSectionProps,
	MenuTrigger as RACMenuTrigger,
	Popover as RACPopover,
	type PopoverProps as RACPopoverProps,
	Separator as RACSeparator,
} from 'react-aria-components'
import { uic } from '../utils/uic'

/**
 * DropdownMenu — trigger-anchored action menu (port of gs-platform's LIGHT
 * `DropdownMenu`).
 *
 * Distinct from {@link ContextMenu} (the dark, pointer-positioned right-click
 * `ContextActionPanel`): this is a BUTTON → menu, anchored to its trigger. gs
 * builds it on Radix `DropdownMenu` + an SCSS module; we re-implement on React
 * Aria Components `MenuTrigger` + `Popover` + `Menu`, which provides the WAI-ARIA
 * menu pattern for free — roving focus, arrow / Home / End navigation, type-ahead,
 * Escape-to-close, outside-press dismissal, focus restoration and viewport-aware
 * collision handling (the popover flips / shifts to stay on-screen).
 *
 * Compose it like the RAC primitive — a trigger element next to the menu:
 *
 * ```tsx
 * <DropdownMenuTrigger>
 *   <Button>Actions</Button>
 *   <DropdownMenu aria-label="Actions" onAction={(key) => …}>
 *     <DropdownMenuItem id="rename">Rename</DropdownMenuItem>
 *     <DropdownMenuSeparator />
 *     <DropdownMenuItem id="delete" destructive>Delete</DropdownMenuItem>
 *   </DropdownMenu>
 * </DropdownMenuTrigger>
 * ```
 *
 * gs token map (this is the LIGHT menu, so the gs literals map cleanly to our
 * tokens): content bg white → `surface` · 1px `#eceae1` border → `border` · 8px
 * radius → `rounded-lg` · `shadow-lg` · item 12/16px padding → `py-3 px-4` · 6px
 * item radius → `rounded-md` · item hover `#f7f6f2` → `surface-card` · item text
 * `#0d0d0d` → `fg` · section label `#aba89c` 13px → `text-fg-subtle text-compact`
 * · separator `#eceae1` → `border`. The destructive item uses `text-danger`
 * (`#dc2626`) — a light-surface red that reads correctly here (unlike the dark
 * ContextMenu, which needs the lighter `#ffb5b5`).
 *
 * Presentational only (hard rule #1) — no app imports.
 */

/** Re-export of RAC `MenuTrigger`; owns the open/close state for the pair. */
export const DropdownMenuTrigger = RACMenuTrigger

// gs `.item`: 12/16px padding, 6px radius, base text on white; hover/focus wash
// `#f7f6f2` (→ surface-card). We light up both `data-[focused]` (keyboard) and
// `data-[hovered]` (pointer) so keyboard focus stays clearly visible. Item text
// size follows the house light Select (`text-sm`) rather than gs's 16px base so
// the two light dropdowns stay consistent.
export const DropdownMenuItem = uic(RACMenuItem, {
	displayName: 'DropdownMenuItem',
	baseClass:
		'flex cursor-pointer select-none items-center gap-2.5 rounded-md px-4 py-3 ' +
		'text-sm text-fg outline-none ' +
		'data-[focused]:bg-surface-card data-[hovered]:bg-surface-card ' +
		'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
	variants: {
		// gs has no destructive item style on the light menu; we add the house danger
		// token (red text), which reads correctly on the white / cream surface.
		destructive: { true: 'text-danger data-[focused]:text-danger data-[hovered]:text-danger' },
	},
}) as (props: RACMenuItemProps & { destructive?: boolean }) => ReactNode

// gs `.separator`: 1px rule, 8px vertical margin (`my-2`), `#eceae1` (→ border).
export const DropdownMenuSeparator = uic(RACSeparator, {
	displayName: 'DropdownMenuSeparator',
	baseClass: 'my-2 h-px border-0 bg-border',
})

export interface DropdownMenuSectionProps<T extends object> extends Omit<RACMenuSectionProps<T>, 'children'> {
	/**
	 * Section label (gs `.label`). Rendered as a non-interactive `Header` — 13px
	 * medium, `fg-subtle` — above the section's items.
	 */
	label?: ReactNode
	/** Static section items (each a {@link DropdownMenuItem}). */
	children: ReactNode
}

/** A labelled group of items. Optional `label` renders the gs section header. */
export function DropdownMenuSection<T extends object>({
	label,
	children,
	...props
}: DropdownMenuSectionProps<T>) {
	return (
		<RACMenuSection {...props}>
			{label ? (
				<Header className="px-4 py-3 text-compact font-medium text-fg-subtle">{label}</Header>
			) : null}
			{children}
		</RACMenuSection>
	)
}

export type DropdownMenuProps<T extends object> = RACMenuProps<T> & {
	/** Popover placement relative to the trigger (default `bottom start`). */
	placement?: RACPopoverProps['placement']
	/** Extra classes merged onto the popover container. */
	popoverClassName?: string
}

/**
 * The popover + menu body. Anchors to the enclosing {@link DropdownMenuTrigger}.
 * Pass `onAction` for a single keyed handler, or per-item `onAction` on each
 * {@link DropdownMenuItem}. `disabledKeys` / `aria-label` flow through to the
 * underlying RAC `Menu`.
 */
export function DropdownMenu<T extends object>({
	placement = 'bottom start',
	popoverClassName,
	className,
	...props
}: DropdownMenuProps<T>) {
	return (
		// gs `.content`: min-width 220px, 8px padding (`p-2`), 8px radius, 1px
		// `#eceae1` border, white fill, `shadow-lg`.
		<RACPopover
			placement={placement}
			className={
				'min-w-[220px] rounded-lg border border-border bg-surface p-2 shadow-lg outline-none' +
				(popoverClassName ? ` ${popoverClassName}` : '')
			}
		>
			<RACMenu
				{...props}
				className={typeof className === 'string' && className ? `outline-none ${className}` : 'outline-none'}
			/>
		</RACPopover>
	)
}
