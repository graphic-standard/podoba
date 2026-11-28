import { GlobalRegistrator } from '@happy-dom/global-registrator'
GlobalRegistrator.register()
import { afterAll, expect, test } from 'bun:test'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { type IsoDateGranularity, useIsoDateValue } from './iso-date-picker'
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
afterAll(() => GlobalRegistrator.unregister())

// IsoDatePicker feeds DatePicker through useIsoDateValue, for value, minValue and
// maxValue. Clearing a segment in happy-dom loops its selection handling inside React
// Aria, so the re-render contract is tested on the hook itself.
const seen: unknown[] = []
function Probe({ value, granularity, render }: { value: string; granularity?: IsoDateGranularity; render: number }) {
	seen.push(useIsoDateValue(value, granularity))
	return <span>{render}</span>
}

test('the same string gives the same value object across re-renders, so a half-edited segment survives', async () => {
	// React Aria compares the controlled value by identity and resets its segments when
	// it changes; a form re-renders for unrelated reasons while a field is half edited.
	const root = createRoot(document.createElement('div'))
	await act(async () => root.render(<Probe value="2026-03-15" render={1} />))
	await act(async () => root.render(<Probe value="2026-03-15" render={2} />))
	expect(seen.at(-1)).toBe(seen.at(-2))
	await act(async () => root.render(<Probe value="2026-03-16" render={3} />))
	expect(seen.at(-1)).not.toBe(seen.at(-2))
	expect(String(seen.at(-1))).toBe('2026-03-16')
	await act(async () => root.render(<Probe value="2026-03-16" granularity="minute" render={4} />))
	expect(String(seen.at(-1))).toBe('2026-03-16T00:00:00')
	await act(async () => root.unmount())
})
