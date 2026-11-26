import { GlobalRegistrator } from '@happy-dom/global-registrator'
GlobalRegistrator.register()
import { afterAll, expect, test } from 'bun:test'
import { act } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { ContextMenu, useContextMenu } from './context-menu'
import { isLongPressContextMenu, LONG_PRESS_MS } from './context-menu-touch'
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
afterAll(() => GlobalRegistrator.unregister())

// Full-document SSR (`hydrateRoot(document, …)`) puts React's listeners on `document`.
// The long press must still reach `onContextMenu` there.
test('a long press reaches React handlers when the React root is document itself', async () => {
	document.documentElement.innerHTML = '<head></head><body><div id="row">Row</div></body>'
	let opened = 0
	const fallback: boolean[] = []
	const onDocument = (event: MouseEvent) => fallback.push(isLongPressContextMenu(event))
	function App() {
		const menu = useContextMenu()
		return (
			<html>
				<head></head>
				<body>
					<div id="row" onContextMenu={(event) => { opened++; menu.open(event) }}>Row</div>
					<ContextMenu {...menu.props} groups={[{ id: 'a', items: [{ id: 'open', label: 'Open' }] }]} />
				</body>
			</html>
		)
	}
	let root: ReturnType<typeof hydrateRoot> | undefined
	await act(async () => {
		root = hydrateRoot(document, <App />, { onRecoverableError: () => {} })
	})
	document.addEventListener('contextmenu', onDocument)
	try {
		const row = document.getElementById('row')!
		await act(async () => {
			row.dispatchEvent(new PointerEvent('pointerdown', {
				bubbles: true, cancelable: true, pointerId: 3, pointerType: 'touch', isPrimary: true,
				button: 0, buttons: 1, clientX: 20, clientY: 20, width: 20, height: 20, pressure: 0.5,
			}))
			await new Promise((resolve) => setTimeout(resolve, LONG_PRESS_MS + 60))
		})
		expect(opened).toBe(1)
		expect(document.querySelector('[role="menu"]')).not.toBeNull()
		// Here a document-level fallback does see it, and can tell it is a long press.
		expect(fallback).toEqual([true])
		await act(async () => {
			row.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 3, pointerType: 'touch', isPrimary: true }))
		})
	} finally {
		document.removeEventListener('contextmenu', onDocument)
		await act(async () => root?.unmount())
	}
})
