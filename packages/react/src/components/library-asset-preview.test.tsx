import { GlobalRegistrator } from '@happy-dom/global-registrator'
GlobalRegistrator.register()
import { afterAll, afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { act, type ReactNode, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { LibraryAssetPreview, type LibraryAssetPreviewItem } from './library-asset-preview'
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
const render = async (node: ReactNode) => act(async () => root.render(node))
const byTestId = (id: string) => document.querySelector<HTMLElement>(`[data-testid="${id}"]`)
const stage = 'library-asset-preview-stage'

const pages = (count: number, extra: Partial<LibraryAssetPreviewItem> = {}): LibraryAssetPreviewItem[] =>
	Array.from({ length: count }, (_, index) => ({ id: String(index), name: `Page ${index + 1}`, preview: <span>page {index + 1}</span>, ...extra }))

function Stage({ items, initial = 0, ...props }: { items: LibraryAssetPreviewItem[]; initial?: number; isLoading?: boolean; error?: ReactNode }) {
	const [index, setIndex] = useState(initial)
	return (
		<LibraryAssetPreview
			{...props}
			items={items}
			activeIndex={index}
			onActiveIndexChange={setIndex}
			ariaLabel="Manual"
			carouselLabel="Document pages"
			previousLabel="Previous page"
			nextLabel="Next page"
			expandLabel="Expand preview"
			positionLabel={(current, total) => `${current} of ${total}`}
			announcement={(item, current, total) => `${String(item.name)}, ${current} of ${total}`}
			loadingLabel="Loading…"
			fullscreenLabels={{ title: 'Fullscreen', close: 'Close it' }}
		/>
	)
}

const press = (element: Element | null) => act(async () => (element as HTMLElement | null)?.click())
const key = (element: Element | null, name: string) =>
	act(async () => element?.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true })))

describe('LibraryAssetPreview', () => {
	test('a single item is not a carousel', async () => {
		await render(<Stage items={pages(1)} />)
		const root = byTestId(stage)
		expect(root?.getAttribute('role')).toBeNull()
		expect(root?.getAttribute('aria-roledescription')).toBeNull()
		expect(byTestId(`${stage}-previous`)).toBeNull()
		expect(host.textContent).toContain('page 1')
	})

	test('several items form a labelled carousel driven by buttons and arrow keys', async () => {
		await render(<Stage items={pages(3)} />)
		const carousel = byTestId(stage)
		expect(carousel?.getAttribute('role')).toBe('group')
		expect(carousel?.getAttribute('aria-roledescription')).toBe('Document pages')
		expect(carousel?.tabIndex).toBe(0)
		expect(host.textContent).toContain('1 of 3')
		expect(byTestId(`${stage}-previous`)?.hasAttribute('disabled')).toBe(true)

		await press(byTestId(`${stage}-next`))
		expect(host.textContent).toContain('page 2')
		expect(host.querySelector('[role="status"]')?.textContent).toBe('Page 2, 2 of 3')

		await key(carousel, 'ArrowRight')
		expect(host.textContent).toContain('3 of 3')
		expect(byTestId(`${stage}-next`)?.hasAttribute('disabled')).toBe(true)
		await key(carousel, 'ArrowRight')
		expect(host.textContent).toContain('3 of 3')

		await key(carousel, 'ArrowLeft')
		expect(host.textContent).toContain('2 of 3')
	})

	test('an arrow key the artwork already handled does not change the item', async () => {
		const panning = <span data-testid="artwork" tabIndex={0} onKeyDown={(event) => event.preventDefault()} />
		await render(<Stage items={pages(2, { preview: panning })} />)
		await key(byTestId('artwork'), 'ArrowRight')
		expect(host.textContent).toContain('1 of 2')
		await key(byTestId(stage), 'ArrowRight')
		expect(host.textContent).toContain('2 of 2')
	})

	test('an out-of-range index is clamped to the items', async () => {
		await render(<Stage items={pages(2)} initial={7} />)
		expect(host.textContent).toContain('2 of 2')
		expect(host.textContent).toContain('page 2')
	})

	test('pressing static artwork, or Enter on it, opens the fullscreen view with the given labels', async () => {
		await render(<Stage items={pages(1)} />)
		const expand = byTestId(`${stage}-expand`)
		expect(expand?.getAttribute('role')).toBe('button')
		expect(expand?.getAttribute('aria-label')).toBe('Expand preview')
		await press(expand)
		const dialog = document.querySelector('[role="dialog"]')
		expect(dialog?.getAttribute('aria-label')).toBe('Fullscreen')
		expect(byTestId('library-preview-fullscreen-node')?.getAttribute('aria-label')).toBe('Page 1')
		expect(document.querySelector('[aria-label="Close it"]')).not.toBeNull()
	})

	test('interactive artwork keeps its own presses; only the corner button expands it', async () => {
		await render(<Stage items={pages(1, { interactivePreview: true })} />)
		const expand = byTestId(`${stage}-expand`)
		expect(expand?.getAttribute('role')).toBeNull()
		await press(expand)
		expect(document.querySelector('[role="dialog"]')).toBeNull()
		await press(document.querySelector(`[data-testid="${stage}-controls"] [aria-label="Expand preview"]`))
		expect(document.querySelector('[role="dialog"]')).not.toBeNull()
	})

	test('an item with a fullscreen image shows it zoomable instead of the preview', async () => {
		await render(<Stage items={pages(1, { fullscreenSrc: 'data:image/png;base64,iVBORw0KGgo=' })} />)
		await press(byTestId(`${stage}-expand`))
		const zoom = document.querySelector('[aria-pressed]')
		expect(zoom?.getAttribute('aria-label')).toBe('Zoom in')
		await press(zoom)
		expect(zoom?.getAttribute('aria-pressed')).toBe('true')
		expect(zoom?.getAttribute('aria-label')).toBe('Zoom out')
	})

	test('loading is announced politely and an error as an alert', async () => {
		await render(<Stage items={pages(1)} isLoading error="Could not load." />)
		expect(byTestId(`${stage}-loading`)?.getAttribute('role')).toBe('status')
		expect(byTestId(`${stage}-loading`)?.textContent).toBe('Loading…')
		expect(byTestId(`${stage}-error`)?.getAttribute('role')).toBe('alert')
	})
})
