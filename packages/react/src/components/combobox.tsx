import type { ReactNode } from 'react'
import {
	Autocomplete,
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
	SearchField,
	Text,
	useFilter,
} from 'react-aria-components'
import { uic } from '../utils/uic'
import { useInFocusOverlay } from './focus-context'

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
		'h-12 w-full rounded-lg border border-border bg-surface pl-4 pr-11 text-small text-fg ' +
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
		'flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-small text-fg outline-none ' +
		'data-[hovered]:bg-surface-muted data-[focused]:bg-surface-muted data-[selected]:font-medium ' +
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
	selectedKey,
	onSelectionChange,
	...props
}: ComboBoxProps<T>) => {
	const inFocus = useInFocusOverlay()
	const { contains } = useFilter({ sensitivity: 'base' })
	const desc = description ? (
		<Text slot="description" className="text-label text-fg-muted">
			{description}
		</Text>
	) : null

	// Focus overlay: a bare search input + an inline filtered list (RAC ComboBox
	// only fills its listbox while open, so compose Autocomplete + ListBox here).
	if (inFocus) {
		return (
			<div className="flex flex-col gap-2">
				<span className="text-heading5 font-medium text-fg">{label}</span>
				<Autocomplete filter={contains}>
					<SearchField aria-label={typeof label === 'string' ? label : 'Search'}>
						<RACInput
							placeholder={placeholder}
							className="w-full border-0 bg-transparent p-0 text-display font-medium text-fg outline-none placeholder:text-fg-subtle"
						/>
					</SearchField>
					<ListBox
						selectionMode="single"
						selectedKeys={selectedKey != null ? new Set([selectedKey]) : new Set()}
						onSelectionChange={(keys) => {
							const k = keys === 'all' ? undefined : [...keys][0]
							onSelectionChange?.(k ?? null)
						}}
						renderEmptyState={() => <div className="px-3 py-2 text-small text-fg-muted">No results</div>}
						className="mt-2 flex max-h-72 flex-col gap-0.5 overflow-auto overscroll-contain p-1 outline-none"
					>
						{children}
					</ListBox>
				</Autocomplete>
				{desc}
				{errorMessage ? <span className="text-label text-danger">{errorMessage}</span> : null}
			</div>
		)
	}

	return (
		// `menuTrigger="focus"` opens the list on focus/click (not only on typing), so
		// the options are always one interaction away. Consumers can override via props.
		<RACComboBox
			menuTrigger="focus"
			selectedKey={selectedKey}
			onSelectionChange={onSelectionChange}
			{...props}
			className="group flex flex-col gap-2"
		>
			<Label className="text-heading5 font-medium text-fg">{label}</Label>
			<div className="relative">
				<ComboBoxInput placeholder={placeholder} />
				{/* RAC uses this Button to toggle the listbox open/closed. */}
				<RACButton className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring">
					<Chevron />
				</RACButton>
			</div>
			{desc}
			<FieldError className="text-label text-danger">{errorMessage}</FieldError>
			<Popover className="min-w-[var(--trigger-width)] overflow-hidden rounded-lg bg-surface-card shadow-lg">
				<ListBox
					className="flex max-h-72 flex-col gap-0.5 overflow-auto overscroll-contain p-1 outline-none"
					renderEmptyState={() => <div className="px-3 py-2 text-small text-fg-muted">No results</div>}
				>
					{children}
				</ListBox>
			</Popover>
		</RACComboBox>
	)
}
