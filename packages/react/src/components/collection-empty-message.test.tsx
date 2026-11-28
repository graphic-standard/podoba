import { GlobalRegistrator } from '@happy-dom/global-registrator'
GlobalRegistrator.register()
import { afterAll, describe, expect, test } from 'bun:test'
import { act, createRef, type ReactElement } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { CollectionEmptyMessage } from './collection-empty-message'
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
afterAll(() => GlobalRegistrator.unregister())

/** Parse the markup so the tests read roles, text and data attributes, not class strings. */
const render = (node: ReactElement) => {
	const host = document.createElement('div')
	host.innerHTML = renderToStaticMarkup(node)
	return host.firstElementChild as HTMLElement
}

describe('CollectionEmptyMessage', () => {
	test('announces the message and the next step, separated by a space', () => {
		const root = render(<CollectionEmptyMessage message="No projects yet." nextStep="Create a project." />)

		expect(root.getAttribute('role')).toBe('status')
		expect(root.textContent).toBe('No projects yet. Create a project.')
		expect(root.querySelector('p span')?.textContent).toBe('Create a project.')
		expect(root.hasAttribute('data-compact')).toBe(false)
	})

	test('compact is a variant, and the message stands alone without a next step', () => {
		const root = render(<CollectionEmptyMessage compact message="Nothing found." />)

		expect(root.hasAttribute('data-compact')).toBe(true)
		expect(root.textContent).toBe('Nothing found.')
		expect(root.querySelector('p span')).toBeNull()
	})

	test('announce={false} drops the live region, and an explicit role wins', () => {
		expect(render(<CollectionEmptyMessage announce={false} message="Empty." />).hasAttribute('role')).toBe(false)
		expect(render(<CollectionEmptyMessage role="note" message="Empty." />).getAttribute('role')).toBe('note')
	})

	test('passes div props through and merges className over its own spacing', () => {
		const root = render(<CollectionEmptyMessage id="empty" aria-describedby="hint" data-testid="empty" className="pt-0" message="Empty." />)

		expect(root.id).toBe('empty')
		expect(root.getAttribute('aria-describedby')).toBe('hint')
		expect(root.getAttribute('data-testid')).toBe('empty')
		expect(root.className.split(' ')).toContain('pt-0')
		expect(root.className.split(' ')).not.toContain('pt-12')
	})

	test('forwards a ref to the root element', async () => {
		const ref = createRef<HTMLDivElement>()
		const host = document.createElement('div')
		const root = createRoot(host)
		await act(async () => root.render(<CollectionEmptyMessage ref={ref} message="Empty." />))

		expect(ref.current?.getAttribute('role')).toBe('status')
		await act(async () => root.unmount())
	})
})
