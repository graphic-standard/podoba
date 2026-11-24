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

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterAll, afterEach, describe, expect, test } from 'bun:test'

import { AccountButton, AccountDialog, AccountDialogName, AccountPreferenceCard, type AccountDialogProps } from './account-dialog'

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

const labels = { close: 'Close', apps: 'Your apps', preferences: 'Settings', soon: 'Coming soon', signOut: 'Sign out', version: 'Version' }

function render(props: Partial<AccountDialogProps> = {}): void {
	mount(
		<AccountDialog
			isOpen
			onOpenChange={() => {}}
			user={{ name: 'Alex Novak', figure: 'https://example.com/figure.svg', background: '#c7d8c4' }}
			title={<><AccountDialogName>Alex</AccountDialogName>, everything you need</>}
			apps={[
				{ id: 'studio', name: 'Studio', description: 'Work with your brand.', href: 'https://suite.example/studio' },
				{ id: 'sites', name: 'Sites', description: 'Edit your websites.', onPress: () => {}, current: true },
				{ id: 'partners', name: 'Partners', description: 'Clients.', href: 'https://suite.example/partners', lockedLabel: 'Admins only' },
				{ id: 'print', name: 'Print', description: 'Send to print.', soon: true },
			]}
			onSignOut={() => {}}
			labels={labels}
			data-testid="account"
			{...props}
		/>,
	)
}

const dialog = () => document.querySelector<HTMLElement>('[data-testid="account"]')
const card = (name: string) =>
	[...document.querySelectorAll<HTMLElement>('[data-testid="account"] section a, [data-testid="account"] section button')].find((node) =>
		node.textContent?.includes(name),
	)

describe('AccountDialog', () => {
	test('is a dialog named by its greeting', () => {
		render()
		const node = dialog()
		expect(node?.getAttribute('role')).toBe('dialog')
		const heading = document.getElementById(node?.getAttribute('aria-labelledby') ?? '')
		expect(heading?.textContent).toBe('Alex, everything you need')
	})

	test('draws the illustrated hero on the avatar colour, or initials without one', () => {
		render()
		const hero = document.querySelector<HTMLElement>('[data-testid="account-dialog-hero"]')
		expect(hero?.style.backgroundColor).toBeTruthy()
		expect(hero?.querySelector('img')?.getAttribute('src')).toBe('https://example.com/figure.svg')
		act(() => mounted?.root.unmount())
		mounted = null
		document.body.replaceChildren()

		render({ user: { name: 'Alex Novak' } })
		const fallback = document.querySelector<HTMLElement>('[data-testid="account-dialog-hero"]')
		expect(fallback?.querySelector('img')).toBeNull()
		expect(fallback?.textContent).toContain('AN')
	})

	test('an app with an href is a link, one with onPress a button, the current one is marked', () => {
		render()
		expect(card('Studio')?.tagName).toBe('A')
		expect(card('Studio')?.getAttribute('href')).toBe('https://suite.example/studio')
		expect(card('Sites')?.tagName).toBe('BUTTON')
		expect(card('Sites')?.getAttribute('aria-current')).toBe('page')
		expect(card('Studio')?.getAttribute('aria-current')).toBeNull()
	})

	test('a locked or unfinished app is disabled and says why', () => {
		render()
		expect(card('Partners')?.tagName).toBe('BUTTON')
		expect(card('Partners')?.hasAttribute('disabled')).toBe(true)
		expect(card('Partners')?.textContent).toContain('Admins only')
		expect(card('Print')?.hasAttribute('disabled')).toBe(true)
		expect(card('Print')?.textContent).toContain('Coming soon')
		// The reason stays at full ink; only the name, description and artwork soften.
		for (const name of ['Partners', 'Print']) {
			const node = card(name)
			expect(node?.className).not.toContain('opacity-50')
			const badge = [...(node?.querySelectorAll<HTMLElement>('span') ?? [])].find((s) => s.textContent === 'Admins only' || s.textContent === 'Coming soon')
			expect(badge?.closest('.opacity-50')).toBeNull()
			expect([...(node?.querySelectorAll('.opacity-50') ?? [])].some((s) => s.textContent?.includes(name))).toBe(true)
		}
	})

	test('pressing an app runs its action', () => {
		let opened = 0
		render({ apps: [{ id: 'sites', name: 'Sites', description: 'Edit your websites.', onPress: () => opened++ }] })
		act(() => card('Sites')?.click())
		expect(opened).toBe(1)
	})

	test('the close button asks to close', () => {
		const changes: boolean[] = []
		render({ onOpenChange: (open) => changes.push(open) })
		act(() => document.querySelector<HTMLElement>('[aria-label="Close"]')?.click())
		expect(changes).toEqual([false])
	})

	test('footer actions are links or buttons beside sign-out', () => {
		let structure = 0
		let signedOut = 0
		render({
			actions: [
				{ id: 'profile', label: 'Profile and settings', href: 'https://suite.example/profile' },
				{ id: 'schema', label: 'Content structure', onPress: () => structure++ },
			],
			onSignOut: () => signedOut++,
		})
		const link = [...document.querySelectorAll('a')].find((a) => a.textContent === 'Profile and settings')
		expect(link?.getAttribute('href')).toBe('https://suite.example/profile')
		const buttons = [...document.querySelectorAll<HTMLElement>('button')]
		act(() => buttons.find((b) => b.textContent === 'Content structure')?.click())
		act(() => buttons.find((b) => b.textContent === 'Sign out')?.click())
		expect(structure).toBe(1)
		expect(signedOut).toBe(1)
	})

	test('sign-out is disabled while it is in flight', () => {
		render({ isSigningOut: true })
		const signOut = [...document.querySelectorAll<HTMLElement>('button')].find((b) => b.textContent === 'Sign out')
		expect(signOut?.hasAttribute('disabled')).toBe(true)
	})

	test('shows the version and the preferences only when given', () => {
		render()
		expect(dialog()?.textContent).not.toContain('Version')
		expect(dialog()?.textContent).not.toContain('Settings')
		act(() => mounted?.root.unmount())
		mounted = null
		document.body.replaceChildren()

		render({ version: '1.2.3', preferences: <AccountPreferenceCard title="Appearance" hint="Light or dark.">x</AccountPreferenceCard> })
		expect(dialog()?.textContent).toContain('Version 1.2.3')
		expect(dialog()?.textContent).toContain('Settings')
		expect(dialog()?.textContent).toContain('Appearance')
	})

	test('a panel replaces the body and names the dialog', () => {
		render({ panel: <p>Site list</p>, panelTitle: 'Sites' })
		expect(dialog()?.getAttribute('aria-label')).toBe('Sites')
		expect(dialog()?.textContent).toBe('Site list')
	})
})

describe('AccountButton', () => {
	test('is a named button that announces a dialog', () => {
		let pressed = 0
		mount(<AccountButton user={{ name: 'Alex Novak' }} label="Account" onPress={() => pressed++} />)
		const button = document.querySelector<HTMLElement>('[aria-label="Account, Alex Novak"]')
		expect(button?.getAttribute('aria-haspopup')).toBe('dialog')
		act(() => button?.click())
		expect(pressed).toBe(1)
	})
})
