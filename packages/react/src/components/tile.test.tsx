import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

import { Tile } from './tile'

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
