import { useState, type ReactNode } from 'react'
import { CloseIcon } from './icons'

/**
 * FeatureTile — a full-width media hero tile: a background image with an overlaid
 * eyebrow (top-left), title (bottom-left), an optional action control and a badge.
 * Generic — the common use is a "start here" tutorial banner, but it fits any
 * promo/feature spotlight. Presentational only (hard rule #1): text arrives via props.
 *
 * Pressing the tile either PLAYS an inline video (when `video` is set — the poster
 * image + overlays are replaced by a `<video controls autoPlay>` filling the tile, no
 * modal) or fires `onPress` (e.g. navigate). `action` / `badge` sit ABOVE the press
 * target (z-10) so their own handlers still work. Falls back to a dark surface when no
 * `image` is given.
 */
export interface FeatureTileProps {
	/** Background/poster image URL. Falls back to a dark surface when omitted. */
	image?: string
	imageAlt?: string
	/** When set, pressing the tile plays this video INLINE (no modal). */
	video?: string
	/** Small category label, top-left (e.g. "Tutorial"). */
	eyebrow?: ReactNode
	/** Large title, bottom-left. */
	title: ReactNode
	/** Bottom-left action control (e.g. a round icon button). */
	action?: ReactNode
	/** Bottom-right badge (e.g. a duration pill). */
	badge?: ReactNode
	/** Press behaviour when there is NO `video`. `pressLabel` names it for a11y. */
	onPress?: () => void
	pressLabel?: string
	/** Accessible label for the "stop / back to poster" control while playing. */
	closeLabel?: string
	/** Override the default `aspect-[2/1]` ratio / sizing. */
	className?: string
}

export function FeatureTile({
	image,
	imageAlt,
	video,
	eyebrow,
	title,
	action,
	badge,
	onPress,
	pressLabel,
	closeLabel = 'Close video',
	className,
}: FeatureTileProps) {
	const [playing, setPlaying] = useState(false)
	const hasVideo = Boolean(video)
	const pressable = hasVideo || Boolean(onPress)

	const handlePress = () => {
		if (hasVideo) setPlaying(true)
		else onPress?.()
	}

	return (
		<div
			className={[
				// A large fixed-aspect banner (default ~2:1); media covers it. Override the
				// ratio/size via `className` (e.g. `aspect-[1440/700]`).
				'relative isolate aspect-[2/1] w-full overflow-hidden rounded-lg bg-surface-inverted',
				className,
			]
				.filter(Boolean)
				.join(' ')}
		>
			{playing && video ? (
				<>
					{/* eslint-disable-next-line jsx-a11y/media-has-caption -- caption track is
					    supplied by the consumer via a fuller player when needed. */}
					<video
						src={video}
						poster={image}
						className="absolute inset-0 z-0 h-full w-full bg-black object-cover"
						controls
						autoPlay
						playsInline
					/>
					<button
						type="button"
						aria-label={closeLabel}
						onClick={() => setPlaying(false)}
						className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white outline-none transition-colors hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-white/70"
					>
						<CloseIcon className="h-4 w-4" />
					</button>
				</>
			) : (
				<>
					{image ? (
						<img
							src={image}
							alt={imageAlt ?? ''}
							className="absolute inset-0 h-full w-full object-cover"
						/>
					) : null}
					{/* Legibility scrim — darkens the top + bottom where the text sits. */}
					<div
						aria-hidden="true"
						className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60"
					/>

					{/* Full-bleed press target (behind the content controls). */}
					{pressable ? (
						<button
							type="button"
							onClick={handlePress}
							aria-label={pressLabel}
							className="absolute inset-0 z-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70"
						/>
					) : null}

					{eyebrow ? (
						<span className="pointer-events-none absolute left-6 top-6 z-10 text-compact font-medium text-white">
							{eyebrow}
						</span>
					) : null}

					{/* Content is click-through (pointer-events-none) so pressing the title
					    or badge falls through to the play/press overlay; only `action`
					    re-enables its own pointer events. */}
					<div className="pointer-events-none absolute inset-x-6 bottom-6 z-10 flex flex-col gap-4">
						<h2 className="max-w-md text-display-xl font-medium leading-tight text-white">
							{title}
						</h2>
						<div className="flex items-center justify-between gap-4">
							<span className="pointer-events-auto">{action}</span>
							<span>{badge}</span>
						</div>
					</div>
				</>
			)}
		</div>
	)
}
