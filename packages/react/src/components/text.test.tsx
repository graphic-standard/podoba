import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

import { Subtle } from './subtle'
import { DisplayHeading, PanelHeading, Text } from './text'

describe('DisplayHeading', () => {
	test('renders the shared GS product-display typography and supports asChild', () => {
		const html = renderToStaticMarkup(
			<DisplayHeading asChild>
				<h1>Review final output</h1>
			</DisplayHeading>,
		)

		expect(html).toContain('<h1')
		expect(html).toContain('text-display-large')
		expect(html).toContain('font-medium')
		expect(html).toContain('Review final output')
	})

	test('renders the shared workflow panel title treatment', () => {
		const html = renderToStaticMarkup(<PanelHeading>Approval process</PanelHeading>)

		expect(html).toContain('text-panel-heading')
		expect(html).toContain('font-medium')
	})
})

/**
 * #25: both primitives used to render `fg-subtle` (#b3b3b3) unconditionally, which
 * measures 2.10:1 on `surface` — below even the 3:1 large-text floor. The ratios are
 * asserted in packages/tokens `contrast.test.ts`; what is guarded here is that the
 * DEFAULT path can never reach the decorative token again.
 */
describe('de-emphasised text is AA by default', () => {
	test('Subtle defaults to the AA-safe fg-muted', () => {
		const html = renderToStaticMarkup(<Subtle>Good afternoon</Subtle>)

		expect(html).toContain('text-fg-muted')
		expect(html).not.toContain('text-fg-subtle')
	})

	test('Text never reaches fg-subtle without asking for it by name', () => {
		for (const tone of ['default', 'muted', 'subtle', 'inverted'] as const) {
			expect(renderToStaticMarkup(<Text tone={tone}>Copy</Text>)).not.toContain('text-fg-subtle')
		}

		expect(renderToStaticMarkup(<Text>Copy</Text>)).not.toContain('text-fg-subtle')
	})

	// `surface-inverted` does NOT flip with the theme, so in the light theme it is a
	// dark #242423 panel where `fg-muted` collapses to 2.60:1 — worse than the
	// `fg-subtle` this component used to apply there (7.41:1). `inverted` is the tone
	// for that surface, matching Tile's own `mutedTone()`.
	test('Subtle offers an inverted tone for the surface fg-muted cannot cover', () => {
		const html = renderToStaticMarkup(<Subtle tone="inverted">on a dark tile</Subtle>)

		expect(html).toContain('text-fg-inverted/60')
		expect(html).not.toContain('text-fg-muted')
	})

	// The fixed brand fills never flip either, and `fg-muted` is 3.60–4.01:1 on them.
	// `Tile.mutedTone()` already pairs them with `fg-on-brand/70`; a bare run needs
	// the same reach.
	test('Subtle offers an on-brand tone for the fixed brand fills', () => {
		const html = renderToStaticMarkup(<Subtle tone="on-brand">in a teal tile</Subtle>)

		expect(html).toContain('text-fg-on-brand/70')
		expect(html).not.toContain('text-fg-muted')
	})

	test('the decorative token stays reachable, but only explicitly', () => {
		expect(renderToStaticMarkup(<Subtle tone="decorative">/</Subtle>)).toContain('text-fg-subtle')
		expect(renderToStaticMarkup(<Text tone="decorative">/</Text>)).toContain('text-fg-subtle')
	})
})
