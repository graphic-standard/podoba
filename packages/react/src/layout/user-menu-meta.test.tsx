/// <reference types="bun" />

import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { Menu, MenuItem } from 'react-aria-components'

import { UserMenuMeta } from './topbar'

describe('<UserMenuMeta>', () => {
	const html = renderToStaticMarkup(
		<Menu aria-label="Account">
			<MenuItem id="logout">Log out</MenuItem>
			<UserMenuMeta label="App version">v2026.09.17 · a1b2c3d</UserMenuMeta>
		</Menu>,
	)

	test('renders the text as a labelled, non-interactive section', () => {
		expect(html).toContain('v2026.09.17 · a1b2c3d')
		// the label is announced with the text, but not shown
		expect(html).toContain('<span class="sr-only">App version: </span>')
		// exactly one menu item: the meta line is not an action
		expect(html.match(/role="menuitem"/g)).toHaveLength(1)
	})

	test('uses the muted micro type and stays copyable', () => {
		expect(html).toContain('text-fg-muted')
		expect(html).toContain('text-micro')
		expect(html).toContain('select-text')
	})
})
