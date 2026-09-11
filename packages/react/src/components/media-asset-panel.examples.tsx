import { MediaAssetPanel } from './media-asset-panel'
const labels = { heading: 'Assets', emptyDescription: 'No assets yet.', emptyHint: 'Select assets to begin.', selectLabel: 'Select assets', previousLabel: 'Previous asset', nextLabel: 'Next asset' }
const items = ['First', 'Second'].map(id => ({ id, content: <div className="grid h-full place-items-center bg-surface-muted">{id}</div> }))
export const examples = {
	default: () => <MediaAssetPanel {...labels} items={items} mode="media" empty={false} onSelect={() => undefined} />,
	variants: () => <MediaAssetPanel {...labels} items={items} mode="carousel" empty={false} onSelect={() => undefined} />,
	states: () => <MediaAssetPanel {...labels} items={[]} mode="media" empty onSelect={() => undefined} />,
	readOnly: () => <MediaAssetPanel {...labels} items={items} mode="grid" empty={false} />,
	reference: () => <MediaAssetPanel {...labels} items={items.slice(0, 1)} mode="media" empty={false} identity={{ title: 'Annual report', caption: '1 asset reference', count: 1 }} onSelect={() => undefined} />,
}
export const meta = { category: 'Composite', description: 'Asset preview panel with centered empty action and independent carousel controls.' }
