/**
 * Avatar + AvatarGroup — user avatars (port of gs `GSTeamAvatarGroup`, extended with
 * image support). A single `Avatar` shows the user's photo, falling back to initials
 * on the brand surface. It is inline-friendly (`inline-flex align-middle`) so it drops
 * straight into a line of text — "Agáta Zapotilová <Avatar/> created project". Overlap a
 * set with `AvatarGroup` (trailing "+N" overflow, optional dashed add affordance).
 *
 * Presentational only (hard rule #1): names/urls arrive via props.
 */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg'

const SIZE: Record<AvatarSize, string> = {
	xs: 'h-5 w-5 text-micro',
	sm: 'h-6 w-6 text-caption',
	md: 'h-7 w-7 text-caption',
	lg: 'h-9 w-9 text-compact',
}

/** First + last initial (single word → first two letters). */
function initials(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean)
	const first = parts[0] ?? ''
	if (parts.length === 0) return '?'
	if (parts.length === 1) return first.slice(0, 2).toUpperCase()
	const last = parts[parts.length - 1] ?? ''
	return ((first[0] ?? '') + (last[0] ?? '')).toUpperCase()
}

export interface AvatarProps {
	/** Person's name — drives the initials fallback + the tooltip/alt text. */
	name: string
	/** Avatar image URL. Falls back to initials when omitted. */
	src?: string
	size?: AvatarSize
	/** On a dark surface → light ring so avatars separate cleanly. */
	onDark?: boolean
	/** Ring/border around the avatar (default true — needed when they overlap). */
	ring?: boolean
	className?: string
}

export function Avatar({ name, src, size = 'md', onDark = false, ring = true, className }: AvatarProps) {
	const ringClass = ring ? `border-2 ${onDark ? 'border-surface-inverted' : 'border-surface'}` : ''
	const base = `${SIZE[size]} ${ringClass} inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full align-middle`
	if (src) {
		return <img src={src} alt={name} title={name} className={[base, 'object-cover', className].filter(Boolean).join(' ')} />
	}
	return (
		<span title={name} className={[base, 'bg-brand-primary font-medium text-fg-inverted', className].filter(Boolean).join(' ')}>
			{initials(name)}
		</span>
	)
}

export interface AvatarPerson {
	name: string
	src?: string
}

export interface AvatarGroupProps {
	/** People to show (with optional image). Prefer this over `names`. */
	people?: AvatarPerson[]
	/** Names-only convenience (initials avatars). */
	names?: string[]
	max?: number
	size?: AvatarSize
	onDark?: boolean
	/** Trailing dashed "+" add affordance. */
	showAdd?: boolean
}

export function AvatarGroup({ people, names, max = 3, size = 'md', onDark = false, showAdd = false }: AvatarGroupProps) {
	const all: AvatarPerson[] = people ?? (names ?? []).map((name) => ({ name }))
	const visible = all.slice(0, max)
	const overflow = all.length - visible.length
	const chip = `${SIZE[size]} border-2 ${onDark ? 'border-surface-inverted' : 'border-surface'} -ml-1.5 inline-flex items-center justify-center rounded-full`
	return (
		<div className="flex items-center">
			{visible.map((p, i) => (
				<Avatar key={`${p.name}-${i}`} name={p.name} src={p.src} size={size} onDark={onDark} className="-ml-1.5 first:ml-0" />
			))}
			{overflow > 0 ? <span className={`${chip} bg-surface-muted font-medium text-fg-muted`}>+{overflow}</span> : null}
			{showAdd ? (
				<span className={`${chip} border-dashed bg-transparent ${onDark ? 'text-white/70' : 'text-fg-muted'}`}>+</span>
			) : null}
		</div>
	)
}
