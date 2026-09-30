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
import {
	fieldDescriptionClass,
	fieldErrorClass,
	fieldLabelClass,
	fieldSizeClasses,
	fieldStackClass,
	outlinedFieldClasses,
	type FieldSize,
} from './field-appearance'

/**
 * ComboBox — a filterable single-select: a text input that narrows a listbox as
 * you type. Built on React Aria Components `ComboBox` (typeahead, keyboard nav,
 * ARIA all handled). The input uses the shared outlined skin and `size` scale,
 * so it is the same box as an outlined `Input` or `Select`, and it shares
 * `Select`'s cream dropdown. Pass options as `ComboBoxItem` children.
 */
const Chevron = () => (
	<svg width="9.5" height="9.5" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="text-fg">
		<path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
)

// The shared outlined skin, with room on the right for the toggle. Invalid is
// owned by the ComboBox root, so it comes through `group-data-invalid`.
const ComboBoxInput = uic(RACInput, {
	displayName: 'ComboBoxInput',
	baseClass: `w-full rounded-lg pl-4 pr-11 ${outlinedFieldClasses({ invalid: 'group' })}`,
	variants: { fieldSize: fieldSizeClasses },
	defaultVariants: { fieldSize: 'md' },
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
	/** Input height, matching `Input`'s `size`. */
	size?: FieldSize
	children: ReactNode
}

export const ComboBox = <T extends object>({
	label,
	description,
	errorMessage,
	placeholder,
	size = 'md',
	children,
	selectedKey,
	onSelectionChange,
	...props
}: ComboBoxProps<T>) => {
	const inFocus = useInFocusOverlay()
	const { contains } = useFilter({ sensitivity: 'base' })
	const desc = description ? (
		<Text slot="description" className={fieldDescriptionClass}>
			{description}
		</Text>
	) : null

	// Focus overlay: a bare search input + an inline filtered list (RAC ComboBox
	// only fills its listbox while open, so compose Autocomplete + ListBox here).
	if (inFocus) {
		return (
			<div className={fieldStackClass}>
				<span className={fieldLabelClass}>{label}</span>
				<Autocomplete filter={contains}>
					<SearchField aria-label={typeof label === 'string' ? label : 'Search'}>
						<RACInput
							placeholder={placeholder}
							className="w-full border-0 bg-transparent p-0 text-display font-medium text-fg outline-none placeholder:text-fg-muted"
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
				{errorMessage ? <span className={fieldErrorClass}>{errorMessage}</span> : null}
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
			className={`group ${fieldStackClass}`}
		>
			<Label className={fieldLabelClass}>{label}</Label>
			<div className="relative">
				<ComboBoxInput placeholder={placeholder} fieldSize={size} />
				{/* RAC uses this Button to toggle the listbox open/closed. */}
				<RACButton className="absolute inset-y-0 right-0 flex w-11 cursor-pointer data-[disabled]:cursor-not-allowed items-center justify-center rounded-r-lg outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring">
					<Chevron />
				</RACButton>
			</div>
			{desc}
			<FieldError className={fieldErrorClass}>{errorMessage}</FieldError>
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
