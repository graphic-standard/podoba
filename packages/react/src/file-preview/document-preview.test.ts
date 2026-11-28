import { describe, expect, test } from 'bun:test'
import { ASSET_PREVIEW_MAX_BYTES, type AssetPreviewFetcher, type AssetPreviewKind, assetPreviewKind, decodePreviewText, loadAssetPreviewBytes } from './document-preview'

describe('assetPreviewKind', () => {
	test('picks the viewer from the extension', () => {
		const cases: Record<string, AssetPreviewKind> = {
			'photo.webp': 'image',
			'icon.svg': 'image',
			'readme.pdf': 'pdf',
			'brief.docx': 'office',
			'data.xlsx': 'office',
			'slides.pptx': 'office',
			'notes.odt': 'office',
			'notes.md': 'text',
			'page.html': 'text',
			'clip.mp4': 'video',
			'track.mp3': 'audio',
			'face.woff2': 'font',
			'archive.zip': 'unsupported',
		}
		for (const [name, kind] of Object.entries(cases)) expect(assetPreviewKind(undefined, name)).toBe(kind)
	})

	test('a MIME type wins over a missing extension, parameters ignored', () => {
		expect(assetPreviewKind('font/woff2', 'Typeface')).toBe('font')
		expect(assetPreviewKind('application/pdf', 'Manual')).toBe('pdf')
		expect(assetPreviewKind('Text/Plain; charset=utf-8', 'Notes')).toBe('text')
		expect(assetPreviewKind('application/ld+json', 'Data')).toBe('text')
		expect(assetPreviewKind('application/octet-stream', 'Blob')).toBe('unsupported')
	})
})

describe('decodePreviewText', () => {
	test('keeps markup literal, bounds the length and refuses binary', () => {
		expect(decodePreviewText(new TextEncoder().encode('<script>unsafe()</script>'))).toBe('<script>unsafe()</script>')
		expect(decodePreviewText(new TextEncoder().encode('a'.repeat(110_000)))).toHaveLength(100_000)
		expect(() => decodePreviewText(new Uint8Array([0x61, 0, 0x62]))).toThrow('PREVIEW_INVALID')
	})

	test('reads UTF-16 by its byte order mark', () => {
		expect(decodePreviewText(new Uint8Array([0xff, 0xfe, 0x68, 0, 0x69, 0]))).toBe('hi')
		expect(decodePreviewText(new Uint8Array([0xfe, 0xff, 0, 0x68, 0, 0x69]))).toBe('hi')
	})
})

describe('loadAssetPreviewBytes', () => {
	const origin = 'https://cms.example'
	const signal = new AbortController().signal
	const calls: Array<{ url: string; init?: RequestInit }> = []
	const fetcher: AssetPreviewFetcher = async (input, init) => {
		calls.push({ url: String(input), init })
		return new Response('Hello')
	}
	const load = (source: string, use: AssetPreviewFetcher = fetcher) => loadAssetPreviewBytes(source, { signal, pathPrefix: '/media/', fetcher: use, origin })

	test('resolves a relative source and sends credentials only to the same origin, refusing redirects', async () => {
		calls.length = 0
		expect(decodePreviewText(await load('/media/readme.txt'))).toBe('Hello')
		expect(calls[0]?.url).toBe('https://cms.example/media/readme.txt')
		expect(calls[0]?.init?.credentials).toBe('same-origin')
		expect(calls[0]?.init?.redirect).toBe('error')
		await load('https://storage.example/media/readme.txt')
		expect(calls[1]?.init?.credentials).toBe('omit')
	})

	test('refuses sources outside the prefix, with credentials, or not over http', async () => {
		calls.length = 0
		for (const source of ['javascript:unsafe()', 'data:text/plain,hi', '/rpc/private', '/media/../rpc/private', '/media/%2e%2e/rpc/private', 'https://user:secret@cms.example/media/a.txt']) {
			await expect(load(source)).rejects.toThrow('PREVIEW_SOURCE_INVALID')
		}
		await expect(loadAssetPreviewBytes('/media/a.txt', { signal, pathPrefix: '', fetcher, origin })).rejects.toThrow('PREVIEW_SOURCE_INVALID')
		expect(calls).toHaveLength(0)
	})

	test('bounds the size by the header and while streaming', async () => {
		const declared: AssetPreviewFetcher = async () => new Response('x', { headers: { 'content-length': String(ASSET_PREVIEW_MAX_BYTES + 1) } })
		await expect(load('/media/large.pdf', declared)).rejects.toThrow('PREVIEW_TOO_LARGE')
		const streamed: AssetPreviewFetcher = async () => new Response(new Uint8Array(ASSET_PREVIEW_MAX_BYTES + 1))
		await expect(load('/media/large.pdf', streamed)).rejects.toThrow('PREVIEW_TOO_LARGE')
	})

	test('a failed response is unavailable', async () => {
		await expect(load('/media/gone.txt', async () => new Response('nope', { status: 404 }))).rejects.toThrow('PREVIEW_UNAVAILABLE')
	})
})
