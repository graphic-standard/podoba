import { useLayoutEffect, useRef, useState } from 'react'
import { AssetSelectionSurface, AssetSelectionGrid, AssetSelectionEmpty, AssetLibraryPreview } from './asset-selection-surface'
import { Button } from './button'
import { Subtle } from './subtle'
import { SectionTabs } from './section-tabs'

function Example({ linked = false, pending = false, error = false }) {
	const [open, setOpen] = useState(false)
	const [selectedId, setSelectedId] = useState<string | null>('landscape')
	return <>
		<Button onPress={() => setOpen(true)}>Open asset selection</Button>
		<AssetSelectionSurface isOpen={open} onOpenChange={setOpen} closeLabel="Close" isPending={pending}
			title={linked ? <>Review linked assets <Subtle>and add more</Subtle><br />to this <Subtle>project.</Subtle></> : <>Choose assets <Subtle>from storage</Subtle><br />and add them to <Subtle>this project.</Subtle></>}
			filters={<SectionTabs active="all" onChange={() => {}} tabs={[{key:'all',label:'All'},{key:'print',label:'Print'}]} />}
			error={error ? 'The selected asset could not be added. Please try again.' : undefined}
			footer={<><Button variant="secondary" isDisabled={pending} onPress={() => setOpen(false)}>Close</Button><Button isDisabled={pending} isPending={pending}>{pending ? 'Adding…' : linked ? 'Add another asset' : 'Add selected asset'}</Button></>}
		>
			{linked ? <AssetSelectionGrid selectedId={selectedId} onSelect={setSelectedId} onContextMenu={() => {}} items={[
				{ id: 'landscape', label: 'Landscape sample', tags: ['Social', 'Campaign'], width: 600, height: 400, preview: <div className="h-full bg-surface-muted" /> },
				{ id: 'portrait', label: 'Portrait sample', tags: ['Print'], width: 400, height: 600, preview: <div className="h-full bg-surface-card" /> },
			]} /> : <AssetSelectionEmpty title="No linked assets yet." description="Add the first asset from storage to start production." />}
		</AssetSelectionSurface>
	</>
}

export const examples = {
	default: () => <Example />,
	variants: () => <Example linked />,
	states: () => <><Example pending /><Example error /></>,
	libraryEmpty: () => <><AssetSelectionEmpty variant="library" title="No assets found" /><AssetSelectionEmpty variant="library" title="No assets found" description="Try removing filters to see more assets" /></>,
	libraryPreviews: () => <div className="grid max-w-3xl grid-cols-3 gap-3">{[1, 1.5, 0.75].map((ratio, index) => <AssetLibraryPreview key={ratio} label={`Preview ${index + 1}`} selected={index === 1} aspectRatio={ratio} tags={index ? ['Campaign', 'Print', 'Approved', 'Archive'] : []} onPress={() => {}}><div className="h-full min-h-[150px] bg-surface-muted" /></AssetLibraryPreview>)}</div>,
}
export const meta = { category: 'Composite', description: 'Scrollable asset selection with pinned filters and confirmation controls.' }
