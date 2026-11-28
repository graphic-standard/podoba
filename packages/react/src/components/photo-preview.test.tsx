import { GlobalRegistrator } from '@happy-dom/global-registrator'
GlobalRegistrator.register()
import { afterAll, afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { PhotoPreview } from './photo-preview'
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
afterAll(() => GlobalRegistrator.unregister())

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
})

const src = 'data:image/png;base64,iVBORw0KGgo='
const stage = () => host.querySelector<HTMLElement>('[data-testid="photo-preview"]')!
const key = (name: string) => act(async () => stage().dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true })))
const wheel = (init: WheelEventInit) =>
	act(async () => {
		const event = new WheelEvent('wheel', { bubbles: true, cancelable: true, ...init })
		// happy-dom's WheelEvent drops the modifier keys from its init; set them on the event.
		Object.defineProperty(event, 'ctrlKey', { value: Boolean(init.ctrlKey) })
		Object.defineProperty(event, 'metaKey', { value: Boolean(init.metaKey) })
		stage().dispatchEvent(event)
	})

describe('PhotoPreview', () => {
	test('is a focusable group named by its zoom hint, starting fitted', async () => {
		await act(async () => root.render(<PhotoPreview src={src} name="Court" zoomHint="Zoom with plus and minus" />))
		expect(stage().getAttribute('role')).toBe('group')
		expect(stage().tabIndex).toBe(0)
		expect(stage().getAttribute('aria-label')).toBe('Zoom with plus and minus')
		expect(stage().dataset.fit).toBe('contain')
		expect(host.querySelector('img')?.getAttribute('alt')).toBe('Court')
	})

	test('plus fills the frame; minus and zero fit it again', async () => {
		await act(async () => root.render(<PhotoPreview src={src} name="Court" />))
		await key('+')
		expect(stage().dataset.fit).toBe('cover')
		await key('-')
		expect(stage().dataset.fit).toBe('contain')
		await key('=')
		await key('0')
		expect(stage().dataset.fit).toBe('contain')
	})

	test('the wheel zooms, but leaves browser zoom, sideways scrolling and tiny steps alone', async () => {
		await act(async () => root.render(<PhotoPreview src={src} name="Court" />))
		await wheel({ deltaY: 40, ctrlKey: true })
		expect(stage().dataset.fit).toBe('contain')
		await wheel({ deltaY: 10, deltaX: 80 })
		expect(stage().dataset.fit).toBe('contain')
		await wheel({ deltaY: 2 })
		expect(stage().dataset.fit).toBe('contain')
		await wheel({ deltaY: 40 })
		expect(stage().dataset.fit).toBe('cover')
		await wheel({ deltaY: -2 })
		expect(stage().dataset.fit).toBe('cover')
		await wheel({ deltaY: -40 })
		expect(stage().dataset.fit).toBe('contain')
	})

	test('a wheel that would not change the state scrolls the page', async () => {
		await act(async () => root.render(<PhotoPreview src={src} name="Court" />))
		const up = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: -40 })
		await act(async () => stage().dispatchEvent(up))
		expect(up.defaultPrevented).toBe(false)
		const down = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 40 })
		await act(async () => stage().dispatchEvent(down))
		expect(down.defaultPrevented).toBe(true)
	})

	test('a double-click toggles fill and fit', async () => {
		await act(async () => root.render(<PhotoPreview src={src} name="Court" />))
		const dblclick = () => act(async () => stage().dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true })))
		await dblclick()
		expect(stage().dataset.fit).toBe('cover')
		await dblclick()
		expect(stage().dataset.fit).toBe('contain')
	})

	test('a double-tap toggles fill; a drag between taps does not count', async () => {
		await act(async () => root.render(<PhotoPreview src={src} name="Court" />))
		let time = 1000
		const tapAt = async (x: number, upX = x) => {
			const at = (type: string, clientX: number) => {
				const event = new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, pointerType: 'touch', clientX, clientY: 50, button: 0 })
				Object.defineProperty(event, 'timeStamp', { value: time })
				return event
			}
			await act(async () => stage().dispatchEvent(at('pointerdown', x)))
			await act(async () => stage().dispatchEvent(at('pointerup', upX)))
			time += 100
		}
		await tapAt(50)
		await tapAt(52)
		expect(stage().dataset.fit).toBe('cover')
		time += 1000
		await tapAt(50)
		await tapAt(50, 120)
		expect(stage().dataset.fit).toBe('cover')
	})

	test("a touch double-tap toggles once, even with the browser's dblclick after it", async () => {
		await act(async () => root.render(<PhotoPreview src={src} name="Court" />))
		let time = 1000
		const touch = (type: string) => {
			const event = new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, pointerType: 'touch', clientX: 50, clientY: 50, button: 0 })
			Object.defineProperty(event, 'timeStamp', { value: time })
			return event
		}
		for (let tap = 0; tap < 2; tap++) {
			await act(async () => stage().dispatchEvent(touch('pointerdown')))
			await act(async () => stage().dispatchEvent(touch('pointerup')))
			time += 100
		}
		await act(async () => stage().dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true })))
		expect(stage().dataset.fit).toBe('cover')
	})

	test('a new src starts fitted again', async () => {
		await act(async () => root.render(<PhotoPreview src={src} name="Court" />))
		await key('+')
		expect(stage().dataset.fit).toBe('cover')
		await act(async () => root.render(<PhotoPreview src={`${src}#next`} name="Hall" />))
		expect(stage().dataset.fit).toBe('contain')
	})
})
