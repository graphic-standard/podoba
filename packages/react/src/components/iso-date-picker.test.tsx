import { GlobalRegistrator } from '@happy-dom/global-registrator'
GlobalRegistrator.register()
import { afterAll, describe, expect, test } from 'bun:test'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { formatIsoDateValue, IsoDatePicker, parseIsoDateValue } from './iso-date-picker'
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
afterAll(() => GlobalRegistrator.unregister())

describe('ISO date helpers', () => {
	test('parse a date, a local date-time, and fall back to null', () => {
		expect(parseIsoDateValue('2026-03-01')?.toString()).toBe('2026-03-01')
		expect(parseIsoDateValue('2026-03-01T09:30', 'minute')?.toString()).toBe('2026-03-01T09:30:00')
		// A date-time stored where a date is expected keeps its date; a date given to minute starts at midnight.
		expect(parseIsoDateValue('2026-03-01T09:30', 'day')?.toString()).toBe('2026-03-01')
		expect(parseIsoDateValue('2026-03-01', 'minute')?.toString()).toBe('2026-03-01T00:00:00')
		for (const bad of ['', null, undefined, 'tomorrow', '2026-13-45']) expect(parseIsoDateValue(bad)).toBeNull()
	})

	test('format to the stored shape: YYYY-MM-DD or YYYY-MM-DDTHH:mm', () => {
		const date = parseIsoDateValue('2026-03-01')
		const dateTime = parseIsoDateValue('2026-03-01T09:30', 'minute')
		expect(formatIsoDateValue(date)).toBe('2026-03-01')
		expect(formatIsoDateValue(dateTime, 'minute')).toBe('2026-03-01T09:30')
		expect(formatIsoDateValue(dateTime, 'day')).toBe('2026-03-01')
		expect(formatIsoDateValue(date, 'minute')).toBe('2026-03-01T00:00')
		expect(formatIsoDateValue(null)).toBeNull()
	})
})

describe('IsoDatePicker', () => {
	/** The field's segments by type (year, month, day, hour, minute), read from the parsed markup. */
	const segments = (html: string) => {
		const host = document.createElement('div')
		host.innerHTML = html
		return Object.fromEntries([...host.querySelectorAll('[data-type]')].map((segment) => [segment.getAttribute('data-type'), segment.getAttribute('aria-valuenow')]))
	}

	test('shows the stored ISO value, and an invalid one as an empty field', () => {
		const date = segments(renderToStaticMarkup(<IsoDatePicker label="Starts" value="2026-03-01" onChange={() => {}} />))
		expect([date.year, date.month, date.day]).toEqual(['2026', '3', '1'])
		expect(date.hour).toBeUndefined()

		const dateTime = segments(renderToStaticMarkup(<IsoDatePicker label="Starts" granularity="minute" value="2026-03-01T09:30" onChange={() => {}} />))
		expect([dateTime.day, dateTime.hour, dateTime.minute]).toEqual(['1', '9', '30'])

		const invalid = segments(renderToStaticMarkup(<IsoDatePicker label="Starts" value="not a date" onChange={() => {}} />))
		expect(invalid.year).toBeNull()
	})

	test('a change comes back as an ISO string', async () => {
		const changes: (string | null)[] = []
		const host = document.createElement('div')
		document.body.append(host)
		const root = createRoot(host)
		await act(async () => root.render(<IsoDatePicker label="Starts" value="2026-03-01" onChange={(value) => changes.push(value)} />))
		// No focus(): happy-dom's selection handling loops on a focused date segment.
		const day = host.querySelector<HTMLElement>('[data-type="day"]')!
		await act(async () => { day.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true })) })
		expect(changes).toEqual(['2026-03-02'])
		await act(async () => root.unmount())
		host.remove()
	})
})
