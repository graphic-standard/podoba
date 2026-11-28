import { useState } from 'react'
import { LibraryAssetPreview, type LibraryAssetPreviewItem } from './library-asset-preview'
import { LogoPreview } from './logo-preview'
import type { LogoPreviewTone } from './logo-preview-background'
import { PhotoPreview } from './photo-preview'

// Synthetic artwork, inline so the gallery needs no files.
const svg = (body: string, width = 800, height = 600) =>
	`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${body}</svg>`)}`
const photo = svg(
	'<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a7bd5"/><stop offset="1" stop-color="#f7b733"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/><circle cx="560" cy="220" r="90" fill="#fff" opacity=".55"/><rect x="0" y="470" width="800" height="130" fill="#1d2b64" opacity=".6"/>',
)
const darkLogo = svg('<rect x="4" y="4" width="72" height="72" rx="16" fill="#111"/><text x="92" y="52" font-family="sans-serif" font-size="32" font-weight="700" fill="#111">Acme</text>', 200, 80)
const lightLogo = svg('<circle cx="40" cy="40" r="34" fill="#fff"/><text x="92" y="52" font-family="sans-serif" font-size="32" font-weight="700" fill="#fff">Nova</text>', 200, 80)

/** The stage draws the surface the logo asked for. */
function Logo({ src, name }: { src: string; name: string }) {
	const [tone, setTone] = useState<LogoPreviewTone>('light')
	return (
		<div className={`relative h-full w-full rounded-md ${tone === 'dark' ? 'bg-surface-inverted' : 'bg-surface'}`} data-tone={tone}>
			<LogoPreview src={src} name={name} tone={tone} onToneChange={setTone} />
		</div>
	)
}

function Stage() {
	const [index, setIndex] = useState(0)
	const items: LibraryAssetPreviewItem[] = [
		{ id: 'photo', name: 'Court at dusk', preview: <div className="relative h-full w-full"><PhotoPreview src={photo} name="Court at dusk" /></div>, interactivePreview: true },
		{ id: 'dark', name: 'Acme logo', preview: <Logo src={darkLogo} name="Acme logo" />, interactivePreview: true },
		{ id: 'light', name: 'Nova logo', preview: <Logo src={lightLogo} name="Nova logo" />, interactivePreview: true },
	]
	return (
		<div className="h-[420px] w-full rounded-lg bg-surface-inverted p-2">
			<LibraryAssetPreview
				fitArtwork
				items={items}
				activeIndex={index}
				onActiveIndexChange={setIndex}
				ariaLabel="Library files"
				carouselLabel="Files"
				previousLabel="Previous file"
				nextLabel="Next file"
				expandLabel="Expand preview"
				positionLabel={(current, total) => `${current} of ${total}`}
				announcement={(item, current, total) => `${String(item.name)}, ${current} of ${total}`}
			/>
		</div>
	)
}

export const examples = {
	stage: () => <Stage />,
	logos: () => (
		<div className="grid w-full gap-4 md:grid-cols-2">
			<div className="h-56">
				<Logo src={darkLogo} name="Acme logo" />
			</div>
			<div className="h-56">
				<Logo src={lightLogo} name="Nova logo" />
			</div>
		</div>
	),
}
export const meta = {
	category: 'Display',
	description:
		'Library file previews: a stage with a carousel and fullscreen view, a photo that zooms to fill and pans, and a logo that picks a contrasting surface (right click switches it).',
}
