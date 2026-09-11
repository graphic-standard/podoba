import type { ReactNode } from 'react'
import { Button as AriaButton } from 'react-aria-components'
import { uic } from '../utils/uic'
import { Button } from './button'
import { MediaGallery, type MediaGalleryItem } from './media-gallery'

export const MEDIA_ASSET_PANEL_MODES = ['media', 'grid', 'carousel'] as const
export type MediaAssetPanelMode = (typeof MEDIA_ASSET_PANEL_MODES)[number]
export type MediaAssetPanelProps = {
	items: readonly MediaGalleryItem[]
	mode: MediaAssetPanelMode
	empty: boolean
	heading: ReactNode
	emptyDescription: ReactNode
	emptyHint: ReactNode
	selectLabel: string
	previousLabel: string
	nextLabel: string
	onSelect?: () => void
	/** Optional reference identity; omitted for a media-only gallery. */
	identity?: { title: ReactNode; caption: ReactNode; count: ReactNode }
	className?: string
}
const Surface = uic('div', {
	displayName: 'MediaAssetPanel',
	baseClass: 'group/media-panel relative isolate h-95 w-full shrink-0 overflow-hidden rounded-lg bg-surface-card text-fg',
})
const PanelAction = uic(AriaButton, {
	displayName: 'MediaAssetPanelAction',
	baseClass: 'absolute inset-0 z-10 cursor-pointer rounded-lg border-0 bg-transparent p-0 outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-inset data-[focus-visible]:ring-ring',
})

/** Full-bleed media with independent selection and carousel controls. */
export function MediaAssetPanel({ items, mode, empty, heading, emptyDescription, emptyHint, selectLabel, previousLabel, nextLabel, onSelect, identity, className }: MediaAssetPanelProps) {
	return <Surface className={className}>
		{onSelect ? empty
			? <button type="button" aria-label={selectLabel} aria-hidden="true" tabIndex={-1} onClick={onSelect} className="absolute inset-0 z-10 cursor-pointer rounded-lg border-0 bg-transparent p-0" />
			: <PanelAction aria-label={selectLabel} onPress={onSelect} /> : null}
		{empty ? <>
			<div className="pointer-events-none absolute inset-x-4 top-4 z-20 text-body font-medium leading-5">{heading}</div>
			{onSelect ? <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
				<Button className="pointer-events-auto h-14 w-48 p-0" onPress={onSelect}>{selectLabel}</Button>
			</div> : null}
			<p className="pointer-events-none absolute inset-x-4 bottom-4 z-20 m-0 text-small">
				<span className="font-medium text-fg">{emptyDescription}</span><br />
				<span className="text-fg-muted">{emptyHint}</span>
			</p>
		</> : <MediaGallery items={mode === 'media' ? items.slice(0, 1) : items} mode={mode === 'carousel' ? 'carousel' : 'grid'} previousLabel={previousLabel} nextLabel={nextLabel} className="pointer-events-none" />}
		{!empty && identity ? <>
			<div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-[1] hidden w-[min(56%,34rem)] bg-[linear-gradient(90deg,rgba(0,0,0,0.52)_0%,rgba(0,0,0,0.28)_58%,transparent_100%)] group-has-[img]/media-panel:block" />
			<div className="pointer-events-none absolute inset-4 z-[2] grid grid-rows-[auto_minmax(0,1fr)_auto] gap-6 text-fg group-has-[img]/media-panel:text-white group-has-[img]/media-panel:[text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
				<div className="mb-2 flex items-start justify-between gap-2 text-body font-medium leading-5"><span>{heading}</span><span className="rounded-full bg-surface-muted px-2.5 py-1 text-caption text-fg [text-shadow:none]">{identity.count}</span></div>
				<p className="m-0 max-w-[19ch] pt-2 text-heading1 font-medium leading-[30px]">{identity.title}</p>
				<p className="m-0 text-small opacity-80">{identity.caption}</p>
			</div>
		</> : null}
	</Surface>
}
