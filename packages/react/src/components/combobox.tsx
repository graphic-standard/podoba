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
	type FieldAppearance,
	fieldControlClasses,
	fieldDescriptionClass,
	fieldErrorClass,
	fieldLabelClasses,
	type FieldLabelSize,
	fieldStackClass,
	type FieldSize,
} from './field-appearance'

/**
 * ComboBox — a filterable single-select: a text input that narrows a listbox as
 * you type. Built on React Aria Components `ComboBox` (typeahead, keyboard nav,
 * ARIA all handled). The input uses the shared field skins and `size` scale, so
 * it is the same box as an `Input` or `SearchField` of the same `appearance`
 * (outlined by default, or the borderless 42 px `filled`), and it shares
 * `Select`'s cream dropdown. Pass options as `ComboBoxItem` children.
 */
const Chevron = () => (
	<svg width="9.5" height="9.5" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="text-fg">
		<path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
)

// The shared field skin, with room on the right for the toggle. The input is
// the focusable element, so both skins use the `self` focus form; invalid
// reaches it either way (the outlined skin reads the root's
// `group-data-invalid`, the filled one the `data-invalid` RAC also puts on the
// input). Filled has one fixed 42 px height, like every filled field, so `size`
// only applies to outlined. The skin comes in as `className`, which uic merges
// over the base, so `pr-4` (no toggle) still wins over `pr-11`.
const ComboBoxInput = uic(RACInput, {
	displayName: 'ComboBoxInput',
	baseClass: 'w-full rounded-lg pl-4 pr-11',
})
const comboBoxInputClass = (appearance: FieldAppearance, size: FieldSize, showToggle: boolean) =>
	`${fieldControlClasses(appearance, size)}${showToggle ? '' : ' pr-4'}`

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
	/** Hide the toggle for fields driven only by text input. */
	showToggle?: boolean
	/** Field skin, as on `Input`: bordered `outlined` (default) or borderless 42 px `filled`. */
	appearance?: FieldAppearance
	/** `compact` gives the smaller muted label used in dense settings cards. */
	labelSize?: FieldLabelSize
	/** Shown in the list when nothing matches the typed text. Pass a translated
	 * string or any node; defaults to "No results". React Aria closes the popover
	 * when the list filters down to nothing, so pass `allowsEmptyCollection` too
	 * when the message should appear there (the focus overlay always shows it). */
	emptyState?: ReactNode
	children: ReactNode
}

export const ComboBox = <T extends object>({
	label,
	description,
	errorMessage,
	placeholder,
	size = 'md',
	showToggle = true,
	appearance = 'outlined',
	labelSize = 'default',
	emptyState = 'No results',
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
	const empty = () => <div className="px-3 py-2 text-small text-fg-muted">{emptyState}</div>

	// Focus overlay: a bare search input + an inline filtered list (RAC ComboBox
	// only fills its listbox while open, so compose Autocomplete + ListBox here).
	if (inFocus) {
		return (
			<div className={fieldStackClass}>
				<span className={fieldLabelClasses[labelSize]}>{label}</span>
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
						renderEmptyState={empty}
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
			<Label className={fieldLabelClasses[labelSize]}>{label}</Label>
			<div className="relative">
				<ComboBoxInput placeholder={placeholder} className={comboBoxInputClass(appearance, size, showToggle)} />
				{/* RAC uses this Button to toggle the listbox open/closed. */}
				{showToggle ? (
					<RACButton className="absolute inset-y-0 right-0 flex w-11 cursor-pointer data-[disabled]:cursor-not-allowed items-center justify-center rounded-r-lg outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring">
						<Chevron />
					</RACButton>
				) : null}
			</div>
			{desc}
			<FieldError className={fieldErrorClass}>{errorMessage}</FieldError>
			<Popover className="min-w-[var(--trigger-width)] overflow-hidden rounded-lg bg-surface-card shadow-lg">
				<ListBox
					className="flex max-h-72 flex-col gap-0.5 overflow-auto overscroll-contain p-1 outline-none"
					renderEmptyState={empty}
				>
					{children}
				</ListBox>
			</Popover>
		</RACComboBox>
	)
}
