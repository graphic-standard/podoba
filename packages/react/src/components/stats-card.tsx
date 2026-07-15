import { Button as RACButton } from 'react-aria-components'
import { type ReactElement, type ReactNode, cloneElement, isValidElement } from 'react'
import { uic } from '../utils/uic'

/**
 * StatsCard — KPI card (port of gs-platform `GSStatsCard` / `StatsCard`).
 *
 * gs-platform renders title (heading-5) · large value (label-1) · footer
 * (small body) inside a spacious cream `Tile` with panel radius. The `dark`
 * variant mirrors gs's dark "Cloud" tile (inverted surface, light text).
 *
 * Presentational only (hard rule #1): all copy via props, no API/i18n.
 *
 * When `onPress` is set the whole card becomes a React Aria `Button` — it gets
 * keyboard activation, `data-[focus-visible]` ring and `data-[pressed]` for
 * free. Otherwise it renders as a plain non-interactive `div`.
 */
export type StatsCardProps = {
	/** Small uppercase-ish label above the value. */
	title: ReactNode
	/** The large headline number / value. */
	value: ReactNode
	/** Optional supporting footer line (e.g. "+3 this week"). */
	footer?: ReactNode
	/** Optional status pill shown at the end of the title row (e.g. a `<Badge>`). */
	badge?: ReactNode
	/** Optional muted line under the title (e.g. "Plan sections, tasks and outputs"). */
	description?: ReactNode
	/** When provided the card becomes a clickable React Aria Button. */
	onPress?: () => void
	/**
	 * Render the card AS the provided child element (e.g. a router `<Link>`) instead
	 * of a button — so the whole tile is a real anchor (cmd/middle-click, open in
	 * new tab, link semantics). The card styling + hover/focus are merged onto the
	 * child and the title/value/footer are injected as its children. Takes
	 * precedence over `onPress`.
	 */
	asChild?: boolean
	/** The element to render as the card when `asChild` is set (a single element). */
	children?: ReactNode
	/** Dark/inverted surface (gs's dark "Cloud" tile). */
	dark?: boolean
	/**
	 * Vertical placement of the value band. `center` (default) is gs's
	 * `contentAlign="center"` hero-count tile (value fills + centres, footer pinned
	 * bottom). `top` sits the value directly under the eyebrow (gs's dark "Summary"
	 * data tile) with the footer pushed to the bottom.
	 */
	align?: 'center' | 'top'
	/** Mute the value colour (gs's Summary tile — a descriptive title, not a hero count). */
	subtleValue?: boolean
	/** Accessible label for the clickable card (defaults to nothing — title is read). */
	'aria-label'?: string
	className?: string
}

// gs Tile: `--radius-lg` (8px) corners, 16px padding, min-height 208px (size
// "compact"), and it FILLS its grid cell (h-full) so a tall dashboard tile is a
// tall card. The three bands (title top / value centered / footer bottom) are laid
// out by StatsCardBody. The "skin" (surface + border) is split out so the dark
// variant can override it cleanly.
const baseSurface = 'flex h-full min-h-[208px] flex-col gap-2 rounded-lg p-4 text-left'
const lightSkin = 'border border-border bg-surface-card'
const darkSkin = 'border border-transparent bg-surface-inverted'

function StatsCardBody({
	title,
	value,
	footer,
	badge,
	description,
	dark,
	align = 'center',
	subtleValue = false,
}: Pick<StatsCardProps, 'title' | 'value' | 'footer' | 'badge' | 'description' | 'dark' | 'align' | 'subtleValue'>) {
	const isTop = align === 'top'
	const valueTone = dark ? (subtleValue ? 'text-white/60' : 'text-white') : subtleValue ? 'text-fg-muted' : 'text-fg'
	return (
		<>
			<div className="flex items-center justify-between gap-2">
				<span className={`text-body font-medium leading-5 ${dark ? 'text-white' : 'text-fg'}`}>
					{title}
				</span>
				{badge ?? null}
			</div>
			{description ? (
				<span className={`text-compact leading-4 ${dark ? 'text-white/60' : 'text-fg-muted'}`}>
					{description}
				</span>
			) : null}
			{/*
			 * `center` (gs `contentAlign="center"`): the value sits in the CENTRE band —
			 * `flex-1` grows to fill the tile and vertically centres it, pushing any footer
			 * to the bottom. `top`: the value sits directly under the eyebrow (no grow) and
			 * the footer takes `mt-auto` to stay pinned at the bottom. Value ramp = gs
			 * label-1 (1.875rem / 500 / 2rem line). Letter-spacing tracks gs 1:1: light
			 * tiles use -0.56px via `tracking-wide`; the dark count tile uses gs's em-based
			 * `-0.02em` (`AssetsTile.module.scss .count`).
			 */}
			<span
				className={`flex ${isTop ? 'items-start pt-5' : 'flex-1 items-center'} text-display font-medium leading-[2rem] ${dark ? 'tracking-normal' : 'tracking-wide'} ${valueTone}`}
			>
				{/*
				 * Inner wrapper is deliberate: the band is a flex container, and flex
				 * TRIMS the leading whitespace of an anonymous text run — so a value of
				 * `<CountUp/> {' '} unit` collapses to "1version". Nesting the value in one
				 * inline span makes it a single flex item, preserving the internal space.
				 */}
				<span>{value}</span>
			</span>
			{footer ? (
				<span className={`${isTop ? 'mt-auto ' : ''}pt-4 text-small leading-5 ${dark ? 'text-white/50' : 'text-fg-muted'}`}>
					{footer}
				</span>
			) : null}
		</>
	)
}

const PressableCard = uic(RACButton, {
	displayName: 'StatsCardButton',
	baseClass:
		`${baseSurface} ${lightSkin} ` +
		'w-full outline-none transition-transform duration-150 ' +
		'data-[hovered]:scale-[1.02] ' +
		'data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focus-visible]:ring-offset-2 ' +
		'data-[pressed]:scale-100',
})

// Anchor interaction skin: same subtle scale-up as the pressable card (gs Tile
// `whileHover` scale 1.02, no shadow), but driven by CSS `:hover`/`:focus-visible`
// (real <a>) rather than RAC `data-` attributes.
const anchorInteractive =
	'no-underline outline-none transition-transform duration-150 ' +
	'hover:scale-[1.02] ' +
	'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'

export function StatsCard({
	title,
	value,
	footer,
	badge,
	description,
	onPress,
	asChild,
	children,
	dark,
	align,
	subtleValue,
	className,
	...rest
}: StatsCardProps) {
	// asChild wins: render the supplied element (typically a router <Link>) as the
	// card. The body is injected as its children so callers pass a self-closing link.
	if (asChild && isValidElement(children)) {
		const child = children as ReactElement<{ className?: string }>
		const cardClass = [baseSurface, dark ? darkSkin : lightSkin, anchorInteractive, child.props.className, className]
			.filter(Boolean)
			.join(' ')
		return cloneElement(child, { className: cardClass } as { className: string }, <StatsCardBody title={title} value={value} footer={footer} badge={badge} description={description} dark={dark} align={align} subtleValue={subtleValue} />)
	}

	if (onPress) {
		// uic merges via tailwind-merge, so `darkSkin` cleanly overrides the
		// light surface/border in the base class.
		return (
			<PressableCard
				onPress={onPress}
				className={[dark ? darkSkin : '', className].filter(Boolean).join(' ')}
				aria-label={rest['aria-label']}
			>
				<StatsCardBody title={title} value={value} footer={footer} badge={badge} description={description} dark={dark} align={align} subtleValue={subtleValue} />
			</PressableCard>
		)
	}
	return (
		<div className={[baseSurface, dark ? darkSkin : lightSkin, className].filter(Boolean).join(' ')}>
			<StatsCardBody title={title} value={value} footer={footer} badge={badge} description={description} dark={dark} align={align} subtleValue={subtleValue} />
		</div>
	)
}
