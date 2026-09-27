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

// The shared outlined box around the segments. Focus sits on a segment, so the
// wrapper shows it via focus-within; invalid lives on the field root.
export const dateInputClass = (size: FieldSize = 'md') =>
	`flex w-full items-center gap-0.5 rounded-lg px-4 ${fieldSizeClasses[size]} ` +
	outlinedFieldClasses({ focus: 'within', invalid: 'group' })

export type DateFieldProps<T extends DateValue> = RACDateFieldProps<T> & {
	label: ReactNode
	/** Field height, matching `Input`'s `size`. */
	size?: FieldSize
	description?: ReactNode
	errorMessage?: string
}

export const DateField = <T extends DateValue>({ label, description, errorMessage, size, ...props }: DateFieldProps<T>) => (
	<RACDateField {...props} className={`group ${fieldStackClass}`}>
		<Label className={fieldLabelClass}>{label}</Label>
		<DateInput className={dateInputClass(size)}>{(segment) => <DateSegment segment={segment} className={segmentClass} />}</DateInput>
		{description ? (
			<Text slot="description" className={fieldDescriptionClass}>
				{description}
			</Text>
		) : null}
		<FieldError className={fieldErrorClass}>{errorMessage}</FieldError>
	</RACDateField>
)

export type TimeFieldProps<T extends TimeValue> = RACTimeFieldProps<T> & {
	label: ReactNode
	/** Field height, matching `Input`'s `size`. */
	size?: FieldSize
	description?: ReactNode
	errorMessage?: string
}

export const TimeField = <T extends TimeValue>({ label, description, errorMessage, size, ...props }: TimeFieldProps<T>) => (
	<RACTimeField {...props} className={`group ${fieldStackClass}`}>
		<Label className={fieldLabelClass}>{label}</Label>
		<DateInput className={dateInputClass(size)}>{(segment) => <DateSegment segment={segment} className={segmentClass} />}</DateInput>
		{description ? (
			<Text slot="description" className={fieldDescriptionClass}>
				{description}
			</Text>
		) : null}
		<FieldError className={fieldErrorClass}>{errorMessage}</FieldError>
	</RACTimeField>
)
