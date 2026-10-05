/// <reference types="bun" />

import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

import { nextTableSort, Table, TableSortHeader } from './table'

describe('<Table>', () => {
	test('renders the empty message across every column', () => {
		const html = renderToStaticMarkup(<Table columns={[{ key: 'a', header: 'A' }, { key: 'b', header: 'B' }]} data={[]} emptyMessage="Nothing here" />)
		expect(html).toContain('colSpan="2"')
		expect(html).toContain('Nothing here')
	})

	test('sortable columns get a header button and aria-sort', () => {
		const html = renderToStaticMarkup(<Table enableSorting columns={[{ key: 'a', header: 'A', sortable: true }, { key: 'b', header: 'B' }]} data={[{ a: 'x', b: 'y' }]} />)
		expect(html).toContain('aria-sort="none"')
		expect(html.match(/<button/g)?.length).toBe(1)
	})

	test('pressable rows are focusable', () => {
		const html = renderToStaticMarkup(<Table onRowClick={() => {}} columns={[{ key: 'a', header: 'A' }]} data={[{ a: 'x' }]} />)
		expect(html).toContain('tabindex="0"')
	})
})

describe('sorting', () => {
	test('cycles unsorted, ascending, descending, unsorted', () => {
		const asc = nextTableSort(null, 'name')
		expect(asc).toEqual({ key: 'name', dir: 'asc' })
		const desc = nextTableSort(asc, 'name')
		expect(desc).toEqual({ key: 'name', dir: 'desc' })
		expect(nextTableSort(desc, 'name')).toBeNull()
		expect(nextTableSort(desc, 'other')).toEqual({ key: 'other', dir: 'asc' })
	})

	test('the active direction is announced on the header cell', () => {
		const html = renderToStaticMarkup(<table><thead><tr><TableSortHeader label="Name" direction="desc" onSort={() => {}} /></tr></thead></table>)
		expect(html).toContain('aria-sort="descending"')
	})
})
