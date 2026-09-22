/// <reference types="bun" />

import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

import { Table } from './table'

const columns = [
	{ key: 'name', header: 'Venue' },
	{ key: 'action', header: 'Banner', align: 'right' as const },
]
const data = [{ name: 'Stadion Strahov', action: 'Open' }]

describe('<Table appearance="task">', () => {
	const html = renderToStaticMarkup(<Table appearance="task" columns={columns} data={data} />)

	test('uses the GS TaskTable surface: fixed layout, mono muted headers, border-muted rules', () => {
		expect(html).toContain('table-fixed border-b border-border-muted')
		expect(html).toContain('p-4 align-middle font-mono text-small font-normal leading-4.5 tracking-normal text-fg-muted')
		expect(html).toContain('border-l border-border-muted p-4')
		expect(html).toContain('first:border-l-0')
		// The default appearance's uppercase label treatment must not leak in.
		expect(html).not.toContain('uppercase')
	})

	test('stacks each row as a card below sm and hides the header row', () => {
		expect(html).toContain('max-sm:hidden')
		expect(html).toContain('max-sm:flex max-sm:flex-col max-sm:gap-3 max-sm:rounded-lg')
		expect(html).toContain('max-sm:bg-surface-card')
		// A right-aligned column reads left-aligned inside the stacked card.
		expect(html).toContain('text-right border-l')
		expect(html).toContain('max-sm:text-left')
	})

	test('leaves the default appearance untouched', () => {
		const plain = renderToStaticMarkup(<Table columns={columns} data={data} />)
		expect(plain).not.toContain('table-fixed')
		expect(plain).not.toContain('max-sm:')
		expect(plain).toContain('uppercase')
	})
})
