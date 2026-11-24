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

	test('a selected switchable tab keeps its plain label, with the hint as a tooltip only', () => {
		const html = renderToStaticMarkup(
			<SectionTabs
				tabs={[{ key: 'tasks', label: 'All (18)', switchable: true, switchHintLabel: 'Switch view' }]}
				active="tasks"
				onChange={() => {}}
			/>,
		)

		expect(html).toContain('data-switchable="true"')
		expect(html).toContain('<span title="Switch view">All (18)</span>')
		expect(html).not.toContain('<svg')
		expect(html).not.toContain('group/switch')
	})
})
