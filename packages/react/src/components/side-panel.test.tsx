/// <reference types="bun" />

import { GlobalRegistrator } from '@happy-dom/global-registrator'

GlobalRegistrator.register()
if (typeof globalThis.matchMedia !== 'function') {
	globalThis.matchMedia = (query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addEventListener: () => {},
		removeEventListener: () => {},
		addListener: () => {},
		removeListener: () => {},
		dispatchEvent: () => false,
	})
}

import { act, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterAll, afterEach, describe, expect, test } from 'bun:test'

import { SidePanel } from './side-panel'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

let mounted: { root: Root; host: HTMLElement } | null = null

function mount(node: React.ReactNode): void {
	const host = document.createElement('div')
	document.body.append(host)
	const root = createRoot(host)
	act(() => root.render(node))
	mounted = { root, host }
}

afterEach(() => {
	if (mounted) {
		act(() => mounted?.root.unmount())
		mounted.host.remove()
		mounted = null
	}
	document.body.replaceChildren()
})

afterAll(() => GlobalRegistrator.unregister())

function Harness({
	pending = false,
	onOpenChange,
}: {
	pending?: boolean
	onOpenChange?: (isOpen: boolean) => void
}): React.ReactNode {
	const [open, setOpen] = useState(false)
	const handleOpenChange = (nextOpen: boolean): void => {
		onOpenChange?.(nextOpen)
		setOpen(nextOpen)
	}
	return (
		<>
			<button type="button" data-testid="trigger" onClick={() => setOpen(true)}>
				Open
			</button>
			<SidePanel
				isOpen={open}
				onOpenChange={handleOpenChange}
				title="Assistant"
				description="Acme Robotics"
				closeLabel="Close assistant"
				size="lg"
				isDismissable={!pending}
				data-testid="side-panel"
				footer={<button type="button">Action</button>}
			>
				<p>Conversation</p>
			</SidePanel>
		</>
	)
}

describe('SidePanel', () => {
	test('opens as a labelled dialog with responsive owned-scroll geometry', () => {
		mount(<Harness />)
		const trigger = document.querySelector<HTMLButtonElement>('[data-testid="trigger"]')
		act(() => trigger?.click())

		const dialog = document.querySelector<HTMLElement>('[data-testid="side-panel"]')
		expect(dialog?.getAttribute('role')).toBe('dialog')
		expect(dialog?.textContent).toContain('Assistant')
		expect(dialog?.textContent).toContain('Acme Robotics')
		expect(dialog?.textContent).toContain('Conversation')
		expect(dialog?.querySelector('[aria-label="Close assistant"]')).not.toBeNull()

		const classes = [...document.querySelectorAll<HTMLElement>('[class]')].map(node => node.className)
		expect(classes.some(value => value.includes('h-dvh') && value.includes('sm:max-w-lg'))).toBe(true)
		expect(classes.some(value => value.includes('overflow-y-auto'))).toBe(true)
		expect(classes.some(value => value.includes('motion-reduce:data-[entering]:animate-none'))).toBe(true)
	})

	test('close control requests dismissal through the controlled API', () => {
		const changes: boolean[] = []
		mount(<Harness onOpenChange={isOpen => changes.push(isOpen)} />)
		const trigger = document.querySelector<HTMLButtonElement>('[data-testid="trigger"]')
		trigger?.focus()
		act(() => trigger?.click())

		const close = document.querySelector<HTMLElement>('[aria-label="Close assistant"]')
		act(() => close?.click())

		expect(changes).toEqual([false])
	})
})
