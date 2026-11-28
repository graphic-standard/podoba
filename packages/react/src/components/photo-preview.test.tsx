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

	test('the wheel zooms, but leaves browser zoom and sideways scrolling alone', async () => {
		await act(async () => root.render(<PhotoPreview src={src} name="Court" />))
		await wheel({ deltaY: 40, ctrlKey: true })
		expect(stage().dataset.fit).toBe('contain')
		await wheel({ deltaY: 10, deltaX: 80 })
		expect(stage().dataset.fit).toBe('contain')
		await wheel({ deltaY: 40 })
		expect(stage().dataset.fit).toBe('cover')
		await wheel({ deltaY: -40 })
		expect(stage().dataset.fit).toBe('contain')
	})
})
