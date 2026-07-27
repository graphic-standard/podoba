/// <reference types="bun" />

import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

import { BrandPageHeader } from './brand-page-header'

describe('BrandPageHeader heading semantics', () => {
	test('uses h1 by default for top-level pages', () => {
		const html = renderToStaticMarkup(<BrandPageHeader greeting="Projects" />)

		expect(html).toContain('<h1')
		expect(html).toContain('>Projects</h1>')
		expect(html).toContain('text-display-large')
		expect(html).toContain('tracking-tight')
	})

	test('supports a nested h2 without changing the visual component', () => {
		const html = renderToStaticMarkup(
			<BrandPageHeader greeting="Graphic Outputs" headingLevel={2} />,
		)

		expect(html).toContain('<h2')
		expect(html).toContain('>Graphic Outputs</h2>')
		expect(html).not.toContain('<h1')
	})

	test('keeps the source two-thirds hero / one-third CTA composition', () => {
		const html = renderToStaticMarkup(
			<BrandPageHeader greeting="Design system and templates" cta={<div>CTA</div>} />,
		)

		expect(html).toContain('md:grid-cols-3')
		expect(html).toContain('md:col-span-2')
		expect(html).toContain('inset-x-0')
		expect(html).toContain('pb-mobile-cta-bottom')
		expect(html).toContain('md:h-full')
	})

	test('can opt out of the mobile dock for non-hero compositions', () => {
		const html = renderToStaticMarkup(
			<BrandPageHeader
				greeting="Design system and templates"
				cta={<div>CTA</div>}
				mobileCtaDocked={false}
			/>,
		)

		expect(html).toContain('h-full min-w-0')
		expect(html).not.toContain('pb-mobile-cta-bottom')
	})

	test('uses the source decorative grey for the parent row', () => {
		const html = renderToStaticMarkup(
			<BrandPageHeader greeting="Colors" parentLink={<a href="/tokens">Tokens</a>} />,
		)

		expect(html).toContain('text-fg-subtle')
		expect(html).toContain('[&amp;_a]:text-fg-subtle')
		expect(html).not.toContain('[&amp;_a]:text-fg-muted')
	})
})
