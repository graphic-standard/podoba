import type { ReactNode } from 'react'
import {
	Button as RACButton,
	ComboBox as RACComboBox,
	type ComboBoxProps as RACComboBoxProps,
	FieldError,
	Input as RACInput,
	Label,
	ListBox,
	ListBoxItem,
	type ListBoxItemProps,
	Popover,
	Text,
} from 'react-aria-components'
import { uic } from '../utils/uic'

/**
 * ComboBox — a filterable single-select: a text input that narrows a listbox as
 * you type. Built on React Aria Components `ComboBox` (typeahead, keyboard nav,
 * ARIA all handled). Styling mirrors our `Input` (white filled field) and shares
 * `Select`'s cream dropdown, so the form controls stay visually consistent. Pass
 * options as `ComboBoxItem` children.
 */
const Chevron = () => (
	<svg width="9.5" height="9.5" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="text-fg">
		<path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
)

// Same filled-field skin as input.tsx, with room on the right for the toggle.
// Invalid is owned by the ComboBox root, so it comes through `group-data-invalid`.
const ComboBoxInput = uic(RACInput, {
	displayName: 'ComboBoxInput',
	baseClass:
		'h-12 w-full rounded-lg border border-border bg-surface pl-4 pr-11 text-sm text-fg ' +
		'outline-none transition-colors placeholder:text-fg-muted ' +
		'data-[hovered]:border-fg-subtle ' +
		'data-[focused]:border-brand-green data-[focused]:ring-2 data-[focused]:ring-ring ' +
		'group-data-[invalid]:border-danger group-data-[invalid]:ring-2 group-data-[invalid]:ring-danger ' +
		'data-[disabled]:bg-surface-muted data-[disabled]:opacity-60',
})

export const ComboBoxItem = uic(ListBoxItem, {
	displayName: 'ComboBoxItem',
	// Matches SelectItem so the two dropdowns are indistinguishable.
	baseClass:
		'flex cursor-pointer select-none items-center rounded-md px-5 py-1 text-sm text-fg outline-none ' +
		'data-[focused]:bg-surface-muted data-[selected]:font-medium ' +
		'data-[disabled]:opacity-50 data-[disabled]:pointer-events-none',
}) as (props: ListBoxItemProps) => ReactNode

export type ComboBoxProps<T extends object> = RACComboBoxProps<T> & {
	/** Visible label (required for accessibility). */
	label: ReactNode
	description?: ReactNode
	errorMessage?: string
	/** Placeholder shown in the empty input. */
	placeholder?: string
	children: ReactNode
}

export const ComboBox = <T extends object>({
	label,
	description,
	errorMessage,
	placeholder,
	children,
	...props
}: ComboBoxProps<T>) => (
	<RACComboBox {...props} className="group flex flex-col gap-2">
		<Label className="text-heading5 font-medium text-fg">{label}</Label>
		<div className="relative">
			<ComboBoxInput placeholder={placeholder} />
			{/* RAC uses this Button to toggle the listbox open/closed. */}
			<RACButton className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring">
				<Chevron />
			</RACButton>
		</div>
		{description ? (
			<Text slot="description" className="text-xs text-fg-muted">
				{description}
			</Text>
		) : null}
		<FieldError className="text-xs text-danger">{errorMessage}</FieldError>
		<Popover className="min-w-[var(--trigger-width)] overflow-hidden rounded-lg bg-surface-card shadow-lg">
			<ListBox
				className="flex max-h-64 flex-col gap-3 overflow-auto py-5 outline-none"
				renderEmptyState={() => <div className="px-5 py-1 text-sm text-fg-muted">No results</div>}
			>
				{children}
			</ListBox>
		</Popover>
	</RACComboBox>
)
