import type { ReactNode } from 'react'

/**
 * FeatureTile — a full-width media hero tile: a background image with an overlaid
 * eyebrow (top-left), title (bottom-left), an optional action control and a badge.
 * Generic — the common use is a "start here" tutorial banner, but it fits any
 * promo/feature spotlight. Presentational only (hard rule #1): text arrives via props.
 *
 * The whole tile is pressable via `onPress` (rendered as a full-bleed overlay button
 * labelled by `title`); `action` / `badge` sit ABOVE it (z-10) so their own handlers
 * still work. Falls back to a dark surface when no `image` is given.
 */
export interface FeatureTileProps {
	/** Background image URL. Falls back to a dark surface when omitted. */
	image?: string
	imageAlt?: string
	/** Small category label, top-left (e.g. "Tutorial"). */
	eyebrow?: ReactNode
	/** Large title, bottom-left. */
	title: ReactNode
	/** Bottom-left action control (e.g. a round icon button). */
	action?: ReactNode
	/** Bottom-right badge (e.g. a duration pill). */
	badge?: ReactNode
	/** Makes the whole tile pressable. `pressLabel` names it for assistive tech. */
	onPress?: () => void
	pressLabel?: string
	/** Override the default `aspect-[2/1]` ratio / sizing. */
	className?: string
}

export function FeatureTile({
	image,
	imageAlt,
	eyebrow,
	title,
	action,
	badge,
	onPress,
	pressLabel,
	className,
}: FeatureTileProps) {
	return (
		<div
			className={[
				// A large fixed-aspect banner (default ~2:1); the image covers it. Override
				// the ratio/size via `className` (e.g. `aspect-[1440/700]`). Not tied to the
				// viewport, so it stays a predictable min size rather than reflowing.
				'relative isolate aspect-[2/1] w-full overflow-hidden rounded-lg bg-surface-inverted',
				className,
			]
				.filter(Boolean)
				.join(' ')}
		>
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
			{onPress ? (
				<button
					type="button"
					onClick={onPress}
					aria-label={pressLabel}
					className="absolute inset-0 z-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70"
				/>
			) : null}

			{eyebrow ? (
				<span className="pointer-events-none absolute left-6 top-6 z-10 text-compact font-medium text-white">
					{eyebrow}
				</span>
			) : null}

			<div className="absolute inset-x-6 bottom-6 z-10 flex flex-col gap-4">
				<h2 className="max-w-md text-display-xl font-medium leading-tight text-white">{title}</h2>
				<div className="flex items-center justify-between gap-4">
					<span className="pointer-events-auto">{action}</span>
					<span className="pointer-events-auto">{badge}</span>
				</div>
			</div>
		</div>
	)
}
