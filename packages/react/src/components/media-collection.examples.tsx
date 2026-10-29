import { MediaCarousel, MediaPanelCard, MediaPreviewScene } from './media-collection'
const items = [
	{ id: 'a', title: 'Artwork', preview: <div className="h-full w-full bg-brand-green" /> },
	{ id: 'b', title: 'Second artwork', preview: <div className="h-full w-full bg-accent-yellow" /> },
]
export const examples = {
	default: () => <MediaCarousel items={items} label="Artwork" previousLabel="Previous" nextLabel="Next" />,
	variants: () => <MediaPanelCard title="Artwork" caption="Caption" preview={items[0]!.preview} onOpen={() => {}} />,
	states: () => (
		<MediaPreviewScene>
			<MediaCarousel items={items.slice(0, 1)} label="Single artwork" previousLabel="Previous" nextLabel="Next" />
		</MediaPreviewScene>
	),
}
export const meta = {
	category: 'Composite',
	description: 'Asset panels, contained carousel and lightweight media detail.',
}
