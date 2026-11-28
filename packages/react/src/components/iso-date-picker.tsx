import { type CalendarDate, type CalendarDateTime, parseDate, parseDateTime } from '@internationalized/date'
import type { DateValue } from 'react-aria-components'
import { DatePicker, type DatePickerProps } from './date-picker'

/** `day`: an ISO date (`2026-03-01`). `minute`: an ISO local date and time without seconds (`2026-03-01T09:30`). */
export type IsoDateGranularity = 'day' | 'minute'

/**
 * Parse a stored ISO date or local date-time into the value React Aria's date fields
 * take. Empty, missing or unparsable input gives `null`, so a bad stored value leaves
 * the field empty and editable instead of throwing. A date-time string given to `day`
 * keeps its date; a plain date given to `minute` starts at midnight.
 */
export function parseIsoDateValue(value: string | null | undefined, granularity: IsoDateGranularity = 'day'): CalendarDate | CalendarDateTime | null {
	if (!value) return null
	try {
		return granularity === 'minute' ? parseDateTime(value) : parseDate(value.slice(0, 10))
	} catch {
		return null
	}
}

/**
 * Format a React Aria date value as the ISO string a form stores: `YYYY-MM-DD` for
 * `day`, `YYYY-MM-DDTHH:mm` for `minute` (seconds and time zones dropped). `null`
 * stays `null`.
 */
export function formatIsoDateValue(value: DateValue | null | undefined, granularity: IsoDateGranularity = 'day'): string | null {
	if (!value) return null
	const iso = value.toString()
	return granularity === 'minute' ? (iso.includes('T') ? iso.slice(0, 16) : `${iso.slice(0, 10)}T00:00`) : iso.slice(0, 10)
}

export type IsoDatePickerProps = Omit<DatePickerProps<CalendarDate | CalendarDateTime>, 'value' | 'defaultValue' | 'onChange' | 'granularity'> & {
	/** The stored ISO string; empty or invalid shows an empty field. */
	value: string | null | undefined
	/** The new ISO string, or `null` when the field is cleared. */
	onChange: (value: string | null) => void
	/** `day` (default) for a date, `minute` for a date and time. */
	granularity?: IsoDateGranularity
}

/**
 * `DatePicker` over an ISO string instead of an `@internationalized/date` value: for
 * forms whose data is JSON (a CMS field, an API payload), so they need no date
 * library of their own. Everything else is `DatePicker`'s: appearance, label size,
 * calendar, keyboard, the locale from the surrounding `I18nProvider`.
 */
export function IsoDatePicker({ value, onChange, granularity = 'day', ...props }: IsoDatePickerProps) {
	return (
		<DatePicker
			{...props}
			value={parseIsoDateValue(value, granularity)}
			granularity={granularity}
			onChange={(next) => onChange(formatIsoDateValue(next, granularity))}
		/>
	)
}
