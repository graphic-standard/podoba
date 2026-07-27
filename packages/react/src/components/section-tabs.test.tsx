/// <reference types="bun" />

import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

import { SectionTabs } from './section-tabs'

describe('<SectionTabs> source navigation contract', () => {
	test('renders the selected overview reset as a visible text tab', () => {
		const html = renderToStaticMarkup(
			<SectionTabs
				tabs={[{ key: 'tokens', label: 'Tokens' }]}
				active=""
				onChange={() => {}}
				onReset={() => {}}
				resetLabel="Summary"
				resetContent="Summary"
				isResetSelected
			/>,
		)

		expect(html).toContain('aria-label="Summary"')
		expect(html).toContain('aria-pressed="true"')
		expect(html).toContain('>Summary</button>')
		expect(html).toContain('bg-surface-muted text-fg')
	})

	test('uses the source two-thirds desktop row and horizontal mobile scroller', () => {
		const html = renderToStaticMarkup(
			<SectionTabs
				tabs={[{ key: 'tokens', label: 'Tokens' }]}
				active="tokens"
				onChange={() => {}}
			/>,
		)

		expect(html).toContain('lg:w-2/3')
		expect(html).toContain('flex-nowrap')
		expect(html).toContain('overflow-x-auto')
		expect(html).toContain('gap-2')
		expect(html).toContain('px-nav-x')
	})
})
