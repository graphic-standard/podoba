import { useState, type ReactElement, type ReactNode, cloneElement, isValidElement } from 'react'
import { CloseIcon } from './icons'

/**
 * Tile — the ONE dashboard card (the single source of tile "inner"). Every tile in
 * the product is a `<Tile>`: they all share the same inner spec — 16px padding, 24px
 * section gap, 8px radius, `overflow-hidden` — and a common slot set. A given tile
 * just uses the SUBSET of slots it needs (port of gs-platform `Tile` +
 * `DashboardContentCard`, matched 1:1).
 *
 * Slots (all optional):
 * - `eyebrow` (+ `badge`) — the small label row at the top (gs heading-5).
 * - `title` — the big headline / value (gs heading-1). `titleAlign` places it
 *   top (default) or centred; `subtleTitle` mutes its colour.
 * - `text` — supporting copy under the title (gs 14px).
 * - `image` — a side preview in the RIGHT half of the content band.
 * - `footer` — the bottom band.
 * - `backgroundImage` / `video` — turn the tile into a full-bleed MEDIA HERO
 *   (image, or click-to-play inline video); `eyebrow`/`title`/`footer`/`badge`
 *   become overlays. No modal.
 * - `children` — an escape hatch for the content band (lists, infographics). When
 *   present it REPLACES title/text/image.
 *
 * Clickable: pass a router `<Link/>` as `link` (whole tile becomes a real anchor —
 * cmd/middle-click, new tab) or an `onPress` handler (button). Router-agnostic (hard
 * rule #1 — podoba never imports a router). Presentational only: copy via props.
 */
export type TileTheme = 'light' | 'dark' | 'teal' | 'yellow'
export type TileAlign = 'top' | 'center'

const THEME: Record<TileTheme, string> = {
	// Light tiles carry a visible hairline; dark/colored use a transparent border so
	// every tile keeps the same box size (no 1px shift between themes).
	light: 'border border-border bg-surface-card text-fg',
	dark: 'border border-transparent bg-surface-inverted text-white',
	teal: 'border border-transparent bg-brand-secondary text-fg',
	yellow: 'border border-transparent bg-accent-yellow text-fg',
}

// The shared inner for EVERY tile (gs `DashboardContentCard`): 16px padding
// (`--spacing-4`), 24px section gap, 8px radius, clip overflow. `h-full` fills the
// grid cell; `min-h` floors it.
const baseSurface = 'flex h-full min-h-[200px] flex-col gap-6 overflow-hidden rounded-lg p-4'

/** Hover-lift + focus ring applied only when the tile is interactive. */
const interactive =
	'no-underline outline-none transition-[transform,box-shadow] duration-150 ' +
	'hover:-translate-y-1 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring'

export type TileProps = {
	/** Surface theme (gs's Figma palette). */
	theme?: TileTheme
	/** Small label row at the top (gs eyebrow / heading-5). */
	eyebrow?: ReactNode
	/** @deprecated alias for `eyebrow`. */
	head?: ReactNode
	/** Status pill shown next to the eyebrow. */
	badge?: ReactNode
	/** Big headline / value (gs heading-1). */
	title?: ReactNode
	/** Vertical placement of `title` in the content band (default `top`). */
	titleAlign?: TileAlign
	/** Mute the `title` colour (a descriptive title, not a hero count). */
	subtleTitle?: boolean
	/** Supporting text under the title (gs 14px). */
	text?: ReactNode
	/** Footer band (links, meta, actions). */
	footer?: ReactNode
	/** @deprecated alias for `footer`. */
	tail?: ReactNode
	/** A side preview element in the right half of the content band. */
	image?: ReactNode
	/**
	 * Custom content band — escape hatch for lists / infographics. When present it
	 * REPLACES `title`/`text`/`image`.
	 */
	children?: ReactNode
	/** Full-bleed background image → the tile becomes a media hero. */
	backgroundImage?: string
	imageAlt?: string
	/** When set (media hero), pressing the tile plays this video INLINE (no modal). */
	video?: string
	/** Accessible label for the "stop / back to poster" control while playing. */
	closeLabel?: string
	/** A link ELEMENT to render the whole tile as (e.g. a router `<Link/>`). */
	link?: ReactElement
	/** A whole-tile press handler (renders a button). `pressLabel` names it for a11y. */
	onPress?: () => void
	pressLabel?: string
	className?: string
	'aria-label'?: string
}

/** The big "stat" content typography (gs heading-1: 28px / 500 / tight). */
export const tileStatClass = 'text-display font-medium leading-[30px] tracking-wide'

function titleTone(theme: TileTheme, subtle: boolean): string {
	if (theme === 'dark') return subtle ? 'text-white/60' : 'text-white'
	return subtle ? 'text-fg-muted' : 'text-fg'
}

/** head / content / tail bands — the normal (non-media) layout. */
function TileBands({
	theme,
	eyebrow,
	badge,
	title,
	titleAlign = 'top',
	subtleTitle = false,
	text,
	footer,
	image,
	children,
}: Pick<
	TileProps,
	'theme' | 'eyebrow' | 'badge' | 'title' | 'titleAlign' | 'subtleTitle' | 'text' | 'footer' | 'image' | 'children'
> & { theme: TileTheme }) {
	const titleNode =
		title != null ? (
			<p className={`${tileStatClass} ${theme === 'dark' ? 'tracking-normal' : 'tracking-wide'} ${titleTone(theme, subtleTitle)}`}>
				{title}
			</p>
		) : null
	const textNode =
		text != null ? (
			<p className={`text-small leading-4 ${theme === 'dark' ? 'text-white/60' : 'text-fg-muted'} ${title != null ? 'mt-3' : ''}`}>
				{text}
			</p>
		) : null

	// Content band: custom children win; else a right-side image → two columns; else
	// the title/text stack (top or vertically centred).
	let content: ReactNode
	if (children != null) {
		content = <div className="flex min-h-0 flex-1 flex-col items-start">{children}</div>
	} else if (image != null) {
		content = (
			<div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-[minmax(0,1fr)] gap-4">
				<div className="flex min-h-0 min-w-0 flex-col">
					{titleNode}
					{textNode}
				</div>
				<div className="flex min-h-0 items-end justify-end">{image}</div>
			</div>
		)
	} else {
		content = (
			<div className={`flex min-h-0 flex-1 flex-col ${titleAlign === 'center' ? 'justify-center' : ''}`}>
				{titleNode}
				{textNode}
			</div>
		)
	}

	return (
		<>
			{eyebrow != null || badge != null ? (
				<div className="flex items-center gap-3 text-body font-medium leading-5">
					{eyebrow}
					{badge}
				</div>
			) : null}
			{content}
			{footer != null ? <div className="min-w-0">{footer}</div> : null}
		</>
	)
}

/** Full-bleed media hero (background image, or click-to-play inline video). */
function MediaHero({
	backgroundImage,
	imageAlt,
	video,
	eyebrow,
	title,
	footer,
	badge,
	onPress,
	pressLabel,
	closeLabel = 'Close video',
	className,
}: Pick<
	TileProps,
	'backgroundImage' | 'imageAlt' | 'video' | 'eyebrow' | 'title' | 'footer' | 'badge' | 'onPress' | 'pressLabel' | 'closeLabel' | 'className'
>) {
	const [playing, setPlaying] = useState(false)
	const hasVideo = Boolean(video)
	const pressable = hasVideo || Boolean(onPress)
	const handlePress = () => {
		if (hasVideo) setPlaying(true)
		else onPress?.()
	}

	return (
		<div
			className={['relative isolate h-full min-h-[200px] w-full overflow-hidden rounded-lg bg-surface-inverted', className]
				.filter(Boolean)
				.join(' ')}
		>
			{playing && video ? (
				<>
					{/* eslint-disable-next-line jsx-a11y/media-has-caption -- caption track is
					    supplied by the consumer via a fuller player when needed. */}
					<video
						src={video}
						poster={backgroundImage}
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
					{backgroundImage ? (
						<img src={backgroundImage} alt={imageAlt ?? ''} className="absolute inset-0 h-full w-full object-cover" />
					) : null}
					{/* Legibility scrim — darkens top + bottom where text sits. */}
					<div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

					{pressable ? (
						<button
							type="button"
							onClick={handlePress}
							aria-label={pressLabel}
							className="absolute inset-0 z-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70"
						/>
					) : null}

					{eyebrow ? (
						<span className="pointer-events-none absolute left-6 top-6 z-10 text-compact font-medium text-white">{eyebrow}</span>
					) : null}

					{/* Content is click-through so pressing the title/badge falls to the
					    press overlay; only `footer` re-enables its own pointer events. */}
					<div className="pointer-events-none absolute inset-x-6 bottom-6 z-10 flex flex-col gap-4">
						{title ? <h2 className="max-w-md text-display font-medium leading-tight text-white">{title}</h2> : null}
						{footer != null || badge != null ? (
							<div className="flex items-center justify-between gap-4">
								<span className="pointer-events-auto">{footer}</span>
								<span>{badge}</span>
							</div>
						) : null}
					</div>
				</>
			)}
		</div>
	)
}

export function Tile({
	theme = 'light',
	eyebrow,
	head,
	badge,
	title,
	titleAlign,
	subtleTitle,
	text,
	footer,
	tail,
	image,
	children,
	backgroundImage,
	imageAlt,
	video,
	closeLabel,
	link,
	onPress,
	pressLabel,
	className,
	...rest
}: TileProps) {
	const eb = eyebrow ?? head
	const ft = footer ?? tail

	// Media hero: a background image / inline video with overlaid text.
	if (backgroundImage || video) {
		return (
			<MediaHero
				backgroundImage={backgroundImage}
				imageAlt={imageAlt}
				video={video}
				eyebrow={eb}
				title={title}
				footer={ft}
				badge={badge}
				onPress={onPress}
				pressLabel={pressLabel}
				closeLabel={closeLabel}
				className={className}
			/>
		)
	}

	const body = (
		<TileBands
			theme={theme}
			eyebrow={eb}
			badge={badge}
			title={title}
			titleAlign={titleAlign}
			subtleTitle={subtleTitle}
			text={text}
			footer={ft}
			image={image}
		>
			{children}
		</TileBands>
	)
	const surface = [baseSurface, THEME[theme], className].filter(Boolean).join(' ')

	// A link element → render the tile AS that element (real anchor semantics).
	if (link && isValidElement(link)) {
		const el = link as ReactElement<{ className?: string }>
		const cardClass = [surface, 'block', interactive, el.props.className].filter(Boolean).join(' ')
		return cloneElement(el, { className: cardClass } as { className: string }, body)
	}

	if (onPress) {
		return (
			<button type="button" onClick={onPress} aria-label={rest['aria-label']} className={`${surface} w-full text-left ${interactive}`}>
				{body}
			</button>
		)
	}

	return <div className={surface}>{body}</div>
}

/**
 * Badge — a small presentational status pill (gs `GSTag`). NOTE: this is a plain
 * label pill, distinct from podoba's interactive React-Aria `Tag` (tag-group.tsx);
 * named `Badge` to avoid the collision.
 */
export type BadgeColor = 'green' | 'yellow' | 'grey' | 'dark'

const BADGE: Record<BadgeColor, string> = {
	// gs `GSTag` green = the brand green (not the pale accent-mint). One saturated
	// brand green for every green tag (New, Active, Published), matching gs 1:1.
	green: 'bg-brand-green text-fg',
	yellow: 'bg-accent-yellow text-fg',
	grey: 'bg-surface-muted text-fg-muted',
	dark: 'bg-surface-inverted text-white',
}

export function Badge({ label, color = 'grey' }: { label: ReactNode; color?: BadgeColor }) {
	return (
		<span
			className={`inline-flex items-center rounded-full px-3 py-1 text-caption font-medium leading-none ${BADGE[color]}`}
		>
			{label}
		</span>
	)
}
