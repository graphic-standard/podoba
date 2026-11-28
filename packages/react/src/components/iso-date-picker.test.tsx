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
		expect(parseIsoDateValue('2026-03-01T09:30:15.250', 'minute')?.toString()).toBe('2026-03-01T09:30:15.25')
		for (const bad of ['', null, undefined, 'tomorrow', '2026-13-45', '2026-03-01garbage']) expect(parseIsoDateValue(bad)).toBeNull()
	})

	test('instants are refused in both granularities instead of read as a UTC date', () => {
		// Midnight 1 March in Central Europe, as Date#toISOString() writes it: slicing it
		// would show 28 February.
		for (const instant of ['2026-02-28T23:00:00.000Z', '2026-03-01T09:30:00Z', '2026-03-01T09:30:00+01:00']) {
			expect(parseIsoDateValue(instant, 'day')).toBeNull()
			expect(parseIsoDateValue(instant, 'minute')).toBeNull()
		}
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

	/** Mount a picker; keys go to segments without focus(), which loops happy-dom's selection. */
	async function mount(node: () => React.ReactElement) {
		const host = document.createElement('div')
		document.body.append(host)
		const root = createRoot(host)
		await act(async () => root.render(node()))
		const press = async (type: string, key: string) => {
			const segment = host.querySelector<HTMLElement>(`[data-type="${type}"]`)!
			await act(async () => { segment.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })) })
		}
		const unmount = async () => { await act(async () => root.unmount()); host.remove() }
		return { press, unmount }
	}

	test('a change comes back as an ISO string, in both granularities', async () => {
		const changes: (string | null)[] = []
		const day = await mount(() => <IsoDatePicker label="Starts" value="2026-03-01" onChange={(value) => changes.push(value)} />)
		await day.press('day', 'ArrowUp')
		expect(changes).toEqual(['2026-03-02'])
		await day.unmount()

		const minute = await mount(() => <IsoDatePicker label="Starts" granularity="minute" value="2026-03-01T09:30" onChange={(value) => changes.push(value)} />)
		await minute.press('minute', 'ArrowUp')
		expect(changes.at(-1)).toBe('2026-03-01T09:31')
		await minute.unmount()
	})

	// Clearing segments (Backspace) loops happy-dom's selection inside React Aria, so the
	// re-render and min/max contracts are tested against a stubbed DatePicker in
	// iso-date-picker-props.test.tsx, and clearing to null is checked in the gallery.
})
