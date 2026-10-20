import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { RoundCheckToggle } from './round-check-toggle'

describe('RoundCheckToggle', () => {
	test('exposes its name and pressed state through a native button', () => {
		const html = renderToStaticMarkup(<RoundCheckToggle aria-label="Business expense" isSelected />)
		expect(html).toContain('aria-label="Business expense"')
		expect(html).toContain('aria-pressed="true"')
		expect(html).toContain('data-selected="true"')
		expect(html).toContain('rounded-full')
		expect(html).toContain('data-[selected]:bg-brand-green')
		expect(html).toContain('aria-hidden="true"')
	})
	test('supports uncontrolled unchecked and disabled selected states without a separate visual copy', () => {
		const open = renderToStaticMarkup(<RoundCheckToggle aria-label="Open comment" />)
		expect(open).toContain('aria-pressed="false"')
		const disabled = renderToStaticMarkup(<RoundCheckToggle aria-label="Completed comment" defaultSelected isDisabled />)
		expect(disabled).toContain('disabled=""')
		expect(disabled).toContain('aria-pressed="true"')
	})
})
