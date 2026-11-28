import { useRef } from 'react'
import { ContextMenu } from './context-menu'
import { detectLogoBackground, type LogoPreviewTone } from './logo-preview-background'

export type LogoPreviewLabels = {
	/** Names the stage, its menu and its touch button. Default "Logo preview background". */
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
	/**
	 * For a logo on another origin (a storage or CDN host): fetch it with CORS so its pixels
	 * can be read for the automatic contrast. Opt-in, because against a server that does not
	 * send CORS headers the image then fails to load.
	 */
	crossOrigin?: 'anonymous' | 'use-credentials'
	labels?: LogoPreviewLabels
}

/**
 * A logo on a preview stage with automatic contrast: once the image loads, its visible
 * pixels pick a light or dark surface (`onToneChange`). The stage's context menu switches
 * the surface by hand (on touch screens also from a visible "⋯" button), and after that
 * the automatic pick no longer overrides it, until `src` changes. Fills its positioned
 * parent (`absolute inset-0`).
 *
 * The pixels can be read only for a same-origin image, or a cross-origin one served with
 * CORS and loaded with `crossOrigin`; otherwise the tone stays as given.
 */
export function LogoPreview(props: LogoPreviewProps) {
	// A new file starts fresh: no manual choice carries over to it.
	return <LogoPreviewStage key={props.src} {...props} />
}

function LogoPreviewStage({ src, name, tone, onToneChange, onError, onDimensions, crossOrigin, labels }: LogoPreviewProps) {
	const manual = useRef(false)
	const backgroundLabel = labels?.background ?? 'Logo preview background'
	const selected = labels?.selected ?? 'Selected'
	const choose = (next: LogoPreviewTone) => {
		manual.current = true
		onToneChange(next)
	}
	return (
		// The wrapper is absolute here, not on ContextMenu: its touch button makes it `relative` on coarse pointers.
		<div className="absolute inset-0">
			<ContextMenu
				className="h-full w-full p-10"
				aria-label={backgroundLabel}
				touchButton={backgroundLabel}
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
						// Before src: the browser may start the request as soon as src is set.
						crossOrigin={crossOrigin}
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
		</div>
	)
}
