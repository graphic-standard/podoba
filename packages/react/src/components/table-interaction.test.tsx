import { GlobalRegistrator } from '@happy-dom/global-registrator'
GlobalRegistrator.register()
import { afterAll, afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { act } from 'react'
import { createPortal } from 'react-dom'
import { createRoot, type Root } from 'react-dom/client'
import { Table, type TableColumn } from './table'
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
afterAll(() => GlobalRegistrator.unregister())

type Venue = { id: string; name: string }
const rows: Venue[] = [
	{ id: 'v1', name: 'Stadium' },
	{ id: 'v2', name: 'Pool' },
]
const columns: TableColumn<Venue>[] = [
	{ key: 'name', header: 'Name', render: (row) => <a href={`/venue/${row.id}`}>{row.name}</a> },
	{ key: 'id', header: 'Id', render: (row) => <span data-plain={row.id}>{row.id}</span> },
	{ key: 'edit', header: '', render: (row) => <button type="button" data-edit={row.id}>Edit</button> },
]

let host: HTMLDivElement
let root: Root
beforeEach(() => {
	host = document.createElement('div')
	document.body.append(host)
	root = createRoot(host)
})
afterEach(async () => {
	await act(async () => root.unmount())
	host.remove()
	document.body.innerHTML = ''
})

const click = async (element: Element, init: MouseEventInit = {}) => {
	await act(async () => { element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...init })) })
}
const rightClick = async (element: Element) => {
	await act(async () => { element.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 20, clientY: 30 })) })
}
const menuItems = () => [...document.querySelectorAll('[role="menuitem"]')].map((item) => item.textContent)

describe('pressable rows with controls in their cells', () => {
	test('a plain cell presses the row; a link or button in a cell keeps its own click', async () => {
		const pressed: string[] = []
		await act(async () => root.render(<Table data={rows} columns={columns} getRowKey={(row) => row.id} onRowClick={(row) => pressed.push(row.id)} />))

		await click(host.querySelector('[data-plain="v1"]')!)
		expect(pressed).toEqual(['v1'])
		await click(host.querySelector('a[href="/venue/v2"]')!, { metaKey: true })
		await click(host.querySelector('[data-edit="v2"]')!)
		expect(pressed).toEqual(['v1'])
	})

	test('Enter on the focused row still presses it', async () => {
		const pressed: string[] = []
		await act(async () => root.render(<Table data={rows} columns={columns} getRowKey={(row) => row.id} onRowClick={(row) => pressed.push(row.id)} />))
		const row = host.querySelector('tbody tr')!
		await act(async () => { row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })) })
		expect(pressed).toEqual(['v1'])
	})

	test('a click in a portal a cell opened does not press the row', async () => {
		const pressed: string[] = []
		const portalColumns: TableColumn<Venue>[] = [
			{ key: 'name', header: 'Name', render: (row) => createPortal(<div data-portal={row.id}>Dialog</div>, document.body) },
		]
		await act(async () => root.render(<Table data={rows} columns={portalColumns} getRowKey={(row) => row.id} onRowClick={(row) => pressed.push(row.id)} />))
		await click(document.querySelector('[data-portal="v1"]')!)
		expect(pressed).toEqual([])
	})
})

describe('rowActions', () => {
	const actions = (row: Venue) => [{ id: 'row', items: [{ id: 'open', label: `Open ${row.name}` }, { id: 'hide', label: 'Hide' }] }]

	test('a right-click on a row opens that row’s actions', async () => {
		await act(async () => root.render(<Table data={rows} columns={columns} getRowKey={(row) => row.id} rowActions={actions} rowActionsLabel="Venue actions" />))
		await rightClick(host.querySelector('[data-plain="v2"]')!)

		expect(menuItems()).toEqual(['Open Pool', 'Hide'])
		expect(document.querySelector('[role="menu"]')!.getAttribute('aria-label')).toBe('Venue actions')
	})

	test('a right-click on a link in a cell keeps the browser menu', async () => {
		await act(async () => root.render(<Table data={rows} columns={columns} getRowKey={(row) => row.id} rowActions={actions} />))
		const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
		await act(async () => { host.querySelector('a[href="/venue/v1"]')!.dispatchEvent(event) })

		expect(event.defaultPrevented).toBe(false)
		expect(document.querySelector('[role="menu"]')).toBeNull()
	})

	test('rows become focusable without becoming buttons, and Shift+F10 opens the menu', async () => {
		await act(async () => root.render(<Table data={rows} columns={columns} getRowKey={(row) => row.id} rowActions={actions} />))
		const row = host.querySelector<HTMLElement>('tbody tr')!

		expect(row.getAttribute('tabindex')).toBe('0')
		expect(row.hasAttribute('role')).toBe(false)
		expect(row.className).toContain('focus-visible:ring-2')
		row.focus()
		await act(async () => { row.dispatchEvent(new KeyboardEvent('keydown', { key: 'F10', shiftKey: true, bubbles: true, cancelable: true })) })
		expect(menuItems()).toEqual(['Open Stadium', 'Hide'])
	})

	test('pressable rows keep their press and get the menu too', async () => {
		const pressed: string[] = []
		await act(async () => root.render(<Table data={rows} columns={columns} getRowKey={(row) => row.id} onRowClick={(row) => pressed.push(row.id)} rowActions={actions} />))
		const row = host.querySelector('tbody tr')!

		expect(row.getAttribute('role')).toBe('button')
		await rightClick(host.querySelector('[data-plain="v1"]')!)
		expect(menuItems()).toEqual(['Open Stadium', 'Hide'])
		expect(pressed).toEqual([])
	})

	test('a table nested in a cell does not open the outer table’s menu', async () => {
		const inner: TableColumn<Venue>[] = [{ key: 'name', header: 'Name', render: () => <span data-inner="">inner</span> }]
		const outer: TableColumn<Venue>[] = [{ key: 'name', header: 'Name', render: () => <Table data={[rows[0]!]} columns={inner} /> }]
		await act(async () => root.render(<Table data={rows} columns={outer} getRowKey={(row) => row.id} rowActions={actions} />))
		await rightClick(host.querySelector('[data-inner]')!)

		expect(document.querySelector('[role="menu"]')).toBeNull()
	})

	test('without rowActions there is no menu wrapper and rows stay plain', async () => {
		await act(async () => root.render(<Table data={rows} columns={columns} getRowKey={(row) => row.id} />))

		expect(host.querySelector('[data-context-menu-target]')).toBeNull()
		expect(host.querySelector('tbody tr')!.hasAttribute('tabindex')).toBe(false)
	})
})
