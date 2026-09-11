import { MediaGallery } from './media-gallery'

const sample = (label: string) => <div className="grid h-full min-h-24 place-items-center bg-surface-card text-label text-fg">{label}</div>
const items = ['One', 'Two', 'Three', 'Four'].map(label => ({ id: label.toLowerCase(), content: sample(label) }))

export const examples = {
	default: () => <MediaGallery items={items.slice(0, 1)} mode="grid" previousLabel="Previous" nextLabel="Next" className="h-48" />,
	grid: () => <MediaGallery items={items} mode="grid" previousLabel="Previous" nextLabel="Next" className="h-48" />,
	carousel: () => <MediaGallery items={items.slice(0, 3)} mode="carousel" previousLabel="Previous image" nextLabel="Next image" className="h-48" />,
	empty: () => <div className="h-48"><MediaGallery items={[]} mode="grid" previousLabel="Previous" nextLabel="Next" /></div>,
}
export const meta = { category: 'Composite', description: 'Media grid and carousel with consumer-rendered previews. Coarse-pointer controls use 44px targets.' }
