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
}: {
	title: string
	caption?: string
	textAppearance?: { title?: MediaTextAppearance; caption?: MediaTextAppearance }
	preview: ReactNode
	onOpen: () => void
}) {
	return (
		<Panel onPress={onOpen} aria-label={title} data-media-readability>
			<div aria-hidden="true" className="absolute inset-0 -z-20">
				{preview}
			</div>
			<MediaReadableText appearance={textAppearance?.title}>
				<strong className="text-panel-heading font-medium">{title}</strong>
			</MediaReadableText>
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
}: {
	items: readonly MediaCarouselItem[]
	label: string
	previousLabel: string
	nextLabel: string
	onOpen?: (index: number) => void
}) {
	const [picked, setPicked] = useState(0),
		index = Math.min(picked, Math.max(0, items.length - 1)),
		item = items[index]
	if (!item) return null
	const go = (next: number) => setPicked(Math.max(0, Math.min(items.length - 1, next)))
	return (
		<div
			role="group"
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
			<div className="grid aspect-3/2 min-w-0 place-items-center px-12 py-8">
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
				<p className="m-0 text-label font-normal text-fg-muted">{item.caption ?? label}</p>
				<p className="m-0 mt-2 text-small font-medium">{item.title}</p>
				<p className="m-0 mt-2 text-label text-fg-muted" aria-live="polite">
					{index + 1} / {items.length}
				</p>
			</div>
			{index > 0 ? (
				<Button
					variant="ghost"
					aria-label={previousLabel}
					onPress={() => go(index - 1)}
					className="absolute start-3 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full bg-surface p-0 text-fg-muted shadow-md"
				>
					‹
				</Button>
			) : null}
			{index < items.length - 1 ? (
				<Button
					variant="ghost"
					aria-label={nextLabel}
					onPress={() => go(index + 1)}
					className="absolute end-3 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full bg-surface p-0 text-fg-muted shadow-md"
				>
					›
				</Button>
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
