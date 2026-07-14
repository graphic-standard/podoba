import type { ReactNode } from 'react'
import {
	Button as RACButton,
	Calendar,
	CalendarCell,
	CalendarGrid,
	CalendarGridBody,
	CalendarGridHeader,
	CalendarHeaderCell,
	DateInput,
	DatePicker as RACDatePicker,
	type DatePickerProps as RACDatePickerProps,
	DateSegment,
	type DateValue,
	Dialog,
	FieldError,
	Group,
	Heading,
	Label,
	Popover,
	Text,
} from 'react-aria-components'
import { dateInputClass, segmentClass } from './date-field'
import { useInFocusOverlay } from './focus-context'

/**
 * DatePicker — a `DateField` with a calendar popover. Built on React Aria
 * Components (locale/timezone-aware, full keyboard support). Uncontrolled by
 * default; pass `@internationalized/date` values to control it. Set `granularity`
 * to `"minute"` for a datetime picker (adds time segments to the field).
 */
const navButton =
	'flex h-8 w-8 items-center justify-center rounded-md text-fg-muted outline-none transition-colors ' +
	'hover:bg-surface-muted hover:text-fg data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[disabled]:opacity-40'

const Chevron = ({ dir }: { dir: 'left' | 'right' }) => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
		<path d={dir === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
	</svg>
)

const calendarCellClass =
	'flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-sm text-fg outline-none transition-colors ' +
	'data-[outside-month]:text-fg-subtle data-[hovered]:bg-surface-muted ' +
	'data-[selected]:bg-fg data-[selected]:text-fg-inverted data-[selected]:font-medium ' +
	'data-[unavailable]:text-fg-subtle data-[unavailable]:line-through ' +
	'data-[disabled]:opacity-40 data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring'

function CalendarBody() {
	return (
		<Calendar className="w-[17.5rem]">
			<header className="flex items-center justify-between pb-3">
				<RACButton slot="previous" className={navButton}>
					<Chevron dir="left" />
				</RACButton>
				<Heading className="text-sm font-medium text-fg" />
				<RACButton slot="next" className={navButton}>
					<Chevron dir="right" />
				</RACButton>
			</header>
			<CalendarGrid className="w-full border-collapse">
				<CalendarGridHeader>
					{(day) => (
						<CalendarHeaderCell className="pb-1 text-micro font-medium uppercase tracking-wide text-fg-subtle">
							{day}
						</CalendarHeaderCell>
					)}
				</CalendarGridHeader>
				<CalendarGridBody>{(date) => <CalendarCell date={date} className={calendarCellClass} />}</CalendarGridBody>
			</CalendarGrid>
		</Calendar>
	)
}

export type DatePickerProps<T extends DateValue> = RACDatePickerProps<T> & {
	label: ReactNode
	description?: ReactNode
	errorMessage?: string
}

export const DatePicker = <T extends DateValue>({ label, description, errorMessage, ...props }: DatePickerProps<T>) => {
	// In a focus overlay, show the calendar inline (open) instead of a popover.
	const inFocus = useInFocusOverlay()
	return (
		<RACDatePicker {...props} className="group flex flex-col gap-2">
			<Label className="text-heading5 font-medium text-fg">{label}</Label>
			<Group className={`${dateInputClass} pr-2`}>
				<DateInput className="flex flex-1 items-center gap-0.5">
					{(segment) => <DateSegment segment={segment} className={segmentClass} />}
				</DateInput>
				{inFocus ? null : (
					<RACButton
						aria-label="Open calendar"
						className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-fg-muted outline-none transition-colors hover:bg-surface-muted hover:text-fg data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring"
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
							<rect x="3" y="4" width="18" height="18" rx="2" />
							<path d="M16 2v4M8 2v4M3 10h18" />
						</svg>
					</RACButton>
				)}
			</Group>
			{description ? (
				<Text slot="description" className="text-xs text-fg-muted">
					{description}
				</Text>
			) : null}
			<FieldError className="text-xs text-danger">{errorMessage}</FieldError>
			{inFocus ? (
				<div className="mt-3 w-fit rounded-lg border border-border bg-surface p-4">
					<CalendarBody />
				</div>
			) : (
				<Popover className="rounded-lg border border-border bg-surface p-4 shadow-lg outline-none">
					<Dialog className="outline-none">
						<CalendarBody />
					</Dialog>
				</Popover>
			)}
		</RACDatePicker>
	)
}
