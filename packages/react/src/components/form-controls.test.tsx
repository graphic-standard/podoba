import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

import { Button } from './button'
import { Input } from './input'
import { Select, SelectItem } from './select'

describe('source-parity form controls', () => {
	test('renders the tall workflow input with an overridable control radius', () => {
		const html = renderToStaticMarkup(
			<Input label="Priority" size="tall" inputClassName="rounded-md" />,
		)

		expect(html).toContain('text-panel-heading')
		expect(html).toContain('h-control-tall')
		expect(html).toContain('text-small')
		expect(html).toContain('rounded-md')
	})

	// Regression guard: a borderless `bg-surface-card` field is invisible inside a
	// Card (also surface-card) and in dark theme, where surface-card === surface.
	// Both controls must keep the shared bordered fill.
	test('Input keeps a visible boundary against a cream or dark surface', () => {
		const html = renderToStaticMarkup(<Input label="Priority" />)

		expect(html).toContain('border border-border bg-surface')
		expect(html).not.toContain('border-0')
	})

	test('Select trigger keeps a visible boundary against a cream or dark surface', () => {
		const html = renderToStaticMarkup(
			<Select label="Priority" placeholder="Pick one">
				<SelectItem id="a">A</SelectItem>
			</Select>,
		)

		expect(html).toContain('border border-border bg-surface')
		expect(html).not.toContain('border-0')
	})

	test('renders the prominent workflow CTA', () => {
		const html = renderToStaticMarkup(<Button size="prominent">Approve</Button>)

		expect(html).toContain('h-11')
		expect(html).toContain('text-panel-heading')
		expect(html).toContain('bg-brand-primary')
		expect(html).toContain('Approve')
	})

	test('keeps disabled button labels AA-readable instead of fading the whole control', () => {
		const html = renderToStaticMarkup(<Button isDisabled>Approve</Button>)

		expect(html).toContain('data-[disabled]:bg-surface-muted')
		expect(html).toContain('data-[disabled]:text-fg')
		expect(html).toContain('data-[disabled]:shadow-none')
		expect(html).not.toContain('data-[disabled]:opacity-50')
	})
})
