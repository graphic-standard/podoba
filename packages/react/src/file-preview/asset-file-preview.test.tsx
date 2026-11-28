import { GlobalRegistrator } from '@happy-dom/global-registrator'
GlobalRegistrator.register()
import { afterAll, afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { AssetFilePreview } from './asset-file-preview'
import type { AssetPreviewFetcher } from './document-preview'
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
const settle = () => act(async () => new Promise((resolve) => setTimeout(resolve, 0)))

const serving =
	(body: string, calls: string[] = []): AssetPreviewFetcher =>
	async (input) => {
		calls.push(String(input))
		return new Response(body)
	}

describe('AssetFilePreview', () => {
	test('text is shown as text, with the text-only note', async () => {
		await render(<AssetFilePreview source="/media/notes.txt" name="Notes" kind="text" pathPrefix="/media/" fetcher={serving('Hello, *world*')} />)
		await settle()
		const region = host.querySelector('section[aria-label="Notes"]')
		expect(region?.querySelector('pre')?.textContent).toBe('Hello, *world*')
		expect(region?.textContent).toContain('Text preview')
	})

	test('an inline fetcher does not refetch on every render', async () => {
		const calls: string[] = []
		await render(<AssetFilePreview source="/media/notes.txt" name="Notes" kind="text" pathPrefix="/media/" fetcher={serving('Hi', calls)} />)
		await settle()
		await render(<AssetFilePreview source="/media/notes.txt" name="Notes" kind="text" pathPrefix="/media/" fetcher={serving('Hi', calls)} />)
		await settle()
		expect(calls).toHaveLength(1)
	})

	test('a source outside the prefix is never fetched and shows the error with a retry', async () => {
		const calls: string[] = []
		await render(<AssetFilePreview source="/api/secret" name="Notes" kind="text" pathPrefix="/media/" fetcher={serving('x', calls)} labels={{ retry: 'Again' }} />)
		await settle()
		expect(calls).toHaveLength(0)
		expect(host.querySelector('[role="status"]')?.textContent).toContain('Could not display this file')
		expect(host.querySelector('button')?.textContent).toBe('Again')
	})

	test('retry fetches again', async () => {
		let attempts = 0
		const flaky: AssetPreviewFetcher = async () => (++attempts === 1 ? new Response('', { status: 503 }) : new Response('Back'))
		await render(<AssetFilePreview source="/media/notes.txt" name="Notes" kind="text" pathPrefix="/media/" fetcher={flaky} />)
		await settle()
		await act(async () => host.querySelector('button')?.click())
		await settle()
		expect(attempts).toBe(2)
		expect(host.querySelector('pre')?.textContent).toBe('Back')
	})

	test('a PDF without a worker URL is unavailable, not fetched', async () => {
		const calls: string[] = []
		await render(<AssetFilePreview source="/media/manual.pdf" name="Manual" kind="pdf" pathPrefix="/media/" fetcher={serving('x', calls)} />)
		await settle()
		expect(calls).toHaveLength(0)
		expect(host.textContent).toContain('Could not display this file')
	})

	test('a file that is not a PDF is refused before pdf.js sees it', async () => {
		await render(<AssetFilePreview source="/media/fake.pdf" name="Fake" kind="pdf" pathPrefix="/media/" pdfWorkerSrc="/worker.mjs" fetcher={serving('plain text')} />)
		await settle()
		expect(host.textContent).toContain('Could not display this file')
	})

	test('an unsupported file says so, with no retry', async () => {
		await render(<AssetFilePreview source="/media/a.zip" name="Archive" kind="unsupported" pathPrefix="/media/" labels={{ downloadHint: 'Use Download.' }} />)
		expect(host.textContent).toContain('A preview is not available for this file format.')
		expect(host.textContent).toContain('Use Download.')
		expect(host.querySelector('button')).toBeNull()
	})

	test('video and audio play from the source without a download', async () => {
		const calls: string[] = []
		await render(<AssetFilePreview source="/media/clip.mp4" name="Clip" kind="video" pathPrefix="/media/" fetcher={serving('x', calls)} />)
		expect(host.querySelector('video')?.getAttribute('aria-label')).toBe('Clip')
		await render(<AssetFilePreview source="/media/track.mp3" name="Track" kind="audio" pathPrefix="/media/" fetcher={serving('x', calls)} labels={{ audio: { play: 'Hrát', pause: 'Pauza', position: 'Pozice', volume: 'Hlasitost' } }} />)
		expect(host.querySelector('button')?.getAttribute('aria-label') ?? host.querySelector('button')?.textContent).toContain('Hrát')
		expect(calls).toHaveLength(0)
	})
})
