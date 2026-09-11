import { useEffect, useState, type ReactNode, type SyntheticEvent } from 'react'
import { z } from 'zod'

import { Button as AriaButton } from 'react-aria-components'
import { uic } from '../utils/uic'

export const MediaGalleryModeSchema = z.enum(['grid', 'carousel'])
export type MediaGalleryMode = z.infer<typeof MediaGalleryModeSchema>
export type MediaGalleryItem = { id: string; content: ReactNode }
export type MediaGalleryProps = {
	items: readonly MediaGalleryItem[]
	mode: MediaGalleryMode
	previousLabel: string
	nextLabel: string
	className?: string
}

const GalleryRoot = uic('div', {
	baseClass: 'relative block h-full w-full overflow-hidden bg-surface-muted',
	displayName: 'MediaGallery',
})
const itemClass = 'block h-full min-h-0 w-full overflow-hidden [&>img]:block [&>img]:h-full [&>img]:w-full [&>img]:object-cover [&>video]:block [&>video]:h-full [&>video]:w-full [&>video]:object-cover'
const stopParentActivation = (event: SyntheticEvent): void => event.stopPropagation()
const GalleryControl = uic(AriaButton, {
	baseClass: 'pointer-events-auto inline-flex size-10 items-center justify-center rounded-full border-0 bg-surface p-0 text-title leading-none text-fg cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pointer-coarse:size-11',
	displayName: 'MediaGalleryControl',
})

export function MediaGallery({ items, mode, previousLabel, nextLabel, className }: MediaGalleryProps) {
	const firstId = items[0]?.id ?? null
	const [activeId, setActiveId] = useState<string | null>(firstId)
	useEffect(() => {
		setActiveId(current => current && items.some(item => item.id === current) ? current : firstId)
	}, [firstId, items])
	if (items.length === 0) return null
	if (mode === 'grid') {
		const visibleItems = items.slice(0, 4)
		return <GalleryRoot className={['grid gap-0.5', visibleItems.length === 1 ? 'grid-cols-1 grid-rows-1' : visibleItems.length === 2 ? 'grid-cols-2 grid-rows-1' : 'grid-cols-2 grid-rows-2', className].filter(Boolean).join(' ')}>
			{visibleItems.map(item => <div key={item.id} className={itemClass}>{item.content}</div>)}
		</GalleryRoot>
	}
	const activeIndex = Math.max(0, items.findIndex(item => item.id === activeId))
	const activeItem = items[activeIndex] ?? items[0]
	// `items` is non-empty past the early return above, but that does not narrow an
	// indexed access, so make the empty case explicit rather than asserting.
	if (!activeItem) return null
	const selectRelative = (offset: number) => setActiveId(items[(activeIndex + offset + items.length) % items.length]?.id ?? firstId)
	return <GalleryRoot className={className}>
		<div className={itemClass}>{activeItem.content}</div>
		{items.length > 1 ? <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-between p-4">
			<GalleryControl aria-label={previousLabel} onClick={stopParentActivation} onPress={() => selectRelative(-1)}><span aria-hidden="true">‹</span></GalleryControl>
			<GalleryControl aria-label={nextLabel} onClick={stopParentActivation} onPress={() => selectRelative(1)}><span aria-hidden="true">›</span></GalleryControl>
		</div> : null}
	</GalleryRoot>
}
