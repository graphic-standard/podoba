import { type ReactNode, useState } from 'react'
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

/**
 * Fullscreen lightbox for a file or content preview. `Dialog` at `full` size supplies the
 * portal, focus trap, Esc, scroll lock and backdrop; this adds the centred body and a
 * click-to-zoom image (`scale-150`). The zoom resets on close. The entrance and the zoom
 * transition are off under reduced motion.
 */
export function LibraryPreviewFullscreen({ isOpen, onOpenChange, src, previewLabel, children, labels }: LibraryPreviewFullscreenProps) {
	const [isZoomed, setIsZoomed] = useState(false)
	const label = previewLabel ?? 'Content preview'

	const handleOpenChange = (open: boolean) => {
		if (!open) setIsZoomed(false)
		onOpenChange(open)
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
				className="flex min-h-0 flex-1 items-center justify-center overflow-auto motion-safe:animate-lightbox-in motion-reduce:animate-none"
			>
				{src ? (
					<button
						type="button"
						aria-pressed={isZoomed}
						aria-label={isZoomed ? (labels?.zoomOut ?? 'Zoom out') : (labels?.zoomIn ?? 'Zoom in')}
						onClick={() => setIsZoomed((zoomed) => !zoomed)}
						className={`flex max-h-full max-w-full items-center justify-center rounded-md outline-none ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'} focus-visible:ring-2 focus-visible:ring-ring`}
					>
						<img
							data-testid="library-preview-fullscreen-image"
							src={src}
							alt={label}
							className={`max-h-[90vh] max-w-[95vw] object-contain transition-transform duration-200 ease-out motion-reduce:transition-none ${isZoomed ? 'scale-150' : 'scale-100'}`}
						/>
					</button>
				) : (
					<div
						data-testid="library-preview-fullscreen-node"
						role="img"
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
