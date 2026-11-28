import { type ReactNode, useRef, useState } from 'react'
import { Dialog } from './dialog'

export type LibraryPreviewFullscreenLabels = {
	/** The dialog's accessible name. Default "Preview". */
	title?: string
	/** Default "Close preview". */
	close?: string
	/** The image toggle's label while at 1×. Default "Zoom in". */
	zoomIn?: string
	/** The image toggle's label while zoomed. Default "Zoom out". */
	zoomOut?: string
}

export type LibraryPreviewFullscreenProps = {
	/** Controlled open state; the dialog renders only while open. */
	isOpen: boolean
	/** Fires with `false` on Esc, a click outside, or the close button. */
	onOpenChange: (open: boolean) => void
	/** An image URL, shown as a click-to-zoom image. Without it `children` is shown, centred. */
	src?: string
	/** Accessible name of the image or the preview region. Default "Content preview". */
	previewLabel?: string
	/** The preview to show when there is no `src` (a canvas, a document page, a placeholder). */
	children?: ReactNode
	labels?: LibraryPreviewFullscreenLabels
}

/** How much larger the zoomed image is than the fitted one. */
const ZOOM = 1.5

/**
 * Fullscreen lightbox for a file or content preview. `Dialog` at `full` size supplies the
 * portal, focus trap, Esc, scroll lock and backdrop; this adds the centred body and a
 * click-to-zoom image. Zooming enlarges the image itself (not a transform), and the body
 * centres it only while it fits, so every edge of the zoomed image can be scrolled to,
 * by touch too. The zoom resets on close; the entrance is off under reduced motion.
 *
 * Without `src`, `children` sit in a named group, so interactive previews (a zoomable
 * photo) stay reachable to assistive tech.
 */
export function LibraryPreviewFullscreen({ isOpen, onOpenChange, src, previewLabel, children, labels }: LibraryPreviewFullscreenProps) {
	// null at 1×; zoomed, the width in px measured from the fitted image (if it had one).
	const [zoom, setZoom] = useState<{ width?: number } | null>(null)
	const image = useRef<HTMLImageElement>(null)
	const isZoomed = zoom !== null
	const label = previewLabel ?? 'Content preview'

	const handleOpenChange = (open: boolean) => {
		if (!open) setZoom(null)
		onOpenChange(open)
	}
	const toggleZoom = () => {
		if (isZoomed) return setZoom(null)
		const fitted = image.current?.getBoundingClientRect().width ?? 0
		setZoom(fitted > 0 ? { width: Math.round(fitted * ZOOM) } : {})
	}

	return (
		<Dialog
			size="full"
			isOpen={isOpen}
			onOpenChange={handleOpenChange}
			aria-label={labels?.title ?? 'Preview'}
			closeLabel={labels?.close ?? 'Close preview'}
		>
			<div
				data-testid="library-preview-fullscreen-body"
				// `-safe` centring falls back to the start edge once the zoomed image overflows,
				// so its top and left stay reachable by scrolling.
				className="flex min-h-0 flex-1 items-center-safe justify-center-safe overflow-auto motion-safe:animate-lightbox-in motion-reduce:animate-none"
			>
				{src ? (
					<button
						type="button"
						aria-pressed={isZoomed}
						aria-label={isZoomed ? (labels?.zoomOut ?? 'Zoom out') : (labels?.zoomIn ?? 'Zoom in')}
						onClick={toggleZoom}
						className={`flex shrink-0 items-center justify-center rounded-md outline-none ${isZoomed ? 'cursor-zoom-out' : 'max-h-full max-w-full cursor-zoom-in'} focus-visible:ring-2 focus-visible:ring-ring`}
					>
						<img
							ref={image}
							data-testid="library-preview-fullscreen-image"
							src={src}
							alt={label}
							className={isZoomed ? 'max-h-none max-w-none' : 'max-h-[90vh] max-w-[95vw] object-contain'}
							style={zoom?.width ? { width: zoom.width } : undefined}
						/>
					</button>
				) : (
					<div
						data-testid="library-preview-fullscreen-node"
						role="group"
						aria-label={label}
						className="flex h-full min-h-0 w-full items-center justify-center overflow-hidden"
					>
						{children}
					</div>
				)}
			</div>
		</Dialog>
	)
}
