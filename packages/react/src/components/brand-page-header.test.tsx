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
		// Tracking moved from `tracking-tight` to `tracking-[0]` with the GS Manager
		// port; the contract this test names is the heading level + type scale.
		expect(html).toContain('tracking-[0]')
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

		// Still two-thirds hero / one-third CTA — expressed as an explicit 2fr_1fr
		// track list now that the header also supports a `navigation` variant, rather
		// than the old fixed 3-column grid with a col-span-2 hero.
		expect(html).toContain('md:grid-cols-[2fr_1fr]')
		expect(html).toContain('md:col-start-2')
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

		// The undocked CTA still owns the second column for its full height; it simply
		// loses the fixed mobile bar.
		expect(html).toContain('md:col-start-2')
		expect(html).toContain('md:h-full')
		expect(html).not.toContain('pb-mobile-cta-bottom')
	})

	test('renders the source responsive Create Hub surface when expanded', () => {
		const html = renderToStaticMarkup(
			<BrandPageHeader
				greeting="Dashboard"
				cta={({ expanded, controls, toggle }) => (
					<button
						type="button"
						aria-expanded={expanded}
						aria-controls={controls}
						onClick={toggle}
					>
						Create
					</button>
				)}
				ctaLabel="Create hub"
				createHub={<div>Hub content</div>}
				expanded
			/>,
		)

		expect(html).toContain('hidden')
		expect(html).toContain('>Create</button>')
		expect(html).toContain('role="region"')
		expect(html).toContain('max-h-create-hub-partial')
		expect(html).toContain('animate-create-hub-backdrop')
		expect(html).toContain('animate-create-hub-sheet')
		expect(html).toContain('md:origin-top-right')
		expect(html).toContain('md:animate-create-hub-desktop')
		expect(html).toContain('data-create-hub-focus="mobile"')
		expect(html).toContain('data-create-hub-focus="desktop"')
		expect(html).toContain('Hub content')
	})

	test('gives a custom CTA the disclosure state and generated controls id', () => {
		const html = renderToStaticMarkup(
			<BrandPageHeader
				greeting="Dashboard"
				cta={({ expanded, controls }) => (
					<button type="button" aria-expanded={expanded} aria-controls={controls}>
						Create
					</button>
				)}
				createHub={<div>Hub content</div>}
			/>,
		)

		expect(html).toContain('aria-expanded="false"')
		expect(html).toMatch(/aria-controls="[^"]+"/)
	})

	// #25: this row used the source's decorative grey (#b3b3b3, 2.10:1 on `surface`).
	// It is a navigation LINK, so it takes the readable `fg-muted` (5.98:1) — and the
	// nested anchor must inherit it, not fall back to the browser's default link blue.
	test('uses the readable muted grey for the parent row, anchor included', () => {
		const html = renderToStaticMarkup(
			<BrandPageHeader greeting="Colors" parentLink={<a href="/tokens">Tokens</a>} />,
		)

		// The parent link is now a Breadcrumb NAV LANDMARK rather than a span inside
		// the <h1> — a page title must not contain its own parent link. Scoped to that
		// nav, NOT the whole component: a legitimately ornamental `fg-subtle`
		// elsewhere in the header must not fail a test that names this row.
		const parentRow = html.match(/<nav aria-label="Breadcrumb" class="([^"]*\[&amp;_a\][^"]*)"/)?.[1]

		expect(parentRow).toBeDefined()
		expect(parentRow).toContain('text-fg-muted')
		expect(parentRow).toContain('[&amp;_a]:text-fg-muted')
		expect(parentRow).not.toContain('text-fg-subtle')
	})
})
