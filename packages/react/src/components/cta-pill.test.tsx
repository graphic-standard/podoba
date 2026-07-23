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
		expect(html).toContain('bg-brand-secondary')
		expect(html).toContain('text-fg-on-brand')
		// the theme-flipping fg went white-on-green in a dark shell
		expect(html).not.toContain('text-fg"')
	})

	test('emphasis is carried by weight, never by hardcoded white', () => {
		expect(html).toContain('font-semibold')
		expect(html).not.toContain('text-white')
	})
})
