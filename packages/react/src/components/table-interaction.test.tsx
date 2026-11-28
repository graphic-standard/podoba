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

	test('a bare label is text and presses the row; a label for a control does not', async () => {
		const pressed: string[] = []
		const labelColumns: TableColumn<Venue>[] = [
			{ key: 'tag', header: 'Tag', render: (row) => <label data-tag={row.id}>Outdoor</label> },
			{ key: 'pick', header: 'Pick', render: (row) => <label data-pick={row.id}>Pick <input type="checkbox" /></label> },
		]
		await act(async () => root.render(<Table data={rows} columns={labelColumns} getRowKey={(row) => row.id} onRowClick={(row) => pressed.push(row.id)} />))
		await click(host.querySelector('[data-tag="v1"]')!)
		expect(pressed).toEqual(['v1'])
		await click(host.querySelector('[data-pick="v2"]')!)
		expect(pressed).toEqual(['v1'])
	})

	test('widget roles in a cell keep their own press', async () => {
		const pressed: string[] = []
		const roleColumns: TableColumn<Venue>[] = [{ key: 'slider', header: 'Level', render: (row) => <div role="slider" aria-valuenow={1} tabIndex={0} data-slider={row.id}>1</div> }]
		await act(async () => root.render(<Table data={rows} columns={roleColumns} getRowKey={(row) => row.id} onRowClick={(row) => pressed.push(row.id)} />))
		await click(host.querySelector('[data-slider="v1"]')!)
		expect(pressed).toEqual([])
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

	test('a table nested in a cell with its own rowActions opens only its own menu', async () => {
		const inner: TableColumn<Venue>[] = [{ key: 'name', header: 'Name', render: () => <span data-inner="">inner</span> }]
		const innerActions = () => [{ id: 'inner', items: [{ id: 'detach', label: 'Detach' }] }]
		const outer: TableColumn<Venue>[] = [
			{ key: 'name', header: 'Name', render: () => <Table data={[rows[0]!]} columns={inner} getRowKey={(row) => row.id} rowActions={innerActions} /> },
		]
		await act(async () => root.render(<Table data={rows} columns={outer} getRowKey={(row) => row.id} rowActions={actions} />))
		await rightClick(host.querySelector('[data-inner]')!)

		expect(menuItems()).toEqual(['Detach'])
	})

	test('a row with no visible actions keeps the browser menu, next to a row that has some', async () => {
		const some = (row: Venue) =>
			row.id === 'v1' ? [] : row.id === 'v2' ? [{ items: [{ id: 'gone', label: 'Gone', hidden: true }] }] : actions(row)
		const three = [...rows, { id: 'v3', name: 'Hall' }]
		await act(async () => root.render(<Table data={three} columns={columns} getRowKey={(row) => row.id} rowActions={some} />))
		for (const id of ['v1', 'v2']) {
			const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
			await act(async () => { host.querySelector(`[data-plain="${id}"]`)!.dispatchEvent(event) })
			expect(event.defaultPrevented).toBe(false)
			expect(document.querySelector('[role="menu"]')).toBeNull()
		}
		await rightClick(host.querySelector('[data-plain="v3"]')!)
		expect(menuItems()).toEqual(['Open Hall', 'Hide'])
	})

	test('links in a row-actions table get the iOS callout back', async () => {
		await act(async () => root.render(<Table data={rows} columns={columns} getRowKey={(row) => row.id} rowActions={actions} />))
		expect(host.querySelector('[data-context-menu-target]')!.className).toContain('[&_a]:[-webkit-touch-callout:default]')
	})

	test('without rowActions there is no menu wrapper and rows stay plain', async () => {
		await act(async () => root.render(<Table data={rows} columns={columns} getRowKey={(row) => row.id} />))

		expect(host.querySelector('[data-context-menu-target]')).toBeNull()
		expect(host.querySelector('tbody tr')!.hasAttribute('tabindex')).toBe(false)
	})
})
