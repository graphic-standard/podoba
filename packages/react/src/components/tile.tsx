import { type ReactElement, type ReactNode, cloneElement, isValidElement } from 'react'

/**
 * Tile — the canonical dashboard CARD (port of gs-platform's `Tile`).
 *
 * Layout: `head` (label row, optional trailing badge) · `children` (the big
 * content band, fills + top-aligned) · `tail` (footer — links, avatars). 8px
 * panel radius, generous padding, row-gap. Four themes mirror gs's Figma palette
 * via the design tokens: light (surface-card), dark (inverted, light text), teal
 * (brand green), yellow (accent).
 *
 * Router-agnostic link (hard rule #1 — podoba never imports a router): pass a
 * link ELEMENT as `link` (e.g. a `<Link/>` from your router, self-closing). The
 * tile clones it, merges the card styling + a hover-lift onto it, and injects the
 * tile body as its children — so the whole tile is a real anchor (cmd/middle-click,
 * open in new tab) without podoba knowing about any router. `children` stays the
 * content band (unlike StatsCard's `asChild`, because a Tile's children is content).
 *
 * Presentational only: all copy via props, no API/i18n.
 */
export type TileTheme = 'light' | 'dark' | 'teal' | 'yellow'

const THEME: Record<TileTheme, string> = {
	light: 'bg-surface-card text-fg',
	dark: 'bg-surface-inverted text-white',
	teal: 'bg-brand-secondary text-fg',
	yellow: 'bg-accent-yellow text-fg',
}

/** Hover-lift + focus ring applied only when the tile is a link. */
const linkInteractive =
	'block no-underline outline-none transition-[transform,box-shadow] duration-150 ' +
	'hover:-translate-y-1 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring'

export type TileProps = {
	/** Surface theme (gs's Figma palette). */
	theme?: TileTheme
	/** Label row at the top (optionally a trailing `<Badge>`). */
	head?: ReactNode
	/** The big content band — grows to fill, top-aligned. */
	children?: ReactNode
	/** Footer band (links, avatars, meta). */
	tail?: ReactNode
	/**
	 * A link ELEMENT to render the whole tile as (e.g. a router `<Link/>`). The tile
	 * styling + hover-lift merge onto it and the tile body becomes its children.
	 */
	link?: ReactElement
	className?: string
}

/** The head/content/tail bands, shared by the plain + linked renders. */
function TileBody({ head, children, tail }: Pick<TileProps, 'head' | 'children' | 'tail'>) {
	return (
		<>
			{head ? (
				<div className="flex items-center justify-between gap-2 text-body font-medium leading-5">
					{head}
				</div>
			) : null}
			<div className="flex min-h-0 flex-1 flex-col items-start">{children}</div>
			{tail ? <div className="min-w-0">{tail}</div> : null}
		</>
	)
}

const baseSurface = 'flex h-full min-h-[200px] flex-col gap-6 rounded-panel p-6'

export function Tile({ theme = 'light', head, children, tail, link, className }: TileProps) {
	const surface = [baseSurface, THEME[theme], className].filter(Boolean).join(' ')

	// Link element supplied → render the tile AS that element (real anchor semantics).
	if (link && isValidElement(link)) {
		const el = link as ReactElement<{ className?: string }>
		const cardClass = [surface, linkInteractive, el.props.className].filter(Boolean).join(' ')
		return cloneElement(el, { className: cardClass } as { className: string }, (
			<TileBody head={head} tail={tail}>
				{children}
			</TileBody>
		))
	}

	return (
		<div className={surface}>
			<TileBody head={head} tail={tail}>
				{children}
			</TileBody>
		</div>
	)
}

/**
 * The big "stat" content typography used inside a tile's content band (gs `.content`:
 * 28px / 500 / tight tracking). Apply to the element wrapping a tile's headline value.
 */
export const tileStatClass = 'text-display font-medium leading-[30px] tracking-wide'

/**
 * Badge — a small presentational status pill (gs `GSTag`). NOTE: this is a plain
 * label pill, distinct from podoba's interactive React-Aria `Tag` (tag-group.tsx);
 * named `Badge` to avoid the collision.
 */
export type BadgeColor = 'green' | 'yellow' | 'grey' | 'dark'

const BADGE: Record<BadgeColor, string> = {
	green: 'bg-accent-mint text-fg',
	yellow: 'bg-accent-yellow text-fg',
	grey: 'bg-surface-muted text-fg-muted',
	dark: 'bg-surface-inverted text-white',
}

export function Badge({ label, color = 'grey' }: { label: ReactNode; color?: BadgeColor }) {
	return (
		<span
			className={`inline-flex items-center rounded-full px-2 py-0.5 text-caption font-medium leading-none ${BADGE[color]}`}
		>
			{label}
		</span>
	)
}
