import { IconButton } from './icon-button'
import { ChevronLeftIcon, ChevronRightIcon } from './icons'
import { useState, type ReactNode } from 'react'
import { Button as RACButton } from 'react-aria-components'
import { Button } from './button'
import { MediaReadableText, type MediaTextAppearance } from './media-asset-panel'
import { IslandToolbar, IslandToolbarButton } from './island-toolbar'
import { ModalOverlay, ModalSurface, ModalDialog } from './dialog'
import { uic } from '../utils/uic'

export const MediaPreviewScene = uic('div', {
	displayName: 'MediaPreviewScene',
	baseClass: 'relative grid min-h-0 min-w-0 place-items-center overflow-hidden p-5',
	style: {
		background:
			'radial-gradient(circle at 50% 42%, color-mix(in srgb, var(--color-surface) 8%, transparent) 0, transparent 42%), color-mix(in srgb, var(--color-fg) 84%, var(--color-surface))',
	},
})
const Panel = uic(RACButton, {
	displayName: 'MediaPanelCard',
	baseClass:
		'relative isolate flex min-h-60 w-full cursor-pointer flex-col justify-between overflow-hidden rounded-lg bg-surface-card p-5 text-start outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring',
})
/** Asset-dashboard panel composition. Text and crop are measured together. */
export function MediaPanelCard({
	title,
	caption,
	preview,
	onOpen,
	textAppearance,
	titlePosition = 'top',
}: {
	title: string
	caption?: string
	titlePosition?: 'top' | 'bottom'
	textAppearance?: { title?: MediaTextAppearance; caption?: MediaTextAppearance }
	preview: ReactNode
	onOpen: () => void
}) {
	return (
		<Panel onPress={onOpen} aria-label={title} data-media-readability>
			<div aria-hidden="true" className="absolute inset-0 -z-20">
				{preview}
			</div>
			<div className={titlePosition === 'bottom' ? 'mt-auto max-w-full self-start rounded-lg bg-surface px-3 py-2 text-fg' : undefined}>
				<MediaReadableText appearance={titlePosition === 'bottom' ? { color: 'dark', background: 'none' } : textAppearance?.title}>
					<strong className="text-panel-heading font-medium">{title}</strong>
				</MediaReadableText>
			</div>
			{caption ? (
				<MediaReadableText secondary appearance={textAppearance?.caption}>
					<span className="text-label font-normal">{caption}</span>
				</MediaReadableText>
			) : null}
		</Panel>
	)
}
export interface MediaCarouselItem {
	id: string
	title: string
	caption?: string
	preview: ReactNode
}
export function MediaCarousel({
	items,
	label,
	previousLabel,
	nextLabel,
	onOpen,
	imageFit = 'contain',
}: {
	items: readonly MediaCarouselItem[]
	label: string
	previousLabel: string
	nextLabel: string
	onOpen?: (index: number) => void
	/** Only orientation mode crops landscape photographs; diagrams stay contained by default. */
	imageFit?: 'contain' | 'cover' | 'orientation'
}) {
	const [imageRatios, setImageRatios] = useState<Record<string, number>>({})
	const [picked, setPicked] = useState(0),
		index = Math.min(picked, Math.max(0, items.length - 1)),
		item = items[index]
	if (!item) return null
	const cover = imageFit === 'cover' || (imageFit === 'orientation' && (imageRatios[item.id] ?? 0) > 1)
	const go = (next: number) => setPicked(Math.max(0, Math.min(items.length - 1, next)))
	return (
		<div
			role="group"
			data-media-readability
			aria-label={label}
			tabIndex={0}
			className="relative overflow-hidden rounded-lg bg-surface-muted outline-none focus-visible:ring-2 focus-visible:ring-ring"
			onKeyDown={(event) => {
				if (event.key === 'ArrowLeft') {
					event.preventDefault()
					go(index - 1)
				}
				if (event.key === 'ArrowRight') {
					event.preventDefault()
					go(index + 1)
				}
			}}
		>
			<div
				className={`grid aspect-3/2 min-w-0 place-items-center ${cover ? '[&_img]:object-cover' : '[&_img]:object-contain'}`}
				onLoadCapture={(event) => {
					const image = event.target
					if (imageFit !== 'orientation' || !(image instanceof HTMLImageElement) || !image.naturalWidth || !image.naturalHeight) return
					const ratio = image.naturalWidth / image.naturalHeight
					setImageRatios(previous => previous[item.id] === ratio ? previous : { ...previous, [item.id]: ratio })
				}}
			>
				{onOpen ? (
					<Button
						variant="ghost"
						aria-label={item.title}
						onPress={() => onOpen(index)}
						className="h-full min-h-0 w-full p-0 hover:bg-transparent"
					>
						{item.preview}
					</Button>
				) : (
					item.preview
				)}
			</div>
			<div className="pointer-events-none absolute bottom-5 start-5 max-w-3/4 rounded-lg bg-surface p-4 text-fg">
				<div className="text-label font-normal">{item.title}</div>
				{item.caption ? <div className="mt-1 text-caption text-fg-muted">{item.caption}</div> : null}
				<div className="mt-2 text-caption tabular-nums text-fg-muted" aria-live="polite">{index + 1} / {items.length}</div>
			</div>
			{index > 0 ? (
				<IconButton variant="ghost" label={previousLabel} onPress={() => go(index - 1)} className="absolute start-2 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-surface-inverted p-0 text-fg-inverted hover:bg-surface-inverted">
					<ChevronLeftIcon className="size-4" />
				</IconButton>
			) : null}
			{index < items.length - 1 ? (
				<IconButton variant="ghost" label={nextLabel} onPress={() => go(index + 1)} className="absolute end-2 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-surface-inverted p-0 text-fg-inverted hover:bg-surface-inverted">
					<ChevronRightIcon className="size-4" />
				</IconButton>
			) : null}
		</div>
	)
}
export function MediaLightbox({
	isOpen,
	onOpenChange,
	title,
	caption,
	preview,
	index,
	total,
	onPrevious,
	onNext,
	previousLabel,
	nextLabel,
	closeLabel,
}: {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	title: string
	caption?: string
	preview: ReactNode
	index: number
	total: number
	onPrevious: () => void
	onNext: () => void
	previousLabel: string
	nextLabel: string
	closeLabel: string
}) {
	return (
		<ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange} isDismissable>
			<ModalSurface className="h-[90dvh] w-24/25 max-w-360 overflow-hidden p-0">
				<ModalDialog aria-label={title} className="relative h-full outline-none">
					<MediaPreviewScene className="h-full px-6 pb-32 pt-6">{preview}</MediaPreviewScene>
					<div className="absolute bottom-6 start-6 max-w-3/4 rounded-lg bg-surface p-4 text-fg">
						<p className="m-0 text-label text-fg-muted">
							{index + 1} / {total}
						</p>
						<p className="m-0 mt-2 text-panel-heading font-medium">{title}</p>
						{caption ? <p className="m-0 mt-2 text-label">{caption}</p> : null}
					</div>
					<div className="absolute end-6 top-6 flex items-center gap-2">
						{total > 1 ? (
							<IslandToolbar aria-label={title}>
								<IslandToolbarButton
									label={previousLabel}
									icon={<span>‹</span>}
									isDisabled={index === 0}
									onPress={onPrevious}
								/>
								<IslandToolbarButton
									label={nextLabel}
									icon={<span>›</span>}
									isDisabled={index === total - 1}
									onPress={onNext}
								/>
							</IslandToolbar>
						) : null}
						<Button
							variant="ghost"
							className="h-9 w-9 rounded-full bg-surface-inverted p-0 text-fg-inverted"
							aria-label={closeLabel}
							onPress={() => onOpenChange(false)}
						>
							×
						</Button>
					</div>
				</ModalDialog>
			</ModalSurface>
		</ModalOverlay>
	)
}
