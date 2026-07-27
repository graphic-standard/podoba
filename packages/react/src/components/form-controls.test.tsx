import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

import { Button } from './button'
import { Input } from './input'

describe('source-parity form controls', () => {
	test('renders the tall workflow input with an overridable control radius', () => {
		const html = renderToStaticMarkup(
			<Input label="Priority" size="tall" inputClassName="rounded-md" />,
		)

		expect(html).toContain('text-panel-heading')
		expect(html).toContain('h-control-tall')
		expect(html).toContain('bg-surface-card')
		expect(html).toContain('rounded-md')
	})

	test('renders the prominent workflow CTA', () => {
		const html = renderToStaticMarkup(<Button size="prominent">Approve</Button>)

		expect(html).toContain('h-11')
		expect(html).toContain('text-panel-heading')
		expect(html).toContain('bg-brand-primary')
		expect(html).toContain('Approve')
	})
})
