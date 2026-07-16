import { type ReactElement, type ReactNode, isValidElement } from 'react'
import { Tile } from './tile'

/**
 * StatsCard — DEPRECATED. Kept as a thin wrapper over the unified {@link Tile} so
 * existing call sites keep working while every tile shares ONE inner. Prefer `<Tile>`
 * directly for new code:
 *   title → eyebrow · value → title · description → text · dark → theme="dark" ·
 *   align → titleAlign · subtleValue → subtleTitle · asChild+<Link> → link.
 *
 * @deprecated use `<Tile>`.
 */
export type StatsCardProps = {
	/** Small label above the value → Tile `eyebrow`. */
	title: ReactNode
	/** The large headline number / value → Tile `title`. */
	value: ReactNode
	/** Optional supporting footer line → Tile `footer`. */
	footer?: ReactNode
	/** Optional status pill → Tile `badge`. */
	badge?: ReactNode
	/** Optional muted line under the title → Tile `text`. */
	description?: ReactNode
	/** Clickable via a press handler → Tile `onPress`. */
	onPress?: () => void
	/** Render AS the provided child element (a router `<Link>`) → Tile `link`. */
	asChild?: boolean
	/** The element to render as the card when `asChild` is set. */
	children?: ReactNode
	/** Dark/inverted surface → Tile `theme="dark"`. */
	dark?: boolean
	/** Value placement → Tile `titleAlign` (default `center`). */
	align?: 'center' | 'top'
	/** Mute the value colour → Tile `subtleTitle`. */
	subtleValue?: boolean
	'aria-label'?: string
	className?: string
}

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
	align = 'center',
	subtleValue,
	className,
	...rest
}: StatsCardProps) {
	const link = asChild && isValidElement(children) ? (children as ReactElement) : undefined
	return (
		<Tile
			theme={dark ? 'dark' : 'light'}
			eyebrow={title}
			badge={badge}
			title={value}
			titleAlign={align}
			subtleTitle={subtleValue}
			text={description}
			footer={footer}
			link={link}
			onPress={onPress}
			aria-label={rest['aria-label']}
			className={className}
		/>
	)
}
