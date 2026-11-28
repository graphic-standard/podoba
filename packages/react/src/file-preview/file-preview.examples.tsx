import { strToU8, zipSync } from 'fflate'
import type { ReactNode } from 'react'
import { AssetFilePreview } from './asset-file-preview'
import { type AssetPreviewFetcher, assetPreviewKind } from './document-preview'

// The gallery serves synthetic samples from /preview-samples/. The Word document is built
// here instead of shipped as a binary, and served through `fetcher` (a custom transport).
const pathPrefix = '/preview-samples/'
const w = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'
const paragraphs = ['Club brief (synthetic sample)', 'The summer camp runs for two weeks in July.', 'Formatting and images are left out of this preview; only the text is shown.']
const brief = zipSync({
	'word/document.xml': strToU8(`<w:document ${w}><w:body>${paragraphs.map((text) => `<w:p><w:r><w:t>${text}</w:t></w:r></w:p>`).join('')}</w:body></w:document>`),
})
const withBrief: AssetPreviewFetcher = (input, init) =>
	String(input).endsWith('/brief.docx') ? Promise.resolve(new Response(brief)) : fetch(input, init)

function Frame({ children }: { children: ReactNode }) {
	return <div className="flex h-[420px] w-full items-center justify-center overflow-hidden rounded-lg bg-surface-inverted p-2">{children}</div>
}

function Sample({ name, workerSrc }: { name: string; workerSrc?: string }) {
	const kind = assetPreviewKind(undefined, name)
	// Images have their own viewers (PhotoPreview, LogoPreview).
	if (kind === 'image') return null
	return (
		<Frame>
			<AssetFilePreview source={`${pathPrefix}${name}`} name={name} kind={kind} pathPrefix={pathPrefix} pdfWorkerSrc={workerSrc} fetcher={withBrief} />
		</Frame>
	)
}

export const examples = {
	pdf: (workerSrc: string) => <Sample name="manual.pdf" workerSrc={workerSrc} />,
	office: () => <Sample name="brief.docx" />,
	text: () => <Sample name="notes.txt" />,
	unsupported: () => <Sample name="archive.zip" />,
}
export const meta = {
	category: 'Display',
	description:
		'@podoba/react/file-preview: PDF pages, the text of Office documents, plain text, fonts, audio and video, all in the browser. Needs the optional peers pdfjs-dist and fflate.',
}
