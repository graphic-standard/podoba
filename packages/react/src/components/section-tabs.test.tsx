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
})
