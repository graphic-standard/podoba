import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

import { Button } from './button'
import { ComboBox, ComboBoxItem } from './combobox'
import { DateField } from './date-field'
import { DatePicker } from './date-picker'
import { Input } from './input'
import { MultiSelect } from './multiselect'
import { NumberField } from './number-field'
import { SearchField } from './search-field'
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

	// Regression guard: a form mixing these controls must line up. Every outlined
	// field renders the same default box and label as `Input`, and honours `size`.
	const OUTLINED_FIELDS = {
		Input: (size?: 'tall') => <Input label="L" size={size} />,
		Select: (size?: 'tall') => (
			<Select label="L" placeholder="Pick" size={size}>
				<SelectItem id="a">A</SelectItem>
			</Select>
		),
		ComboBox: (size?: 'tall') => (
			<ComboBox label="L" size={size}>
				<ComboBoxItem id="a">A</ComboBoxItem>
			</ComboBox>
		),
		MultiSelect: (size?: 'tall') => <MultiSelect label="L" placeholder="Pick" options={[{ id: 'a', label: 'A' }]} size={size} />,
		DateField: (size?: 'tall') => <DateField label="L" size={size} />,
		DatePicker: (size?: 'tall') => <DatePicker label="L" size={size} />,
		NumberField: (size?: 'tall') => <NumberField label="L" size={size} />,
		SearchField: (size?: 'tall') => <SearchField label="L" size={size} />,
	}

	for (const [name, render] of Object.entries(OUTLINED_FIELDS)) {
		test(`${name} renders the shared outlined box, label and spacing`, () => {
			const html = renderToStaticMarkup(render())

			expect(html).toContain('border border-border bg-surface')
			expect(html).toMatch(/\bh-10\b/)
			expect(html).not.toMatch(/\bh-12\b|h-control-tall/)
			expect(html).toContain('text-panel-heading')
			expect(html).not.toContain('text-heading5')
			expect(html).toContain('gap-3')
			// Mouse focus shows the green border too (wrappers via focus-within).
			expect(html).toMatch(/data-\[(focused|focus-within)\]:border-brand-green/)
			expect(html).not.toContain('data-[focus-visible]:border-brand-green')
		})

		test(`${name} takes the tall size, like Input`, () => {
			const html = renderToStaticMarkup(render('tall'))

			expect(html).toContain('h-control-tall')
			expect(html).not.toMatch(/\bh-10\b/)
		})
	}

	test('Select keeps a long value on one line inside the trigger', () => {
		const html = renderToStaticMarkup(
			<Select label="L" placeholder="Pick" defaultSelectedKey="a">
				<SelectItem id="a">A very long selected brand name that would otherwise wrap</SelectItem>
			</Select>,
		)

		expect(html).toMatch(/class="[^"]*min-w-0 truncate[^"]*"/)
	})

	test('renders the prominent workflow CTA', () => {
		const html = renderToStaticMarkup(<Button size="prominent">Approve</Button>)

		expect(html).toContain('h-11')
		expect(html).toContain('text-panel-heading')
		expect(html).toContain('bg-brand-primary')
		expect(html).toContain('Approve')
	})

	// The measured half of this guard lives in packages/tokens `contrast.test.ts`,
	// which proves every inactive ink × surface pair below clears AA in both themes.
	// What can be asserted here is the class contract those numbers assume.
	const VARIANTS = ['primary', 'secondary', 'ghost', 'destructive'] as const

	test('no Button variant fades the whole control while inactive', () => {
		for (const variant of VARIANTS) {
			for (const props of [{ isDisabled: true }, { isPending: true }]) {
				const html = renderToStaticMarkup(
					<Button variant={variant} {...props}>
						Approve
					</Button>,
				)

				// Whole-control opacity blends the label into the PARENT surface, which
				// is what dropped the old `data-[disabled]:opacity-50` below AA.
				expect(html).not.toMatch(/data-\[disabled\]:opacity-/)
				expect(html).not.toMatch(/data-\[pending\]:opacity-/)
			}
		}
	})

	test('inactive Buttons keep their variant surface instead of collapsing to one muted pill', () => {
		const render = (variant: (typeof VARIANTS)[number]) =>
			renderToStaticMarkup(
				<Button variant={variant} isDisabled isPending>
					Approve
				</Button>,
			)

		// A submitting primary CTA sits next to a disabled `secondary` Cancel in every
		// workflow modal — it has to stay brand-filled to remain the primary action.
		expect(render('primary')).toContain('bg-brand-primary')
		expect(render('primary')).not.toMatch(/data-\[(disabled|pending)\]:bg-/)

		// `secondary` and `ghost` both hover to `surface-muted`, so painting their
		// disabled state onto that same token made inert and hovered identical.
		expect(render('secondary')).toContain('bg-surface-card')
		expect(render('secondary')).not.toMatch(/data-\[(disabled|pending)\]:bg-/)
		expect(render('ghost')).toContain('bg-transparent')
		expect(render('ghost')).not.toMatch(/data-\[(disabled|pending)\]:bg-/)

		// `destructive` is the one variant that does swap surface: white on `danger`
		// is only ~4.8:1, so its ink cannot be softened in place.
		expect(render('destructive')).toContain('data-[disabled]:bg-surface-muted')
	})
})
