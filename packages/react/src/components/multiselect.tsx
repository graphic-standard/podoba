import { type ReactNode, useId, useRef, useState } from 'react'
import {
	Autocomplete,
	Button as RACButton,
	Input as RACInput,
	ListBox,
	ListBoxItem,
	type ListBoxItemProps,
	Popover,
	SearchField,
	type Selection,
	useFilter,
} from 'react-aria-components'
import { clsx } from 'clsx'
import { uic } from '../utils/uic'

/**
 * MultiSelect — a dropdown that selects several options at once.
 *
 * React Aria Components ships no multi-select control at 1.x, so this composes
 * one from primitives: a `Select`-styled trigger (white filled field) plus a
 * controlled `Popover` + `ListBox selectionMode="multiple"` (RAC gives the
 * listbox ARIA + keyboard multi-selection). The trigger summarises the choice —
 * up to two labels, then an "N selected" count. Options come as `{ id, label }`
 * data (not children) because the trigger needs the value→label map. Selection
 * is uncontrolled by default; pass `selectedKeys` + `onChange` to control it.
 *
 * Pass `searchable` to make it a filterable "combobox multi": RAC `Autocomplete`
 * wires a search field to the listbox (type to filter, arrow keys into the list,
 * Enter/click to toggle). Handy once the option list gets long.
 */
const Chevron = () => (
	<svg width="9.5" height="9.5" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="shrink-0 text-fg">
		<path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
)

const Check = () => (
	<svg
		viewBox="0 0 16 16"
		fill="none"
		aria-hidden="true"
		className="h-4 w-4 shrink-0 text-fg opacity-0 group-data-[selected]:opacity-100"
	>
		<path d="M3.5 8.5l3 3 6-6.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
)

const MultiSelectItem = uic(ListBoxItem, {
	displayName: 'MultiSelectItem',
	// `group` so the leading Check can react to this item's data-selected.
	baseClass:
		'group flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 text-sm text-fg outline-none ' +
		'data-[hovered]:bg-surface-muted data-[focused]:bg-surface-muted data-[selected]:font-medium ' +
		'data-[disabled]:opacity-50 data-[disabled]:pointer-events-none',
}) as (props: ListBoxItemProps) => ReactNode

export type MultiSelectOption = { id: string; label: string; isDisabled?: boolean }

export type MultiSelectProps = {
	/** Visible label (required for accessibility). */
	label: ReactNode
	description?: ReactNode
	errorMessage?: string
	/** Shown in the trigger when nothing is selected. */
	placeholder: string
	options: MultiSelectOption[]
	/** Controlled selected ids. Omit for uncontrolled (see `defaultSelectedKeys`). */
	selectedKeys?: Set<string>
	/** Initial selection when uncontrolled. */
	defaultSelectedKeys?: Iterable<string>
	/** Fired with the full set of selected ids after each toggle. */
	onChange?: (ids: Set<string>) => void
	/** Add a search field to filter options — a filterable "combobox multi". */
	searchable?: boolean
	isDisabled?: boolean
	isInvalid?: boolean
	className?: string
}

export const MultiSelect = ({
	label,
	description,
	errorMessage,
	placeholder,
	options,
	selectedKeys,
	defaultSelectedKeys,
	onChange,
	searchable,
	isDisabled,
	isInvalid,
	className,
}: MultiSelectProps) => {
	const labelId = useId()
	const triggerRef = useRef<HTMLButtonElement>(null)
	const [open, setOpen] = useState(false)
	const { contains } = useFilter({ sensitivity: 'base' })
	const [internal, setInternal] = useState<Set<string>>(() => new Set(defaultSelectedKeys ?? []))
	const selected = selectedKeys ?? internal

	const handleChange = (keys: Selection) => {
		const next = keys === 'all' ? new Set(options.map((o) => o.id)) : new Set([...keys].map(String))
		if (selectedKeys === undefined) setInternal(next)
		onChange?.(next)
	}

	const chosen = options.filter((o) => selected.has(o.id)).map((o) => o.label)
	const summary = chosen.length === 0 ? placeholder : chosen.length <= 2 ? chosen.join(', ') : `${chosen.length} selected`

	const list = (
		<ListBox
			aria-labelledby={labelId}
			selectionMode="multiple"
			selectedKeys={selected}
			onSelectionChange={handleChange}
			renderEmptyState={() => <div className="px-3 py-2 text-sm text-fg-muted">No matches</div>}
			className="flex max-h-64 flex-col gap-0.5 overflow-auto overscroll-contain p-1 outline-none"
		>
			{options.map((o) => (
				<MultiSelectItem key={o.id} id={o.id} textValue={o.label} isDisabled={o.isDisabled}>
					<Check />
					<span>{o.label}</span>
				</MultiSelectItem>
			))}
		</ListBox>
	)

	return (
		<div className={clsx('flex flex-col gap-2', className)}>
			<span id={labelId} className="text-heading5 font-medium text-fg">
				{label}
			</span>
			<RACButton
				ref={triggerRef}
				aria-labelledby={labelId}
				isDisabled={isDisabled}
				onPress={() => setOpen(true)}
				className={clsx(
					'flex h-12 w-full items-center justify-between gap-2.5 rounded-lg border bg-surface px-4 text-sm text-fg outline-none transition-colors',
					'data-[hovered]:border-fg-subtle data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring',
					'data-[disabled]:bg-surface-muted data-[disabled]:opacity-60 data-[disabled]:pointer-events-none',
					isInvalid ? 'border-danger ring-2 ring-danger' : 'border-border',
				)}
			>
				<span className={clsx('truncate', chosen.length === 0 && 'text-fg-muted')}>{summary}</span>
				<Chevron />
			</RACButton>
			{description ? <span className="text-xs text-fg-muted">{description}</span> : null}
			{isInvalid && errorMessage ? <span className="text-xs text-danger">{errorMessage}</span> : null}
			<Popover
				triggerRef={triggerRef}
				isOpen={open}
				onOpenChange={setOpen}
				className="min-w-[var(--trigger-width)] overflow-hidden rounded-lg bg-surface-card shadow-lg"
			>
				{searchable ? (
					<Autocomplete filter={contains}>
						<SearchField aria-label="Filter options" autoFocus className="border-b border-border p-1">
							<RACInput
								placeholder="Search…"
								className="w-full rounded-md bg-surface px-3 py-2 text-sm text-fg outline-none placeholder:text-fg-muted"
							/>
						</SearchField>
						{list}
					</Autocomplete>
				) : (
					list
				)}
			</Popover>
		</div>
	)
}
