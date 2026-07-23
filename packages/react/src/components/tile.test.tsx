/// <reference types="bun" />

import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

import { Badge, Tile } from './tile'
import { StatsCard } from './stats-card'

describe('<Tile> media layout', () => {
	test('keeps eyebrow and long title in one collision-safe responsive flow', () => {
		const html = renderToStaticMarkup(
			<Tile
				backgroundImage="/tutorial.png"
				eyebrow="Stories"
				title="Start here: take your first guided tour of Graphic Standard"
				footer={<button type="button">Transcript</button>}
				badge={<span>1 min</span>}
			/>,
		)

		const overlay = html.indexOf('data-slot="media-overlay"')
		const eyebrow = html.indexOf('data-slot="media-eyebrow"')
		const content = html.indexOf('data-slot="media-content"')
		expect(overlay).toBeGreaterThan(-1)
		expect(eyebrow).toBeGreaterThan(overlay)
		expect(content).toBeGreaterThan(eyebrow)
		expect(html).toContain('@container')
		expect(html).toContain('absolute inset-4')
		expect(html).toContain('@sm:inset-6')
		expect(html).toContain('text-title')
		expect(html).toContain('@sm:text-display')
		expect(html).not.toContain('absolute left-6 top-6')
	})

	test('retains the named whole-tile button and interactive footer', () => {
		const html = renderToStaticMarkup(
			<Tile
				backgroundImage="/tutorial.png"
				onPress={() => {}}
				pressLabel="Open tutorial"
				footer={<button type="button">Transcript</button>}
			/>,
		)

		expect(html).toContain('aria-label="Open tutorial"')
		expect(html).toContain('pointer-events-auto')
		expect(html).toContain('>Transcript</button>')
	})
})

describe('semantic foreground pairing (WCAG AA — issues #14/#15)', () => {
	test('Badge pairs every surface with its semantic ink', () => {
		// fixed light surfaces → stable on-brand ink (theme-flipping fg went white-on-pastel)
		expect(renderToStaticMarkup(<Badge label="Live" color="green" />)).toContain('bg-brand-green text-fg-on-brand')
		expect(renderToStaticMarkup(<Badge label="Todo" color="yellow" />)).toContain('bg-accent-yellow text-fg-on-brand')
		// grey → full fg (fg-muted on surface-muted was ~3.7:1, under AA for caption text)
		expect(renderToStaticMarkup(<Badge label="Draft" color="grey" />)).toContain('bg-surface-muted text-fg')
		// flipping inverted surface → flipping inverted ink, never hardcoded white
		const darkBadge = renderToStaticMarkup(<Badge label="v3" color="dark" />)
		expect(darkBadge).toContain('bg-surface-inverted text-fg-inverted')
		expect(darkBadge).not.toContain('text-white')
	})

	test('dark Tile owns the surface-inverted/fg-inverted pair — consumer content inherits it', () => {
		const html = renderToStaticMarkup(
			<Tile theme="dark" eyebrow="Storage" title="62 GB" text="of 100 GB" footer="Manage" />,
		)
		expect(html).toContain('bg-surface-inverted')
		expect(html).toContain('text-fg-inverted') // root — inherited by consumer ReactNodes
		expect(html).toContain('text-fg-inverted/60') // muted text + footer
		expect(html).not.toContain('text-white')
	})

	test('teal and yellow Tiles use the stable on-brand ink for title, text and footer', () => {
		for (const theme of ['teal', 'yellow'] as const) {
			const html = renderToStaticMarkup(<Tile theme={theme} eyebrow="Campaign" title="Q4" text="6 channels" footer="Open" />)
			expect(html).toContain('text-fg-on-brand')
			expect(html).toContain('text-fg-on-brand/70')
			expect(html).not.toContain('text-fg"')
			expect(html).not.toContain('text-white')
		}
	})

	test('deprecated StatsCard inherits the dark pairing through Tile', () => {
		const html = renderToStaticMarkup(<StatsCard dark title="Cloud" value="2.4k" footer="Rendered outputs" />)
		expect(html).toContain('bg-surface-inverted')
		expect(html).toContain('text-fg-inverted')
		expect(html).not.toContain('text-white')
	})
})
