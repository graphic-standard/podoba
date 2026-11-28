import { GlobalRegistrator } from '@happy-dom/global-registrator'
GlobalRegistrator.register()
import { afterAll, describe, expect, test } from 'bun:test'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { ComboBox, ComboBoxItem } from './combobox'
import { FocusOverlayContext } from './focus-context'
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
afterAll(() => GlobalRegistrator.unregister())

const inputClass = (html: string) => html.match(/<input[^>]*class="([^"]*)"/)?.[1] ?? ''

describe('ComboBox appearance', () => {
	test('outlined stays the default box', () => {
		const cls = inputClass(renderToStaticMarkup(<ComboBox label="L"><ComboBoxItem id="a">A</ComboBoxItem></ComboBox>))

		expect(cls).toContain('border border-border bg-surface')
		expect(cls).toMatch(/\bh-10\b/)
		expect(cls).toContain('pr-11')
	})

	test('filled takes the borderless 42px skin, whatever the size', () => {
		const cls = inputClass(
			renderToStaticMarkup(
				<ComboBox label="L" appearance="filled" size="tall">
					<ComboBoxItem id="a">A</ComboBoxItem>
				</ComboBox>,
			),
		)

		expect(cls).toContain('border-0 bg-surface-card')
		expect(cls).toContain('h-10.5')
		expect(cls).not.toMatch(/\bh-10(?![.\d])|h-control-tall/)
		// Invalid lives on the ComboBox root, so the filled ring must read the group.
		expect(cls).toContain('group-data-[invalid]:ring-danger')
		expect(cls).toContain('focus-visible:outline-ring')
	})

	test('without the toggle the right padding shrinks in both skins', () => {
		for (const appearance of ['outlined', 'filled'] as const) {
			const cls = inputClass(
				renderToStaticMarkup(
					<ComboBox label="L" appearance={appearance} showToggle={false}>
						<ComboBoxItem id="a">A</ComboBoxItem>
					</ComboBox>,
				),
			)

			expect(cls).toContain('pr-4')
			expect(cls).not.toContain('pr-11')
		}
	})
})

describe('ComboBox empty state', () => {
	test('the open list shows the given empty state when nothing matches', async () => {
		const host = document.createElement('div')
		document.body.append(host)
		const root = createRoot(host)
		await act(async () =>
			root.render(
				// An empty collection is what a list filtered down to nothing looks like
				// to the ListBox; `allowsEmptyCollection` lets focus open it anyway.
				<ComboBox label="Sport" emptyState="Nic nenalezeno" allowsEmptyCollection>
					{[]}
				</ComboBox>,
			),
		)
		await act(async () => host.querySelector('input')!.focus())

		expect(document.body.textContent).toContain('Nic nenalezeno')
		expect(document.body.textContent).not.toContain('No results')
		await act(async () => root.unmount())
		host.remove()
	})

	test('the focus overlay list uses it too, and the default stays "No results"', () => {
		const render = (emptyState?: string) =>
			renderToStaticMarkup(
				<FocusOverlayContext.Provider value>
					<ComboBox label="Sport" emptyState={emptyState}>
						{[]}
					</ComboBox>
				</FocusOverlayContext.Provider>,
			)

		expect(render('Nic nenalezeno')).toContain('Nic nenalezeno')
		expect(render()).toContain('No results')
	})
})
