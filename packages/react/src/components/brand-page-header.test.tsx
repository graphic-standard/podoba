/// <reference types="bun" />

import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

import { BrandPageHeader } from './brand-page-header'

describe('BrandPageHeader heading semantics', () => {
	test('uses h1 by default for top-level pages', () => {
		const html = renderToStaticMarkup(<BrandPageHeader greeting="Projects" />)

		expect(html).toContain('<h1')
		expect(html).toContain('>Projects</h1>')
	})

	test('supports a nested h2 without changing the visual component', () => {
		const html = renderToStaticMarkup(
			<BrandPageHeader greeting="Graphic Outputs" headingLevel={2} />,
		)

		expect(html).toContain('<h2')
		expect(html).toContain('>Graphic Outputs</h2>')
		expect(html).not.toContain('<h1')
	})
})
