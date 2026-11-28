import { GlobalRegistrator } from '@happy-dom/global-registrator'
GlobalRegistrator.register()
import { afterAll, afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { CreateMenuDialog } from './create-menu-dialog'
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
	document.body.innerHTML = ''
})

const dialog = () => document.querySelector<HTMLElement>('[role="dialog"]')

describe('CreateMenuDialog', () => {
	test('is a dialog named by its title, with the menu in a scrolling body', async () => {
		await act(async () =>
			root.render(
				<CreateMenuDialog isOpen onOpenChange={() => {}} title="What do you want to create?" closeLabel="Close">
					<button type="button">New page</button>
				</CreateMenuDialog>,
			),
		)
		const titleId = dialog()!.getAttribute('aria-labelledby')!
		expect(document.getElementById(titleId)!.textContent).toBe('What do you want to create?')
		expect(document.querySelector('[data-create-menu-body]')!.textContent).toBe('New page')
	})

	test('the close button asks to close', async () => {
		const changes: boolean[] = []
		await act(async () =>
			root.render(
				<CreateMenuDialog isOpen onOpenChange={(open) => changes.push(open)} title="Create" closeLabel="Close menu">
					<p>Menu</p>
				</CreateMenuDialog>,
			),
		)
		const close = document.querySelector<HTMLButtonElement>('button[aria-label="Close menu"]')!
		await act(async () => {
			close.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerId: 1, pointerType: 'mouse' }))
			close.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0, pointerId: 1, pointerType: 'mouse' }))
			close.click()
		})
		expect(changes).toContain(false)
	})

	test('the background video is decorative, muted and inline; without the prop there is none', async () => {
		await act(async () =>
			root.render(
				<CreateMenuDialog isOpen onOpenChange={() => {}} title="Create" closeLabel="Close" backgroundVideo="/loop.mp4">
					<p>Menu</p>
				</CreateMenuDialog>,
			),
		)
		const wrapper = document.querySelector('[data-create-menu-video]')!
		const video = wrapper.querySelector('video')!
		expect(wrapper.getAttribute('aria-hidden')).toBe('true')
		expect(wrapper.className).toContain('motion-reduce:hidden')
		expect(video.getAttribute('src')).toBe('/loop.mp4')
		expect(video.muted).toBe(true)
		expect(video.loop).toBe(true)
		expect(video.hasAttribute('playsinline')).toBe(true)
		expect(dialog()!.contains(video)).toBe(false)

		await act(async () =>
			root.render(
				<CreateMenuDialog isOpen onOpenChange={() => {}} title="Create" closeLabel="Close">
					<p>Menu</p>
				</CreateMenuDialog>,
			),
		)
		expect(document.querySelector('video')).toBeNull()
	})

	test('renders nothing while closed', async () => {
		await act(async () =>
			root.render(
				<CreateMenuDialog isOpen={false} onOpenChange={() => {}} title="Create" closeLabel="Close" backgroundVideo="/loop.mp4">
					<p>Menu</p>
				</CreateMenuDialog>,
			),
		)
		expect(dialog()).toBeNull()
		expect(document.querySelector('video')).toBeNull()
	})
})
