import { DateSelectionCalendar } from './date-selection-calendar'
const props = { monthLabel: 'September 2026', weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], previousLabel: 'Previous month', nextLabel: 'Next month', onPrevious: () => {}, onNext: () => {}, onSelect: () => {}, weeks: [[null, ...Array.from({ length: 6 }, (_, i) => ({ id: String(i + 1), label: String(i + 1), accessibleLabel: 'September ' + (i + 1) + ', 2026', selected: i === 2, today: i === 4 }))]] }
export const examples = {
 default: () => <DateSelectionCalendar {...props} />,
 emptySelection: () => <DateSelectionCalendar {...props} weeks={props.weeks.map(week => week.map(day => day ? { ...day, selected: false } : null))} />,
 states: () => <DateSelectionCalendar {...props} isDisabled />,
}
export const meta = { category: 'Form', description: 'Month navigation and date cells with selected, today, disabled and keyboard focus states.' }
