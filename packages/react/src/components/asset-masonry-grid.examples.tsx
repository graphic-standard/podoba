import { AssetMasonryGrid } from './asset-masonry-grid'

const cards = [160, 300, 200, 240, 180, 260].map((height, index) => ({ id: String(index), aspectRatio: 1, content: <div className="rounded-lg bg-surface-muted p-4" style={{ height }}>Asset {index + 1}</div> }))
export const examples = {
	default: () => <AssetMasonryGrid items={cards} label="Assets" />,
	variants: () => <div className="max-w-md"><AssetMasonryGrid items={cards} label="Narrow assets" /></div>,
	states: () => <AssetMasonryGrid items={[]} label="Empty assets" />,
}
export const meta = { category: 'Layout', description: 'Measured asset masonry with source responsive widths and shortest-column placement.' }
