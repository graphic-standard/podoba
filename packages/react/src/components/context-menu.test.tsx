import { GlobalRegistrator } from '@happy-dom/global-registrator'
GlobalRegistrator.register()
import { afterAll, afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { Button as RACButton } from 'react-aria-components'
import { ContextMenu, ContextMenuButton, type ContextMenuGroup, CONTEXT_MENU_SHEET_QUERY, useContextMenu } from './context-menu'
import { isLongPressContextMenu, LONG_PRESS_MS } from './context-menu-touch'
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
afterAll(() => GlobalRegistrator.unregister())

const originalMatchMedia = window.matchMedia
/** Pretend to be a phone (coarse pointer, narrow) or a desktop. */
function setPhone(phone: boolean) {
	window.matchMedia = ((query: string) => ({
		matches: phone && query === CONTEXT_MENU_SHEET_QUERY,
		media: query,
		onchange: null,
		addEventListener: () => {},
		removeEventListener: () => {},
		addListener: () => {},
		removeListener: () => {},
		dispatchEvent: () => false,
	})) as typeof window.matchMedia
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

let host: HTMLDivElement
let root: Root
beforeEach(() => {
	setPhone(false)
	host = document.createElement('div')
	document.body.append(host)
	root = createRoot(host)
})
afterEach(async () => {
	await act(async () => root.unmount())
	host.remove()
	document.body.innerHTML = ''
	window.matchMedia = originalMatchMedia
})

const touch = (type: string, target: Element, x = 40, y = 50, extra: PointerEventInit = {}) =>
	target.dispatchEvent(new PointerEvent(type, {
		bubbles: true, cancelable: true, composed: true, pointerId: 7, pointerType: 'touch', isPrimary: true,
		button: 0, buttons: type === 'pointerup' ? 0 : 1, clientX: x, clientY: y, width: 20, height: 20, pressure: 0.5,
		...extra,
	}))

/** Holds a finger on `target` past the long-press delay, then lifts it. */
async function longPress(target: Element, { lift = true }: { lift?: boolean } = {}) {
	await act(async () => {
		touch('pointerdown', target)
		await wait(LONG_PRESS_MS + 60)
	})
	if (lift) await act(async () => {
		touch('pointerup', target)
		target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX: 40, clientY: 50 }))
		await wait(120) // past React Aria's 80 ms long-press click
	})
}

const groups: ContextMenuGroup[] = [
	{ id: 'edit', items: [{ id: 'open', label: 'Open' }, { id: 'rename', label: 'Rename' }] },
	{ id: 'more', label: 'More', items: [{ id: 'delete', label: 'Delete', destructive: true }] },
]

const menu = () => document.querySelector('[role="menu"]')

describe('long press on touch', () => {
	test('opens the wrapper menu at the finger, and the card underneath does not activate', async () => {
		let pressed = 0
		const opened: Array<HTMLElement | null> = []
		await act(async () => root.render(
			<ContextMenu groups={groups} onOpenChange={(open, target) => { if (open) opened.push(target) }}>
				<RACButton onPress={() => pressed++}>Card</RACButton>
			</ContextMenu>,
		))
		const card = host.querySelector('button')!
		await longPress(card)
		expect(menu()).not.toBeNull()
		expect(opened).toEqual([card])
		const panel = document.querySelector<HTMLElement>('[data-context-menu-panel]')!
		expect(panel.style.left).toBe('40px')
		expect(panel.style.top).toBe('50px')
		expect(pressed).toBe(0)
	})

	test('a short tap is still a tap', async () => {
		let pressed = 0
		await act(async () => root.render(
			<ContextMenu groups={groups}><RACButton onPress={() => pressed++}>Card</RACButton></ContextMenu>,
		))
		const card = host.querySelector('button')!
		await act(async () => {
			touch('pointerdown', card)
			await wait(80)
			touch('pointerup', card)
			card.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
			await wait(LONG_PRESS_MS)
		})
		expect(pressed).toBe(1)
		expect(menu()).toBeNull()
	})

	test('moving the finger past the slop, or a scroll, cancels it', async () => {
		await act(async () => root.render(<ContextMenu groups={groups}><div id="card">Card</div></ContextMenu>))
		const card = host.querySelector('#card')!
		await act(async () => {
			touch('pointerdown', card)
			await wait(100)
			touch('pointermove', card, 40, 62) // 12 px
			await wait(LONG_PRESS_MS)
		})
		expect(menu()).toBeNull()
		await act(async () => {
			touch('pointerup', card)
			touch('pointerdown', card)
			await wait(100)
			document.dispatchEvent(new Event('scroll')) // a page scroll targets document
			await wait(LONG_PRESS_MS)
		})
		expect(menu()).toBeNull()
		await act(async () => {
			touch('pointerup', card)
			touch('pointerdown', card)
			await wait(100)
			touch('pointermove', card, 46, 50) // 6 px: a resting finger wobbles
			await wait(LONG_PRESS_MS)
		})
		expect(menu()).not.toBeNull()
	})

	test('a scroll elsewhere on the page (a carousel) does not cancel the hold', async () => {
		await act(async () => root.render(
			<div>
				<div id="carousel" style={{ overflow: 'auto' }}>slides</div>
				<ContextMenu groups={groups}><div id="card">Card</div></ContextMenu>
			</div>,
		))
		const card = host.querySelector('#card')!
		await act(async () => {
			touch('pointerdown', card)
			await wait(100)
			host.querySelector('#carousel')!.dispatchEvent(new Event('scroll'))
			await wait(LONG_PRESS_MS)
		})
		expect(menu()).not.toBeNull()
	})

	test('a mouse held down is not a long press', async () => {
		await act(async () => root.render(<ContextMenu groups={groups}><div id="card">Card</div></ContextMenu>))
		const card = host.querySelector('#card')!
		await act(async () => {
			touch('pointerdown', card, 40, 50, { pointerType: 'mouse' })
			await wait(LONG_PRESS_MS + 60)
		})
		expect(menu()).toBeNull()
	})

	test('text fields keep their own hold (selection, paste)', async () => {
		let events = 0
		await act(async () => root.render(
			<ContextMenu groups={groups}><div onContextMenu={() => events++}><input aria-label="Name" /></div></ContextMenu>,
		))
		await longPress(host.querySelector('input')!)
		expect(events).toBe(0)
		expect(menu()).toBeNull()
	})

	test('Android: its own contextmenu during the hold opens the menu once, ours never follows', async () => {
		let opens = 0
		await act(async () => root.render(
			<ContextMenu groups={groups} onOpenChange={(open) => { if (open) opens++ }}><div id="card">Card</div></ContextMenu>,
		))
		const card = host.querySelector('#card')!
		await act(async () => {
			touch('pointerdown', card)
			await wait(LONG_PRESS_MS - 100)
			card.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 40, clientY: 50 }))
			await wait(200)
		})
		expect(opens).toBe(1)
		expect(menu()).not.toBeNull()
	})

	test('Android: its contextmenu arriving after ours is swallowed', async () => {
		let opens = 0
		await act(async () => root.render(
			<ContextMenu groups={groups} onOpenChange={(open) => { if (open) opens++ }}><div id="card">Card</div></ContextMenu>,
		))
		const card = host.querySelector('#card')!
		await longPress(card, { lift: false })
		const late = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 40, clientY: 50 })
		await act(async () => { card.dispatchEvent(late) })
		expect(late.defaultPrevented).toBe(true)
		// Swallowed before the open wrapper's document listener could re-anchor the menu.
		expect(opens).toBe(1)
	})

	test('a long press with no menu behind it leaves the tap and the platform alone', async () => {
		let clicks = 0
		await act(async () => root.render(
			<div>
				<ContextMenu groups={groups}><span>menu here</span></ContextMenu>
				<p id="text" onClick={() => clicks++}>Plain text</p>
			</div>,
		))
		const text = host.querySelector('#text')!
		await longPress(text)
		expect(menu()).toBeNull()
		expect(clicks).toBe(1)
	})

	test('our event stops before document listeners (an app-wide fallback menu)', async () => {
		const seen: boolean[] = []
		const fallback = (event: MouseEvent) => seen.push(isLongPressContextMenu(event))
		document.addEventListener('contextmenu', fallback)
		try {
			await act(async () => root.render(
				<div>
					<ContextMenu groups={groups}><span>menu here</span></ContextMenu>
					<p id="text">Plain text</p>
				</div>,
			))
			await longPress(host.querySelector('#text')!)
			expect(seen).toEqual([])
			// A real right-click still reaches it.
			host.querySelector('#text')!.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }))
			expect(seen).toEqual([false])
		} finally {
			document.removeEventListener('contextmenu', fallback)
		}
	})

	test('useContextMenu gets the long press through a plain onContextMenu', async () => {
		function Controlled() {
			const m = useContextMenu()
			return (
				<>
					<div id="row" onContextMenu={m.open}>Row</div>
					<ContextMenu {...m.props} groups={groups} />
				</>
			)
		}
		await act(async () => root.render(<Controlled />))
		await longPress(host.querySelector('#row')!)
		expect(menu()).not.toBeNull()
	})

	test('selection is held off on a target only during the hold', async () => {
		await act(async () => root.render(<ContextMenu groups={groups}><div id="card">Card</div></ContextMenu>))
		const wrapper = host.querySelector<HTMLElement>('[data-context-menu-target]')!
		const card = host.querySelector('#card')!
		await act(async () => { touch('pointerdown', card) })
		expect(wrapper.style.getPropertyValue('user-select')).toBe('none')
		await act(async () => { touch('pointerup', card) })
		expect(wrapper.style.getPropertyValue('user-select')).toBe('')
	})

	test('a target the wrapper turns away keeps its selection', async () => {
		await act(async () => root.render(
			<ContextMenu groups={groups} shouldOpen={(t) => !t.closest('[data-skip]')}><p data-skip="">Copy me</p></ContextMenu>,
		))
		const wrapper = host.querySelector<HTMLElement>('[data-context-menu-target]')!
		await act(async () => { touch('pointerdown', host.querySelector('p')!) })
		expect(wrapper.style.getPropertyValue('user-select')).toBe('')
		await act(async () => { touch('pointerup', host.querySelector('p')!) })
	})
})

describe('phone bottom sheet', () => {
	test('on a phone the menu is a sheet with large rows and the same groups', async () => {
		setPhone(true)
		await act(async () => root.render(<ContextMenu groups={groups}><div id="card">Card</div></ContextMenu>))
		await longPress(host.querySelector('#card')!)
		const sheet = document.querySelector('[data-context-menu-sheet]')!
		expect(sheet).not.toBeNull()
		expect(sheet.querySelector('[role="menu"]')).not.toBeNull()
		const items = [...sheet.querySelectorAll('[role="menuitem"]')]
		expect(items.map((item) => item.textContent)).toEqual(['Open', 'Rename', 'Delete'])
		expect(items[0]!.className).toContain('min-h-12')
		expect(sheet.textContent).toContain('More')
		expect(sheet.querySelectorAll('[role="group"], section').length).toBeGreaterThanOrEqual(2)
	})

	test('an item in the sheet runs and closes it', async () => {
		setPhone(true)
		let renamed = 0
		const g: ContextMenuGroup[] = [{ id: 'a', items: [{ id: 'rename', label: 'Rename', onSelect: () => renamed++ }] }]
		await act(async () => root.render(<ContextMenu groups={g}><div id="card">Card</div></ContextMenu>))
		await longPress(host.querySelector('#card')!)
		const item = document.querySelector<HTMLElement>('[role="menuitem"]')!
		await act(async () => {
			item.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
			item.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }))
			await wait(50)
		})
		expect(renamed).toBe(1)
	})

	test('a hold on the sheet backdrop does not reopen the menu with the backdrop as target', async () => {
		setPhone(true)
		const targets: string[] = []
		await act(async () => root.render(
			<ContextMenu groups={({ target }) => {
				targets.push(target.closest('[data-item]')?.getAttribute('data-item') ?? target.tagName)
				return groups
			}}><div data-item="a" id="card">Card</div></ContextMenu>,
		))
		await longPress(host.querySelector('#card')!, { lift: false })
		await act(async () => { touch('pointerup', host.querySelector('#card')!); await wait(450) })
		const backdrop = document.querySelector('[data-context-menu-backdrop]')!
		expect(backdrop).not.toBeNull()
		await act(async () => {
			touch('pointerdown', backdrop, 200, 40)
			await wait(LONG_PRESS_MS + 60)
		})
		expect(targets).toEqual(['a'])
		// Android's own event on the backdrop does not reopen it either.
		await act(async () => { backdrop.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 200, clientY: 40 })) })
		expect(targets).toEqual(['a'])
		await act(async () => { touch('pointerup', backdrop, 200, 40) })
	})

	test('presentation forces the sheet on a desktop, or the panel on a phone', async () => {
		await act(async () => root.render(<ContextMenu groups={groups} presentation="sheet"><div id="card">Card</div></ContextMenu>))
		const card = host.querySelector('#card')!
		await act(async () => { card.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true })) })
		expect(document.querySelector('[data-context-menu-sheet]')).not.toBeNull()
		await act(async () => root.unmount())
		document.body.innerHTML = ''
		host = document.createElement('div')
		document.body.append(host)
		root = createRoot(host)
		setPhone(true)
		await act(async () => root.render(<ContextMenu groups={groups} presentation="panel"><div id="card">Card</div></ContextMenu>))
		await act(async () => { host.querySelector('#card')!.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true })) })
		expect(document.querySelector('[data-context-menu-sheet]')).toBeNull()
		expect(menu()).not.toBeNull()
	})

	test('a desktop keeps the cursor panel and its compact rows', async () => {
		await act(async () => root.render(<ContextMenu groups={groups}><div id="card">Card</div></ContextMenu>))
		const card = host.querySelector('#card')!
		await act(async () => { card.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 20 })) })
		expect(document.querySelector('[data-context-menu-sheet]')).toBeNull()
		const item = document.querySelector('[role="menuitem"]')!
		expect(item.className).toContain('min-h-8.5')
		expect(item.className).toContain('text-compact')
		expect(item.className).not.toContain('min-h-12')
	})
})

describe('⋯ button and keyboard', () => {
	test('ContextMenuButton opens its wrapper menu with itself as the target', async () => {
		const targets: string[] = []
		await act(async () => root.render(
			<ContextMenu groups={({ target }) => {
				targets.push(target.closest('[data-item]')?.getAttribute('data-item') ?? '?')
				return groups
			}}>
				<div data-item="a">A <ContextMenuButton aria-label="More for A" /></div>
				<div data-item="b">B <ContextMenuButton aria-label="More for B" /></div>
			</ContextMenu>,
		))
		const button = host.querySelector<HTMLButtonElement>('[aria-label="More for B"]')!
		expect(button.getAttribute('aria-haspopup')).toBe('menu')
		expect(button.className).toContain('hidden')
		expect(button.className).toContain('pointer-coarse:inline-flex')
		await act(async () => { button.click() })
		expect(menu()).not.toBeNull()
		expect(targets).toEqual(['b'])
		expect(button.getAttribute('aria-expanded')).toBe('true')
		expect(host.querySelector('[aria-label="More for A"]')!.getAttribute('aria-expanded')).toBe('false')
	})

	test('touchButton renders one corner ⋯ for a single-item wrapper', async () => {
		await act(async () => root.render(<ContextMenu groups={groups} touchButton="Brand actions"><div>Card</div></ContextMenu>))
		const button = host.querySelector<HTMLButtonElement>('[aria-label="Brand actions"]')!
		expect(button).not.toBeNull()
		expect(host.querySelector('[data-context-menu-target]')!.className).toContain('pointer-coarse:relative')
		await act(async () => { button.click() })
		expect(menu()).not.toBeNull()
	})

	test('ContextMenuButton drives a controlled menu through menu.open', async () => {
		function Controlled() {
			const m = useContextMenu()
			return (
				<>
					<ContextMenuButton onOpen={m.open} isExpanded={m.isOpen} visibility="always" />
					<ContextMenu {...m.props} groups={groups} />
				</>
			)
		}
		await act(async () => root.render(<Controlled />))
		const button = host.querySelector<HTMLButtonElement>('[aria-label="More actions"]')!
		expect(button.className).not.toContain('hidden')
		await act(async () => { button.click() })
		expect(menu()).not.toBeNull()
		expect(button.getAttribute('aria-expanded')).toBe('true')
	})

	test('Shift+F10 and the menu key still open the wrapper menu, with focus in it', async () => {
		await act(async () => root.render(<ContextMenu groups={groups}><button type="button">Card</button></ContextMenu>))
		const card = host.querySelector('button')!
		card.focus()
		await act(async () => { card.dispatchEvent(new KeyboardEvent('keydown', { key: 'F10', shiftKey: true, bubbles: true, cancelable: true })) })
		expect(menu()).not.toBeNull()
		await act(async () => { await wait(20) })
		// RAC `autoFocus` focuses the menu itself; arrows then move through the items.
		expect(menu()!.contains(document.activeElement)).toBe(true)
	})

	test('the menu key opens it too', async () => {
		await act(async () => root.render(<ContextMenu groups={groups}><button type="button">Card</button></ContextMenu>))
		const card = host.querySelector('button')!
		card.focus()
		await act(async () => { card.dispatchEvent(new KeyboardEvent('keydown', { key: 'ContextMenu', bubbles: true, cancelable: true })) })
		expect(menu()).not.toBeNull()
	})
})

describe('controlled menu header and empty state', () => {
	const items = ['Heading', 'Paragraph', 'Image']
	/** A block picker: a search field in the header filters the one group. */
	// The query comes in as a prop: a re-render stands in for typing, which happy-dom
	// does not deliver to React's onChange.
	function Picker({ query = '', onClose = () => {}, headerKeys }: { query?: string; onClose?: () => void; headerKeys?: (event: React.KeyboardEvent) => void }) {
		const shown = items.filter((label) => label.toLowerCase().includes(query.toLowerCase()))
		return (
			<ContextMenu
				isOpen
				position={{ x: 10, y: 20 }}
				onClose={onClose}
				aria-label="Add block"
				header={
					<div onKeyDown={headerKeys}>
						<input aria-label="Search blocks" autoFocus value={query} readOnly />
					</div>
				}
				emptyState="No blocks match"
				groups={[{ id: 'insert', items: shown.map((label) => ({ id: label, label })) }]}
			/>
		)
	}
	const search = () => document.querySelector<HTMLInputElement>('input[aria-label="Search blocks"]')!
	const type = async (query: string) => {
		await act(async () => root.render(<Picker query={query} />))
	}
	const key = async (target: Element, k: string) => {
		await act(async () => { target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })) })
	}

	test('the header sits inside the panel and keeps focus instead of the first item', async () => {
		await act(async () => root.render(<Picker />))
		await act(async () => { await wait(20) })
		const header = document.querySelector('[data-context-menu-panel] [data-context-menu-header]')!
		expect(header.contains(search())).toBe(true)
		// The header comes before the items.
		expect(header.compareDocumentPosition(menu()!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
		expect(document.activeElement).toBe(search())
	})

	test('filtering down to nothing keeps the panel open and fills the live region already in place', async () => {
		await act(async () => root.render(<Picker />))
		// The status region is mounted, empty, while there are results: only a change to
		// a region that is already in the DOM is reliably announced.
		const region = document.querySelector('[data-context-menu-empty]')!
		expect(region.getAttribute('role')).toBe('status')
		expect(region.textContent).toBe('')
		await type('zzz')
		expect(menu()).toBeNull()
		expect(document.querySelector('[data-context-menu-header]')).not.toBeNull()
		expect(document.querySelector('[data-context-menu-empty]')).toBe(region)
		expect(region.textContent).toBe('No blocks match')
		await type('ima')
		expect([...document.querySelectorAll('[role="menuitem"]')].map((item) => item.textContent)).toEqual(['Image'])
		expect(document.querySelector('[data-context-menu-empty]')).toBe(region)
		expect(region.textContent).toBe('')
	})

	test('ArrowUp on the first item goes back to the header field; on a later item it stays in the list', async () => {
		await act(async () => root.render(<Picker />))
		await key(search(), 'ArrowDown')
		const first = document.activeElement!
		expect(first.textContent).toBe('Heading')
		await key(first, 'ArrowUp')
		expect(document.activeElement).toBe(search())
		const items = [...document.querySelectorAll<HTMLElement>('[role="menuitem"]')]
		items[1]!.focus()
		await key(items[1]!, 'ArrowUp')
		expect(document.activeElement).not.toBe(search())
	})

	test('the header stays on top of a scrolled list', async () => {
		await act(async () => root.render(<Picker />))
		const header = document.querySelector('[data-context-menu-header]')!
		// Sticky offsets count from the panel's padding edge: -top-2 cancels its 8px padding.
		expect(header.className.split(' ')).toContain('sticky')
		expect(header.className.split(' ')).toContain('-top-2')
	})

	test('ArrowDown and ArrowUp in the header move to the first and last item', async () => {
		await act(async () => root.render(<Picker />))
		await key(search(), 'ArrowDown')
		expect(document.activeElement?.textContent).toBe('Heading')
		search().focus()
		await key(search(), 'ArrowUp')
		expect(document.activeElement?.textContent).toBe('Image')
	})

	test('a header that handles the arrow itself keeps it', async () => {
		await act(async () => root.render(<Picker headerKeys={(event) => { if (event.key === 'ArrowDown') event.preventDefault() }} />))
		await key(search(), 'ArrowDown')
		expect(document.activeElement).toBe(search())
	})

	test('the phone sheet carries the header too', async () => {
		setPhone(true)
		await act(async () => root.render(<Picker />))
		const sheet = document.querySelector('[data-context-menu-sheet]')!
		expect(sheet.querySelector('[data-context-menu-header] input')).not.toBeNull()
		await type('zzz')
		expect(sheet.querySelector('[data-context-menu-empty]')!.className).toContain('text-body')
	})

	test('an empty state alone shows when nothing is left; without either the menu still renders nothing', async () => {
		await act(async () => root.render(<ContextMenu isOpen position={{ x: 0, y: 0 }} onClose={() => {}} groups={[{ items: [{ id: 'a', label: 'A', hidden: true }] }]} emptyState="Nothing to do" />))
		expect(document.querySelector('[data-context-menu-empty]')!.textContent).toBe('Nothing to do')
		await act(async () => root.render(<ContextMenu isOpen position={{ x: 0, y: 0 }} onClose={() => {}} groups={[{ items: [{ id: 'a', label: 'A', hidden: true }] }]} />))
		expect(document.querySelector('[data-context-menu-panel]')).toBeNull()
	})

	test('a menu without a header still focuses into its items', async () => {
		await act(async () => root.render(<ContextMenu isOpen position={{ x: 0, y: 0 }} onClose={() => {}} groups={groups} />))
		await act(async () => { await wait(20) })
		expect(menu()!.contains(document.activeElement)).toBe(true)
		expect(document.querySelector('[data-context-menu-header]')).toBeNull()
	})

	test('Escape in the header closes the menu', async () => {
		let closed = 0
		await act(async () => root.render(<Picker onClose={() => closed++} />))
		await key(search(), 'Escape')
		expect(closed).toBe(1)
	})
})
