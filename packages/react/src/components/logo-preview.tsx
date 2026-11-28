import { useRef } from 'react'
import { ContextMenu } from './context-menu'
import { detectLogoBackground, type LogoPreviewTone } from './logo-preview-background'

export type LogoPreviewLabels = {
	/** Names the stage and its menu. Default "Logo preview background". */
	background?: string
	/** Default "Light background". */
	light?: string
	/** Default "Dark background". */
	dark?: string
	/** Badge on the current choice. Default "Selected". */
	selected?: string
}

export type LogoPreviewProps = {
	src: string
	/** The logo's alt text. */
	name: string
	/** The stage's surface; the caller draws it (e.g. a light or dark stage behind this). */
	tone: LogoPreviewTone
	onToneChange: (tone: LogoPreviewTone) => void
	onError?: () => void
	/** The logo's natural size, once it has loaded. */
	onDimensions?: (size: { width: number; height: number }) => void
	labels?: LogoPreviewLabels
}

/**
 * A logo on a preview stage with automatic contrast: once the image loads, its visible
 * pixels pick a light or dark surface (`onToneChange`). The stage's context menu (as
 * `ContextMenu` opens it) switches the surface by hand, and after that the
 * automatic pick no longer overrides it. Fills its positioned parent (`absolute inset-0`).
 *
 * The pixels can only be read for a same-origin image or one served with CORS; otherwise
 * the tone stays as given.
 */
export function LogoPreview({ src, name, tone, onToneChange, onError, onDimensions, labels }: LogoPreviewProps) {
	const manual = useRef(false)
	const backgroundLabel = labels?.background ?? 'Logo preview background'
	const selected = labels?.selected ?? 'Selected'
	const choose = (next: LogoPreviewTone) => {
		manual.current = true
		onToneChange(next)
	}
	return (
		<ContextMenu
			className="absolute inset-0 p-10"
			aria-label={backgroundLabel}
			groups={[
				{
					id: 'background',
					items: [
						{ id: 'light', label: labels?.light ?? 'Light background', badge: tone === 'light' ? selected : undefined, onSelect: () => choose('light') },
						{ id: 'dark', label: labels?.dark ?? 'Dark background', badge: tone === 'dark' ? selected : undefined, onSelect: () => choose('dark') },
					],
				},
			]}
		>
			<div
				tabIndex={0}
				role="group"
				aria-label={backgroundLabel}
				className="flex h-full min-h-0 w-full items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-ring"
			>
				<img
					src={src}
					alt={name}
					onLoad={(event) => {
						const image = event.currentTarget
						onDimensions?.({ width: image.naturalWidth, height: image.naturalHeight })
						if (manual.current) return
						const next = detectLogoBackground(image)
						if (next) onToneChange(next)
					}}
					onError={onError}
					className="max-h-[80%] max-w-[80%] object-contain"
				/>
			</div>
		</ContextMenu>
	)
}
