import { Button as AriaButton } from 'react-aria-components'
import { uic } from '../utils/uic'

export const CalendarDialogContent = uic('div', { displayName: 'CalendarDialogContent', baseClass: 'flex flex-col gap-8' })
export const CalendarDateHint = uic('p', { displayName: 'CalendarDateHint', baseClass: 'm-0 min-h-9 text-small font-normal text-fg-workflow-muted', style: { maxWidth: '48ch' } })
const Frame = uic('div', { displayName: 'DateSelectionCalendar', baseClass: 'mt-6 overflow-hidden border border-border bg-surface' })
const Header = uic('div', { displayName: 'DateSelectionCalendarHeader', baseClass: 'flex min-h-15 items-center border-b border-border px-5' })
const Navigation = uic(AriaButton, { displayName: 'DateSelectionCalendarNavigation', baseClass: 'mx-1.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-transparent text-2xl font-normal leading-none text-fg outline-none data-[hovered]:bg-surface-card data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring' })
const Month = uic('div', { displayName: 'DateSelectionCalendarMonth', baseClass: 'flex-1 text-center text-small font-normal text-fg' })
const Week = uic('div', { displayName: 'DateSelectionCalendarWeek', baseClass: 'grid grid-cols-7 border-b border-border last:border-b-0' })
const Weekday = uic('div', { displayName: 'DateSelectionCalendarWeekday', baseClass: 'border-e border-border px-3 pb-2 pt-4 text-center font-mono text-small font-normal tracking-normal text-fg-workflow-muted last:border-e-0' })
const Day = uic(AriaButton, { displayName: 'DateSelectionCalendarDay', baseClass: 'inline-flex min-h-16 w-full items-center justify-center rounded-none border-e border-border bg-transparent text-small font-normal text-fg outline-none last:border-e-0 data-[hovered]:bg-surface-card data-[focus-visible]:ring-2 data-[focus-visible]:ring-inset data-[focus-visible]:ring-ring data-[disabled]:cursor-not-allowed' })
const Placeholder = uic('div', { displayName: 'DateSelectionCalendarPlaceholder', baseClass: 'min-h-16 border-e border-border last:border-e-0' })

export interface DateSelectionCell {
 id: string
 label: string
 accessibleLabel: string
 selected: boolean
 today: boolean
}
export function DateSelectionCalendar({ monthLabel, weekdays, weeks, previousLabel, nextLabel, onPrevious, onNext, onSelect, isDisabled = false, autoFocus = false }: {
 monthLabel: string
 weekdays: string[]
 weeks: Array<Array<DateSelectionCell | null>>
 previousLabel: string
 nextLabel: string
 onPrevious: () => void
 onNext: () => void
 onSelect: (id: string) => void
 isDisabled?: boolean
 autoFocus?: boolean
}) {
 return <Frame>
  <Header>
   <Navigation aria-label={previousLabel} onPress={onPrevious} isDisabled={isDisabled} autoFocus={autoFocus}>‹</Navigation>
   <Month aria-live="polite">{monthLabel}</Month>
   <Navigation aria-label={nextLabel} onPress={onNext} isDisabled={isDisabled}>›</Navigation>
  </Header>
  <Week>{weekdays.map((label, index) => <Weekday key={index}>{label}</Weekday>)}</Week>
  {weeks.map((week, index) => <Week key={index}>{week.map((day, column) => day
   ? <Day key={day.id} aria-label={day.accessibleLabel} aria-pressed={day.selected} aria-current={day.today ? 'date' : undefined} isDisabled={isDisabled} onPress={() => onSelect(day.id)}
      style={day.selected ? { boxShadow: 'inset 0 calc(var(--spacing) * -0.5) 0 var(--color-brand-green)' } : undefined}
      className={day.selected ? 'bg-surface-card' : day.today ? 'bg-brand-green/14 ring-1 ring-inset ring-brand-green data-[hovered]:bg-brand-green/18' : undefined}>{day.label}</Day>
   : <Placeholder key={`blank-${column}`} />)}</Week>)}
 </Frame>
}
