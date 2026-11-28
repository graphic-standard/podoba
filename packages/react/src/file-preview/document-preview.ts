import { Unzip, UnzipInflate } from 'fflate'

/** Largest file the viewers download, and the largest archive they open. */
export const ASSET_PREVIEW_MAX_BYTES = 12 * 1024 * 1024
/** Largest total of decompressed Office XML. */
const EXPANDED_LIMIT = 16 * 1024 * 1024
/** Longest text shown, per file. */
const TEXT_LIMIT = 100_000

export type AssetPreviewKind = 'image' | 'pdf' | 'text' | 'office' | 'video' | 'audio' | 'font' | 'unsupported'

const officeMime =
	/^(?:application\/vnd\.openxmlformats-officedocument\.(?:wordprocessingml\.document|spreadsheetml\.sheet|presentationml\.presentation)|application\/vnd\.oasis\.opendocument\.(?:text|spreadsheet|presentation))$/
const textMime = /^(?:application\/(?:json|xml|javascript|x-javascript|yaml|x-yaml)|application\/[a-z0-9.+-]+\+(?:json|xml))$/
const fontMime = ['application/font-woff', 'application/x-font-ttf', 'application/x-font-opentype', 'application/vnd.ms-opentype']

/** Which viewer a file gets, from its MIME type (parameters ignored) and else its extension. */
export function assetPreviewKind(contentType: string | null | undefined, name: string): AssetPreviewKind {
	const mime = (contentType ?? '').split(';')[0]?.trim().toLowerCase() ?? ''
	const ext = name.toLowerCase().split('.').pop() ?? ''
	if (mime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif', 'bmp', 'ico'].includes(ext)) return 'image'
	if (mime.startsWith('font/') || fontMime.includes(mime) || ['ttf', 'otf', 'woff', 'woff2'].includes(ext)) return 'font'
	if (mime === 'application/pdf' || ext === 'pdf') return 'pdf'
	if (mime.startsWith('video/') || ['mp4', 'webm', 'mov', 'm4v', 'ogv'].includes(ext)) return 'video'
	if (mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(ext)) return 'audio'
	if (['docx', 'xlsx', 'pptx', 'odt', 'ods', 'odp'].includes(ext) || officeMime.test(mime)) return 'office'
	if (mime.startsWith('text/') || textMime.test(mime) || ['txt', 'md', 'markdown', 'csv', 'tsv', 'json', 'xml', 'html', 'htm', 'css', 'js', 'ts', 'yaml', 'yml', 'log'].includes(ext)) return 'text'
	return 'unsupported'
}

export type AssetPreviewFetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

export type AssetPreviewSourceOptions = {
	signal: AbortSignal
	/**
	 * Only URLs whose path starts with this prefix are fetched (e.g. `/media/`). The viewer
	 * sends same-origin cookies, so this keeps a stored or crafted source from reaching an
	 * API endpoint on the same origin.
	 */
	pathPrefix: string
	fetcher?: AssetPreviewFetcher
	/** The page's origin; relative sources resolve against it. Default `window.location.origin`. */
	origin?: string
}

/**
 * Download a file for a viewer, bounded at `ASSET_PREVIEW_MAX_BYTES`. Errors are thrown as
 * `PREVIEW_SOURCE_INVALID` (not http(s), has credentials in the URL, or outside
 * `pathPrefix`), `PREVIEW_UNAVAILABLE` (not ok, or no body) and `PREVIEW_TOO_LARGE`.
 * Credentials go only to the page's own origin, and redirects are refused.
 */
export async function loadAssetPreviewBytes(source: string, { signal, pathPrefix, fetcher = fetch, origin = window.location.origin }: AssetPreviewSourceOptions): Promise<Uint8Array> {
	const url = new URL(source, origin)
	if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || !pathPrefix || !url.pathname.startsWith(pathPrefix)) {
		throw Error('PREVIEW_SOURCE_INVALID')
	}
	const response = await fetcher(url, { credentials: url.origin === origin ? 'same-origin' : 'omit', mode: 'cors', redirect: 'error', signal })
	if (!response.ok || !response.body) throw Error('PREVIEW_UNAVAILABLE')
	const reader = response.body.getReader()
	const chunks: Uint8Array[] = []
	let size = 0
	try {
		if (Number(response.headers.get('content-length')) > ASSET_PREVIEW_MAX_BYTES) throw Error('PREVIEW_TOO_LARGE')
		while (true) {
			const next = await reader.read()
			if (next.done) break
			size += next.value.byteLength
			if (size > ASSET_PREVIEW_MAX_BYTES) throw Error('PREVIEW_TOO_LARGE')
			chunks.push(next.value)
		}
	} finally {
		await reader.cancel().catch(() => {})
	}
	const result = new Uint8Array(size)
	let offset = 0
	for (const chunk of chunks) {
		result.set(chunk, offset)
		offset += chunk.byteLength
	}
	return result
}

export type DocumentPreviewSection = { title: string; text: string }

const xmlParts = /^(?:word\/document\.xml|ppt\/slides\/slide\d+\.xml|xl\/(?:sharedStrings|workbook)\.xml|xl\/worksheets\/sheet\d+\.xml|content\.xml)$/

/**
 * The text of a Word, Excel or PowerPoint file (or an OpenDocument one), section by
 * section: the body, each slide, each sheet (cell by cell, up to 200 rows of 50 cells).
 *
 * Only the content XML parts are decompressed. Macros, images, relationships and external
 * links are never opened, a DOCTYPE or entity declaration is refused, and the archive is
 * bounded: 12 MB in, 16 MB of XML out, 2000 entries, 50 sections, 100,000 characters.
 * Throws `PREVIEW_TOO_LARGE`, `PREVIEW_INVALID`, or `PREVIEW_UNAVAILABLE` when there is no text.
 */
export function officePreviewSections(bytes: Uint8Array): DocumentPreviewSection[] {
	if (bytes.byteLength > ASSET_PREVIEW_MAX_BYTES) throw Error('PREVIEW_TOO_LARGE')
	const parts = new Map<string, string>()
	let total = 0
	let entries = 0
	const unzip = new Unzip((file) => {
		if (++entries > 2000) throw Error('PREVIEW_TOO_LARGE')
		if (!xmlParts.test(file.name)) return
		if ((file.originalSize ?? 0) > EXPANDED_LIMIT || parts.has(file.name)) throw Error('PREVIEW_INVALID')
		const chunks: Uint8Array[] = []
		let length = 0
		file.ondata = (error, chunk, final) => {
			if (error) throw error
			total += chunk.byteLength
			length += chunk.byteLength
			if (total > EXPANDED_LIMIT) {
				file.terminate()
				throw Error('PREVIEW_TOO_LARGE')
			}
			chunks.push(chunk)
			if (final) {
				const value = new Uint8Array(length)
				let at = 0
				for (const data of chunks) {
					value.set(data, at)
					at += data.byteLength
				}
				parts.set(file.name, new TextDecoder().decode(value))
			}
		}
		file.start()
	})
	unzip.register(UnzipInflate)
	for (let at = 0; at < bytes.length; at += 1024) unzip.push(bytes.subarray(at, at + 1024), at + 1024 >= bytes.length)

	const xml = (value: string) => {
		if (/<!DOCTYPE|<!ENTITY/i.test(value)) throw Error('PREVIEW_INVALID')
		const doc = new DOMParser().parseFromString(value, 'application/xml')
		if (doc.getElementsByTagName('parsererror').length) throw Error('PREVIEW_INVALID')
		return doc
	}
	const nodes = (doc: Document | Element, name: string) => [...doc.querySelectorAll('*')].filter((node) => node.localName === name)

	const sections: DocumentPreviewSection[] = []
	const shared = parts.get('xl/sharedStrings.xml')
	const strings = shared ? nodes(xml(shared), 'si').map((node) => nodes(node, 't').map((t) => t.textContent).join('')) : []
	const workbook = parts.get('xl/workbook.xml')
	const sheetNames = workbook ? nodes(xml(workbook), 'sheet').map((node) => node.getAttribute('name') ?? '') : []
	let remaining = TEXT_LIMIT
	for (const [path, value] of [...parts].sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))) {
		if (path === 'xl/sharedStrings.xml' || path === 'xl/workbook.xml' || remaining <= 0 || sections.length >= 50) continue
		const doc = xml(value)
		let text: string
		let title = ''
		if (path.startsWith('xl/worksheets/')) {
			const index = Number(path.match(/sheet(\d+)/)?.[1] ?? 1) - 1
			title = sheetNames[index] ?? String(index + 1)
			text = nodes(doc, 'row')
				.slice(0, 200)
				.map((row) =>
					nodes(row, 'c')
						.slice(0, 50)
						.map((cell) => {
							const raw = nodes(cell, 'v')[0]?.textContent ?? nodes(cell, 't').map((t) => t.textContent).join('')
							return `${cell.getAttribute('r') ?? ''}: ${cell.getAttribute('t') === 's' ? (strings[Number(raw)] ?? '') : raw}`
						})
						.join('\t'),
				)
				.join('\n')
		} else {
			text = nodes(doc, 'p')
				.map((p) => (path.startsWith('word/') || path.startsWith('ppt/') ? nodes(p, 't').map((t) => t.textContent).join('') : (p.textContent ?? '')))
				.join('\n')
			if (path.startsWith('ppt/')) title = path.match(/slide(\d+)/)?.[1] ?? ''
		}
		sections.push({ title, text: text.slice(0, remaining) })
		remaining -= text.length
	}
	if (!sections.some((section) => section.text.trim())) throw Error('PREVIEW_UNAVAILABLE')
	return sections
}

/** Text from a file: UTF-8, or UTF-16 by its byte order mark, cut at 100,000 characters. A NUL byte means binary and throws `PREVIEW_INVALID`. */
export function decodePreviewText(bytes: Uint8Array): string {
	const encoding = bytes[0] === 0xff && bytes[1] === 0xfe ? 'utf-16le' : bytes[0] === 0xfe && bytes[1] === 0xff ? 'utf-16be' : 'utf-8'
	const text = new TextDecoder(encoding).decode(bytes)
	if (text.includes('\0')) throw Error('PREVIEW_INVALID')
	return text.slice(0, TEXT_LIMIT)
}
