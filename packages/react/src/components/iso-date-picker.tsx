import { type CalendarDate, type CalendarDateTime, parseDate, parseDateTime, toCalendarDate } from '@internationalized/date'
import { useMemo } from 'react'
import type { DateValue } from 'react-aria-components'
import { DatePicker, type DatePickerProps } from './date-picker'

/** `day`: an ISO date (`2026-03-01`). `minute`: an ISO local date and time without seconds (`2026-03-01T09:30`). */
export type IsoDateGranularity = 'day' | 'minute'

/**
 * Parse a stored ISO value into the value React Aria's date fields take.
 *
 * **Local values only, no instants.** Both granularities accept the same two shapes:
 * a date (`YYYY-MM-DD`) and a local date-time (`YYYY-MM-DDTHH:mm`, optionally with
 * `:ss` and `.sss`). A value with a zone or offset (`…Z`, `…+01:00`, what
 * `Date#toISOString()` gives) is an instant, and turning it into a calendar date needs
 * a time zone this helper does not guess; it gives `null` in both granularities, like
 * any other unparsable input, so the field shows empty and editable instead of a date
 * one day off. A local date-time read as `day` keeps its date; a date read as
 * `minute` starts at midnight.
 */
export function parseIsoDateValue(value: string | null | undefined, granularity: IsoDateGranularity = 'day'): CalendarDate | CalendarDateTime | null {
	if (!value) return null
	try {
		// parseDateTime takes a date or a local date-time and rejects zones and offsets.
		const local = parseDateTime(value)
		return granularity === 'minute' ? local : toCalendarDate(local)
	} catch {
		return null
	}
}

/**
 * Format a React Aria date value as the ISO string a form stores: `YYYY-MM-DD` for
 * `day`, the local `YYYY-MM-DDTHH:mm` for `minute` (seconds dropped). `null` stays
 * `null`.
 */
export function formatIsoDateValue(value: DateValue | null | undefined, granularity: IsoDateGranularity = 'day'): string | null {
	if (!value) return null
	const iso = value.toString()
	return granularity === 'minute' ? (iso.includes('T') ? iso.slice(0, 16) : `${iso.slice(0, 10)}T00:00`) : iso.slice(0, 10)
}

/**
 * `parseIsoDateValue`, memoised on the string: the same stored value gives the same
 * object across re-renders. React Aria compares a controlled date value by identity
 * and resets a half-edited segment whenever it changes, so a field fed a freshly
 * parsed object would lose the user's edit each time the form re-renders.
 */
export function useIsoDateValue(value: string | null | undefined, granularity: IsoDateGranularity = 'day'): CalendarDate | CalendarDateTime | null {
	return useMemo(() => parseIsoDateValue(value, granularity), [value, granularity])
}

export type IsoDatePickerProps = Omit<
	DatePickerProps<CalendarDate | CalendarDateTime>,
	'value' | 'defaultValue' | 'onChange' | 'granularity' | 'minValue' | 'maxValue'
> & {
	/** The stored ISO string (local values only, see `parseIsoDateValue`); empty or invalid shows an empty field. */
	value: string | null | undefined
	/** The new ISO string, or `null` when the field is cleared. */
	onChange: (value: string | null) => void
	/** `day` (default) for a date, `minute` for a date and time. */
	granularity?: IsoDateGranularity
	/** Earliest allowed value, as an ISO string in the same shapes as `value`. */
	minValue?: string
	/** Latest allowed value, as an ISO string in the same shapes as `value`. */
	maxValue?: string
}

/**
 * `DatePicker` over an ISO string instead of an `@internationalized/date` value: for
 * forms whose data is JSON (a CMS field, an API payload), so they need no date
 * library of their own. Local dates and date-times only, no instants (see
 * `parseIsoDateValue`). Everything else is `DatePicker`'s: appearance, label size,
 * calendar, keyboard, the locale from the surrounding `I18nProvider`.
 *
 * `minValue` and `maxValue` take ISO strings too. `placeholderValue` and
 * `isDateUnavailable` still take and give `@internationalized/date` values; a form
 * that needs them can build them with `parseIsoDateValue` / `formatIsoDateValue`.
 */
export function IsoDatePicker({ value, onChange, granularity = 'day', minValue, maxValue, ...props }: IsoDatePickerProps) {
	const parsed = useIsoDateValue(value, granularity)
	const min = useIsoDateValue(minValue, granularity) ?? undefined
	const max = useIsoDateValue(maxValue, granularity) ?? undefined
	return (
		<DatePicker
			{...props}
			value={parsed}
			minValue={min}
			maxValue={max}
			granularity={granularity}
			onChange={(next) => onChange(formatIsoDateValue(next, granularity))}
		/>
	)
}
