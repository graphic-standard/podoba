import { GlobalRegistrator } from '@happy-dom/global-registrator'
GlobalRegistrator.register()
import { afterAll, afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { LibrarySummaryCard, libraryFileTypeLabel } from './library-summary-card'
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
		const button = host.querySelector<HTMLElement>('button')
		expect(button?.textContent).toContain('No videos yet.')
		await act(async () => button?.click())
		expect(pressed).toBe(1)
	})

	// The button is named by its content, so nothing visible is hidden from a screen reader.
	test('the pressable tile carries no aria-label in any layout', async () => {
		const files = [
			undefined,
			{ name: 'Court', src: png, contentType: 'image/png' },
			{ name: 'Logo', src: svg, contentType: 'image/svg+xml' },
			{ name: 'Schedule', contentType: 'application/pdf', filename: 'schedule.pdf' },
		]
		for (const file of files) {
			await render(<LibrarySummaryCard title="Group" file={file} emptyTitle="Nothing yet." footer="Added today" onPress={() => {}} />)
			const button = host.querySelector('button')
			expect(button?.hasAttribute('aria-label')).toBe(false)
			expect(button?.textContent).toContain('Group')
			expect(button?.textContent).toContain(file ? 'Added today' : 'Nothing yet.')
		}
	})

	test('className lands on the root element in the cover layout too', async () => {
		await render(<LibrarySummaryCard title="Images" className="col-span-2" file={{ name: 'Court', src: png, contentType: 'image/png' }} />)
		expect((host.firstElementChild as HTMLElement).className).toContain('col-span-2')
		await render(<LibrarySummaryCard title="Docs" className="col-span-2" file={{ name: 'Doc', filename: 'doc.pdf' }} />)
		expect((host.firstElementChild as HTMLElement).className).toContain('col-span-2')
	})

	test('a video takes its poster; the cover keeps a fixed dark backdrop', async () => {
		await render(<LibrarySummaryCard title="Videos" file={{ name: 'Clip', src: '/clip.mp4', contentType: 'video/mp4', poster: png }} />)
		expect(host.querySelector('video')?.getAttribute('poster')).toBe(png)
		expect(host.querySelector('[data-library-summary-cover] [aria-hidden="true"]')?.className).toContain('bg-black')
	})

	test('a content type with parameters still picks its layout', async () => {
		await render(<LibrarySummaryCard title="Logos" file={{ name: 'Logo', src: svg, contentType: 'image/SVG+xml; charset=utf-8' }} />)
		expect(host.querySelector('[data-library-summary-cover]')).toBeNull()
		expect(host.querySelector('img')?.className).toContain('object-contain')
	})
})

describe('libraryFileTypeLabel', () => {
	test('prefers the extension, then a short MIME subtype without parameters or suffix', () => {
		expect(libraryFileTypeLabel('report.final.pdf', 'application/pdf')).toBe('PDF')
		expect(libraryFileTypeLabel(undefined, 'text/plain; charset=utf-8')).toBe('PLAIN')
		expect(libraryFileTypeLabel(undefined, 'image/svg+xml')).toBe('SVG')
		expect(libraryFileTypeLabel('archive.', 'application/zip')).toBe('ZIP')
	})

	test('gives undefined for a long vendor subtype or nothing to go on', () => {
		expect(libraryFileTypeLabel(undefined, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBeUndefined()
		expect(libraryFileTypeLabel('README', undefined)).toBeUndefined()
	})
})
