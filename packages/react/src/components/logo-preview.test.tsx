import { GlobalRegistrator } from '@happy-dom/global-registrator'
GlobalRegistrator.register()
import { afterAll, afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { LogoPreview } from './logo-preview'
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

const logo = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E'

describe('LogoPreview', () => {
	test('crossOrigin is opt-in and set before the source', async () => {
		await act(async () => root.render(<LogoPreview src={logo} name="Acme" tone="light" onToneChange={() => {}} />))
		expect(host.querySelector('img')?.hasAttribute('crossorigin')).toBe(false)
		await act(async () => root.render(<LogoPreview src={`${logo}#cdn`} name="Acme" tone="light" onToneChange={() => {}} crossOrigin="anonymous" />))
		const img = host.querySelector('img')!
		expect(img.getAttribute('crossorigin')).toBe('anonymous')
		const names = img.getAttributeNames()
		expect(names.indexOf('crossorigin')).toBeLessThan(names.indexOf('src'))
	})

	test('a new src mounts a fresh stage, so a manual choice does not carry over', async () => {
		await act(async () => root.render(<LogoPreview src={logo} name="Acme" tone="light" onToneChange={() => {}} />))
		const first = host.querySelector('img')
		await act(async () => root.render(<LogoPreview src={`${logo}#next`} name="Nova" tone="light" onToneChange={() => {}} />))
		expect(host.querySelector('img')).not.toBe(first)
	})

	test('the stage is named by the background label and fills its parent', async () => {
		await act(async () => root.render(<LogoPreview src={logo} name="Acme" tone="dark" onToneChange={() => {}} labels={{ background: 'Pozadí' }} />))
		expect(host.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Pozadí')
		expect((host.firstElementChild as HTMLElement).className).toContain('absolute inset-0')
	})
})
