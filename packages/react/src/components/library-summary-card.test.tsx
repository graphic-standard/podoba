import { GlobalRegistrator } from '@happy-dom/global-registrator'
GlobalRegistrator.register()
import { afterAll, afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { LibrarySummaryCard } from './library-summary-card'
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
const render = async (node: ReactNode) => act(async () => root.render(node))
// happy-dom fetches relative image URLs and fires `error`; inline data loads.
const png = 'data:image/png;base64,iVBORw0KGgo='
const svg = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E'

describe('LibrarySummaryCard', () => {
	test('an image fills the tile behind a scrim and names the tile by its title', async () => {
		await render(<LibrarySummaryCard title="Images" file={{ name: 'Court', src: png, contentType: 'image/png' }} footer="2 other files" />)
		expect(host.querySelector('[data-library-summary-cover]')).not.toBeNull()
		const img = host.querySelector('img')
		expect(img?.getAttribute('src')).toBe(png)
		expect(img?.getAttribute('alt')).toBe('')
		expect(img?.className).toContain('object-cover')
		expect(host.textContent).toContain('2 other files')
	})

	test('a video is muted, hidden from assistive tech and does not autoplay', async () => {
		await render(<LibrarySummaryCard title="Videos" file={{ name: 'Clip', src: '/clip.mp4', contentType: 'video/mp4' }} />)
		const video = host.querySelector('video')
		expect(video?.muted).toBe(true)
		expect(video?.getAttribute('aria-hidden')).toBe('true')
		expect(video?.autoplay).toBe(false)
	})

	test('SVG artwork stays whole, inset on the tile', async () => {
		await render(<LibrarySummaryCard title="Logos" file={{ name: 'Logo', src: svg, contentType: 'image/svg+xml' }} />)
		expect(host.querySelector('[data-library-summary-cover]')).toBeNull()
		expect(host.querySelector('img')?.className).toContain('object-contain')
	})

	test('a document shows its title and extension', async () => {
		await render(
			<LibrarySummaryCard title="Documents" file={{ name: 'Schedule', contentType: 'application/pdf', filename: 'schedule.final.pdf' }} fileTitle="Your latest document is Schedule." />,
		)
		expect(host.querySelector('img, video')).toBeNull()
		expect(host.textContent).toContain('Your latest document is Schedule.')
		expect(host.textContent).toContain('PDF')
	})

	test('the centred layout shows only the type, falling back to the MIME subtype and then the label', async () => {
		await render(<LibrarySummaryCard title="Recent" documentLayout="centered" file={{ name: 'Data', contentType: 'text/csv', filename: 'data' }} />)
		expect(host.textContent).toContain('CSV')
		expect(host.textContent).not.toContain('Data')
		await render(<LibrarySummaryCard title="Recent" documentLayout="centered" unknownTypeLabel="Soubor" file={{ name: 'Data' }} />)
		expect(host.textContent).toContain('Soubor')
	})

	test('an image without a src falls back to the document layout', async () => {
		await render(<LibrarySummaryCard title="Images" file={{ name: 'Missing', contentType: 'image/jpeg', filename: 'missing.jpg' }} />)
		expect(host.querySelector('img')).toBeNull()
		expect(host.textContent).toContain('Missing')
		expect(host.textContent).toContain('JPG')
	})

	test('a preview that fails to load shows the unavailable label', async () => {
		await render(<LibrarySummaryCard title="Images" previewUnavailableLabel="No preview" file={{ name: 'Broken', src: '/broken.png', contentType: 'image/png' }} />)
		await act(async () => host.querySelector('img')?.dispatchEvent(new Event('error')))
		expect(host.querySelector('img')).toBeNull()
		expect(host.textContent).toContain('No preview')
	})

	test('without a file it shows the empty title and stays pressable', async () => {
		let pressed = 0
		await render(<LibrarySummaryCard title="Videos" emptyTitle="No videos yet." onPress={() => pressed++} />)
		expect(host.textContent).toContain('No videos yet.')
		const button = host.querySelector<HTMLElement>('[aria-label="Videos"]')
		expect(button).not.toBeNull()
		await act(async () => button?.click())
		expect(pressed).toBe(1)
	})
})
