import { type ReactNode, useState } from 'react'
import { Button } from './button'
import { LibraryPreviewFullscreen, type LibraryPreviewFullscreenLabels } from './library-preview-fullscreen'
import { PreviewControlsContext } from './preview-controls-context'

const CORNER_BUTTON_CLASS = 'h-6 min-w-6 px-2 py-0 text-label leading-none'

// With a carousel, or with interactive artwork, the canvas keeps the bottom row free for
// the corner controls (artwork may portal its own editing controls there).
function canvasClassName(interactive: boolean, hasCarousel: boolean): string {
	if (interactive) return 'box-border flex h-full min-h-0 items-center justify-center overflow-visible pb-12'
	return hasCarousel
		? 'box-border flex h-full min-h-0 items-center justify-center overflow-hidden pb-12'
		: 'flex h-full min-h-0 items-center justify-center overflow-hidden'
}

// Interactive artwork may draw handles past its box and is not itself a focus target, so
// it neither clips nor gets the focus ring of the press-to-expand stage.
function stageClassName(interactive: boolean, hasCarousel: boolean, fitArtwork: boolean): string {
	if (fitArtwork) return 'flex h-full w-full min-h-0 items-center justify-center overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-ring'
	if (interactive) return `flex min-h-0 items-center justify-center overflow-visible ${hasCarousel ? 'h-4/5 max-h-[80%] w-4/5 py-2' : 'h-full w-full'}`
	return hasCarousel
		? 'flex h-4/5 max-h-[80%] w-4/5 min-h-0 items-center justify-center overflow-hidden py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring'
		: 'flex h-full w-full min-h-0 items-center justify-center overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-ring'
}

/** A compact icon button for the stage's corner; the tooltip repeats its label. */
function CornerButton({ label, isDisabled, onPress, testId, children }: { label: string; isDisabled?: boolean; onPress: () => void; testId?: string; children: ReactNode }) {
	return (
		<span title={label}>
			<Button variant="primary" size="sm" className={CORNER_BUTTON_CLASS} aria-label={label} isDisabled={isDisabled} onPress={onPress} data-testid={testId}>
				{children}
			</Button>
		</span>
	)
}

function ExpandIcon() {
	return (
		<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
			<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />
		</svg>
	)
}

export type LibraryAssetPreviewItem = {
	readonly id: string
	/** Read out with the carousel position; a string also names the fullscreen preview. */
	readonly name: ReactNode
	readonly category?: ReactNode
	readonly description?: ReactNode
	readonly preview: ReactNode
	/** An image URL: fullscreen then shows it as a click-to-zoom image instead of `preview`. */
	readonly fullscreenSrc?: string
	/** Interactive artwork owns pointer and keyboard events; only the corner button expands it. */
	readonly interactivePreview?: boolean
}

export type LibraryAssetPreviewProps = {
	/** Fit documents to the whole stage; by default the artwork sits inset. */
	readonly fitArtwork?: boolean
	readonly items: readonly LibraryAssetPreviewItem[]
	readonly activeIndex: number
	readonly onActiveIndexChange: (index: number) => void
	/** The stage's accessible name. */
	readonly ariaLabel: string
	/** `aria-roledescription` of the stage when it is a carousel, e.g. "Document pages". */
	readonly carouselLabel: string
	readonly previousLabel: string
	readonly nextLabel: string
	/** Names the press-to-expand stage and the corner expand button. */
	readonly expandLabel: string
	/** The visible position pill, e.g. `${current} / ${total}`. */
	readonly positionLabel: (current: number, total: number) => ReactNode
	/** Announced when the item changes, e.g. "Manual, page 2 of 5". */
	readonly announcement: (item: LibraryAssetPreviewItem, current: number, total: number) => ReactNode
	/** Shown when there are no items. */
	readonly fallback?: ReactNode
	readonly isLoading?: boolean
	readonly loadingLabel?: ReactNode
	/** An error shown over the stage as an alert. */
	readonly error?: ReactNode
	readonly fullscreenLabels?: LibraryPreviewFullscreenLabels
	readonly testId?: string
}

/**
 * A preview stage for one file or a set of pages: a carousel (arrow keys on the focused
 * stage, previous and next buttons, a position pill, a polite announcement), loading and
 * error states, and a fullscreen view (`LibraryPreviewFullscreen`) from the corner button
 * or by pressing static artwork. The corner row is also a portal target
 * (`PreviewControlsContext`) for controls the artwork brings. Fills its parent's height.
 * `activeIndex` is controlled and clamped to the items.
 */
export function LibraryAssetPreview({
	items,
	activeIndex,
	onActiveIndexChange,
	ariaLabel,
	carouselLabel,
	previousLabel,
	nextLabel,
	expandLabel,
	positionLabel,
	announcement,
	fallback,
	isLoading = false,
	loadingLabel,
	error,
	fullscreenLabels,
	testId = 'library-asset-preview-stage',
	fitArtwork = false,
}: LibraryAssetPreviewProps) {
	const [fullscreenOpen, setFullscreenOpen] = useState(false)
	const [controlsSlot, setControlsSlot] = useState<HTMLDivElement | null>(null)
	const count = items.length
	const safeIndex = count === 0 ? 0 : Math.min(Math.max(0, activeIndex), count - 1)
	const item = items[safeIndex]
	const hasCarousel = count > 1
	const interactive = item?.interactivePreview ?? false
	// Static artwork expands when the stage itself is pressed. Interactive artwork keeps its
	// own clicks and keys, so only the corner expand button opens it.
	const expandsOnPress = item !== undefined && !interactive

	const select = (index: number) => {
		if (count === 0) return
		onActiveIndexChange(Math.min(Math.max(0, index), count - 1))
	}

	return (
		<>
			<PreviewControlsContext.Provider value={controlsSlot}>
				<div
					data-testid={testId}
					className="relative h-full min-h-0 overflow-visible"
					role={hasCarousel ? 'group' : undefined}
					aria-label={ariaLabel}
					aria-roledescription={hasCarousel ? carouselLabel : undefined}
					tabIndex={hasCarousel ? 0 : undefined}
					onKeyDown={(event) => {
						// Artwork that used the key (a zoomed photo panning) keeps it.
						if (event.defaultPrevented) return
						if (event.key === 'ArrowLeft' && safeIndex > 0) {
							event.preventDefault()
							select(safeIndex - 1)
						} else if (event.key === 'ArrowRight' && safeIndex < count - 1) {
							event.preventDefault()
							select(safeIndex + 1)
						}
					}}
				>
					<div className={canvasClassName(interactive, hasCarousel)} data-testid={`${testId}-canvas`}>
						<div
							role={expandsOnPress ? 'button' : undefined}
							tabIndex={expandsOnPress ? 0 : undefined}
							aria-label={expandsOnPress ? expandLabel : undefined}
							onClick={() => {
								if (expandsOnPress) setFullscreenOpen(true)
							}}
							onKeyDown={(event) => {
								if (!expandsOnPress || (event.key !== 'Enter' && event.key !== ' ')) return
								event.preventDefault()
								setFullscreenOpen(true)
							}}
							className={stageClassName(interactive, hasCarousel, fitArtwork)}
							data-testid={`${testId}-expand`}
						>
							{item?.preview ?? fallback}
						</div>
					</div>

					{isLoading ? (
						<div
							className="absolute inset-0 z-10 flex items-center justify-center bg-surface-placeholder/80"
							role="status"
							aria-live="polite"
							data-testid={`${testId}-loading`}
						>
							<span className="text-small text-fg-inverted/70">{loadingLabel}</span>
						</div>
					) : null}

					{item ? (
						<div
							className="pointer-events-none absolute bottom-2 left-2 right-2 z-20 flex flex-wrap-reverse items-center justify-end gap-1.5 [&>*]:pointer-events-auto"
							data-testid={`${testId}-controls`}
						>
							{hasCarousel ? (
								<>
									<span className="sr-only" data-testid={`${testId}-info`}>
										{item.category} {item.name} {item.description}
									</span>
									<CornerButton label={previousLabel} isDisabled={safeIndex === 0} onPress={() => select(safeIndex - 1)} testId={`${testId}-previous`}>
										‹
									</CornerButton>
									<span className="rounded-full bg-brand-primary px-2 py-1 text-label text-fg-inverted">{positionLabel(safeIndex + 1, count)}</span>
									<CornerButton label={nextLabel} isDisabled={safeIndex === count - 1} onPress={() => select(safeIndex + 1)} testId={`${testId}-next`}>
										›
									</CornerButton>
								</>
							) : null}
							{/* Portal target for controls the previewed artwork contributes. */}
							<div ref={setControlsSlot} className="flex items-center gap-1.5 empty:hidden" />
							<CornerButton label={expandLabel} onPress={() => setFullscreenOpen(true)}>
								<ExpandIcon />
							</CornerButton>
						</div>
					) : null}

					{error ? (
						<div
							className="absolute bottom-4 left-4 right-4 z-30 rounded-md border border-danger bg-danger-light px-4 py-3 text-small text-black"
							role="alert"
							data-testid={`${testId}-error`}
						>
							{error}
						</div>
					) : null}

					{item && hasCarousel ? (
						<span className="sr-only" role="status" aria-live="polite">
							{announcement(item, safeIndex + 1, count)}
						</span>
					) : null}
				</div>
			</PreviewControlsContext.Provider>
			{item ? (
				<LibraryPreviewFullscreen
					isOpen={fullscreenOpen}
					onOpenChange={setFullscreenOpen}
					src={item.fullscreenSrc}
					previewLabel={(typeof item.name === 'string' ? item.name : '') || ariaLabel}
					labels={fullscreenLabels}
				>
					{item.fullscreenSrc ? null : item.preview}
				</LibraryPreviewFullscreen>
			) : null}
		</>
	)
}
