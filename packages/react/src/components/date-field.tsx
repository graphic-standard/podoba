import type { ReactNode } from 'react'
import {
	DateField as RACDateField,
	type DateFieldProps as RACDateFieldProps,
	DateInput,
	DateSegment,
	type DateValue,
	FieldError,
	Label,
	Text,
	TimeField as RACTimeField,
	type TimeFieldProps as RACTimeFieldProps,
	type TimeValue,
} from 'react-aria-components'

/**
 * DateField / TimeField — segmented, keyboard-first date and time entry (type or
 * arrow each segment; no free-text parsing). Built on React Aria Components, so
 * they're locale- and timezone-aware. Pass `@internationalized/date` values for
 * controlled use. For a calendar popover, use `DatePicker`.
 */

// Each editable segment; the focused one gets a brand-green highlight.
export const segmentClass =
	'rounded px-0.5 tabular-nums text-fg caret-transparent outline-none ' +
	'data-[placeholder]:text-fg-muted ' +
	'data-[focused]:bg-brand-green data-[focused]:text-fg ' +
	'data-[disabled]:opacity-50 data-[type=literal]:px-0 data-[type=literal]:text-fg-muted'

export const dateInputClass =
	'flex h-12 w-full items-center gap-0.5 rounded-lg border border-border bg-surface px-4 text-sm text-fg transition-colors ' +
	'hover:border-fg-subtle focus-within:border-brand-green focus-within:ring-2 focus-within:ring-ring ' +
	'group-data-[invalid]:border-danger group-data-[invalid]:ring-2 group-data-[invalid]:ring-danger'

export type DateFieldProps<T extends DateValue> = RACDateFieldProps<T> & {
	label: ReactNode
	description?: ReactNode
	errorMessage?: string
}

export const DateField = <T extends DateValue>({ label, description, errorMessage, ...props }: DateFieldProps<T>) => (
	<RACDateField {...props} className="group flex flex-col gap-2">
		<Label className="text-heading5 font-medium text-fg">{label}</Label>
		<DateInput className={dateInputClass}>{(segment) => <DateSegment segment={segment} className={segmentClass} />}</DateInput>
		{description ? (
			<Text slot="description" className="text-xs text-fg-muted">
				{description}
			</Text>
		) : null}
		<FieldError className="text-xs text-danger">{errorMessage}</FieldError>
	</RACDateField>
)

export type TimeFieldProps<T extends TimeValue> = RACTimeFieldProps<T> & {
	label: ReactNode
	description?: ReactNode
	errorMessage?: string
}

export const TimeField = <T extends TimeValue>({ label, description, errorMessage, ...props }: TimeFieldProps<T>) => (
	<RACTimeField {...props} className="group flex flex-col gap-2">
		<Label className="text-heading5 font-medium text-fg">{label}</Label>
		<DateInput className={dateInputClass}>{(segment) => <DateSegment segment={segment} className={segmentClass} />}</DateInput>
		{description ? (
			<Text slot="description" className="text-xs text-fg-muted">
				{description}
			</Text>
		) : null}
		<FieldError className="text-xs text-danger">{errorMessage}</FieldError>
	</RACTimeField>
)
