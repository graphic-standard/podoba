import type { ReactNode } from 'react'
import {
	Button as RACButton,
	FieldError,
	Label,
	ListBox,
	ListBoxItem,
	type ListBoxItemProps,
	Popover,
	Select as RACSelect,
	type SelectProps as RACSelectProps,
	SelectValue,
	Text,
} from 'react-aria-components'
import { uic } from '../utils/uic'

/**
 * Select — accessible dropdown built on React Aria Components `Select`.
 *
 * RAC handles the listbox ARIA pattern, keyboard navigation, typeahead and
 * focus management. Styling via `uic`. Pass options as `SelectItem` children.
 *
 * Re-skinned 1:1 to gs-platform's designer spec (Figma GraphicStandard 1.5,
 * node 2115-4271 — `Select.module.scss`): a tall (min-h 58px) borderless filled
 * trigger on the cream `surface-card`, matching our `Input` / `Textarea` fill so
 * the form controls stay consistent. gs token map: bg #f7f6f2 → surface-card ·
 * hover #eceae1 → surface-muted · text #0d0d0d → fg · placeholder → fg-muted ·
 * 8px radius → rounded-lg · 6px item radius → rounded-md · error → danger.
 */
const SelectTrigger = uic(RACButton, {
	displayName: 'SelectTrigger',
	// gs trigger: min-h 58px, 20px padding (p-5), 10px text↔chevron gap (gap-2.5),
	// 8px radius, NO border (filled fill only). We keep a focus-visible ring for
	// WCAG (a borderless trigger that still shows a visible focus indicator is the
	// correct a11y adaptation of gs's borderless look). Error → 2px danger ring
	// (gs uses a box-shadow ring since the trigger has no border to colour); the
	// ring is driven off the RACSelect root's `data-invalid` via `group-`.
	baseClass:
		'flex min-h-[58px] w-full items-center justify-between gap-2.5 rounded-lg bg-surface-card p-5 ' +
		'text-sm text-fg outline-none transition-colors ' +
		'data-[hovered]:bg-surface-muted ' +
		'data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring ' +
		'group-data-[invalid]:ring-2 group-data-[invalid]:ring-danger ' +
		'data-[disabled]:opacity-50 data-[disabled]:pointer-events-none',
})

export const SelectItem = uic(ListBoxItem, {
	displayName: 'SelectItem',
	// gs item: 0/20px padding (px-5, no vertical pad), 6px radius, selected =
	// medium weight. We add a `surface-muted` focus background (gs highlights with
	// weight only) so keyboard focus stays clearly visible on the cream content.
	baseClass:
		'flex cursor-pointer select-none items-center rounded-md px-5 text-sm text-fg outline-none ' +
		'data-[focused]:bg-surface-muted data-[selected]:font-medium ' +
		'data-[disabled]:opacity-50 data-[disabled]:pointer-events-none',
}) as (props: ListBoxItemProps) => ReactNode

export type SelectProps<T extends object> = RACSelectProps<T> & {
	/** Visible label (required for accessibility). */
	label: ReactNode
	description?: ReactNode
	errorMessage?: string
	/**
	 * Placeholder shown while nothing is selected. REQUIRED — `@app/ui` ships no
	 * i18n, so the consumer passes a translated string (otherwise RAC would fall
	 * back to its own hardcoded English "Select an item").
	 */
	placeholder: string
	children: ReactNode
}

export const Select = <T extends object>({
	label,
	description,
	errorMessage,
	placeholder,
	children,
	...props
}: SelectProps<T>) => (
	<RACSelect {...props} placeholder={placeholder} className="group flex flex-col gap-2">
		<Label className="text-heading5 font-medium text-fg">{label}</Label>
		<SelectTrigger>
			<SelectValue className="data-[placeholder]:text-fg-muted" />
			{/* gs chevron: 9.5px caret, dark (neutral-400 → fg), non-interactive. */}
			<svg
				width="9.5"
				height="9.5"
				viewBox="0 0 12 12"
				fill="none"
				aria-hidden="true"
				className="pointer-events-none shrink-0 text-fg"
			>
				<path
					d="M3 4.5L6 7.5L9 4.5"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		</SelectTrigger>
		{description ? (
			<Text slot="description" className="text-xs text-fg-muted">
				{description}
			</Text>
		) : null}
		<FieldError className="text-xs text-danger">{errorMessage}</FieldError>
		{/* gs content: cream fill, 8px radius, shadow-lg, NO border; viewport pads
		    20px vertical / 0 horizontal (items own their 20px side padding) with a
		    12px gap between items. */}
		<Popover className="min-w-[var(--trigger-width)] overflow-hidden rounded-lg bg-surface-card shadow-lg">
			<ListBox className="flex flex-col gap-3 py-5 outline-none">{children}</ListBox>
		</Popover>
	</RACSelect>
)
