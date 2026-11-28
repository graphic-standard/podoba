/// <reference types="bun" />

import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

import { CtaPill } from './cta-pill'

describe('<CtaPill> foreground pairing (WCAG AA — issue #13)', () => {
	const html = renderToStaticMarkup(
		<CtaPill lead="Let's" emphasis="create" tail="something">
			<button type="button">Create</button>
		</CtaPill>,
	)

	test('every sentence fragment sits on the stable on-brand ink', () => {
		expect(html).toContain('bg-brand-green')
		expect(html).toContain('text-fg-on-brand')
		// the theme-flipping fg went white-on-green in a dark shell
		expect(html).not.toContain('text-fg"')
	})

	test('emphasis is carried by weight, never by hardcoded white', () => {
		expect(html).toContain('font-semibold')
		expect(html).not.toContain('text-white')
	})

	test('mobileHeader changes density without forcing positioning', () => {
		const mobileHtml = renderToStaticMarkup(
			<CtaPill lead="Let's" emphasis="create" tail="something" mobileHeader>
				<button type="button">Create</button>
			</CtaPill>,
		)

		expect(mobileHtml).not.toBe(html)
		expect(mobileHtml).not.toContain('fixed')
	})
})

describe('<CtaPill> stacked', () => {
	const render = (stacked?: boolean) =>
		renderToStaticMarkup(
			<CtaPill lead="Signups" subHeading="Opens on 1 March" stacked={stacked}>
				<button type="button">Create</button>
			</CtaPill>,
		)

	test('a sub-heading alone keeps the action beside the text', () => {
		const html = render()
		expect(html).toContain('items-center gap-nav-x')
		expect(html).not.toContain('flex-col')
	})

	test('stacked puts the action under the text, at the end', () => {
		const html = render(true)
		expect(html).toContain('flex-col items-stretch gap-3')
		expect(html).toContain('self-end')
	})
})
