// AccountDialog: the window that opens from the avatar in the top bar.
//
// One window for every app of the suite, so that moving between them feels like moving
// inside one system: a hero with the person's illustrated avatar, a greeting, the apps
// they can switch to, their preferences, and sign-out. Ported from graphic-standard's
// `AccountDialog` (apps/web/src/components/account-menu.tsx); the CMS editors built on
// pramen fill their `account` slot with the same component.
//
// Presentational (hard rule #1): every string arrives as a prop, every action is a
// callback or an href, and the app decides what goes into the slots. What differs
// between apps is a slot, not a fork:
//   - `heroAction`: e.g. an "Edit avatar" button, where the app can edit it;
//   - `preferences`: `AccountPreferenceCard`s (theme, language, workspace, ...);
//   - `children`: further sections, e.g. an inline profile form;
//   - `actions`: footer rows next to sign-out, as links (`href`) or buttons (`onPress`);
//   - `panel`: replaces the whole body, e.g. a list the dialog drills into.
//
// An app card is a real link when it has an `href` (an app that lives elsewhere: a
// middle click and "open in a new tab" work) and a button when it has `onPress`.
//
// Dark mode needs no prop: the token flip and the `dark:` variant follow
// `[data-theme="dark"]` on an ancestor.

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Button as RACButton, Link as RACLink } from 'react-aria-components'
import { Avatar } from './avatar'
import { Button, LinkButton } from './button'
import { ModalDialog, ModalOverlay, ModalSurface } from './dialog'
import { CloseIcon } from './icons'
import { DisplayHeading, Text } from './text'
import { Badge } from './tile'

/** The signed-in person, as the hero and the trigger show them. */
export interface AccountDialogUser {
	/** Display name (or the email when there is none): alt text and the initials fallback. */
	name: string
	/** The small round picture (with its own background), for the trigger and the fallback hero. */
	picture?: string
	/** The illustrated avatar without its round backdrop, drawn large in the hero. */
	figure?: string
	/** The colour the figure stands on (`#rrggbb`). Also outlines the current app's card. */
	background?: string
}

/** Artwork of an app card: a still, and optionally a loop that plays on hover. */
export interface AccountAppArtwork {
	/** Still image, shown until (and unless) the video plays. */
	poster: string
	/** Muted looping video, played while the card is hovered (or is the current app). */
	video?: string
	/** Extra classes for the artwork layer (e.g. a nudge for one illustration). */
	className?: string
}

/** One app the person can switch to. */
export interface AccountApp {
	/** Stable key. */
	id: string
	name: string
	description: string
	/** Where the app lives. Renders the card as a link. */
	href?: string
	/** Opens the app in place. Renders the card as a button. Ignored when `href` is set. */
	onPress?: () => void
	/** The app the person is in now (`aria-current="page"`, outlined in the accent). */
	current?: boolean
	/** Not finished yet: disabled, with the `soon` badge. */
	soon?: boolean
	/** Disabled for this person, with this badge in the corner (e.g. "Admins only"). */
	lockedLabel?: string
	/** Disabled without a badge (e.g. no address yet). */
	isDisabled?: boolean
	artwork?: AccountAppArtwork
	/** Take the initial focus when the dialog opens. */
	autoFocus?: boolean
}

/** A footer row next to sign-out: a link when it has `href`, a button when it has `onPress`. */
export interface AccountAction {
	id: string
	label: string
	href?: string
	onPress?: () => void
}

/** Strings the dialog renders, supplied by the app (i18n). */
export interface AccountDialogLabels {
	/** The close button's accessible name. */
	close: string
	/** Heading of the apps section. */
	apps: string
	/** Heading of the preferences section. */
	preferences: string
	/** Badge on an app that is not ready. */
	soon: string
	signOut: string
	/** Prefix of the version line, e.g. "Version". */
	version: string
}

export interface AccountDialogProps {
	/** Controlled open state. */
	isOpen: boolean
	/** Notified on Esc, a click outside and the close button (always `false`). */
	onOpenChange: (isOpen: boolean) => void
	user: AccountDialogUser
	/** The greeting heading. Wrap the name in `<AccountDialogName>` to set it apart. */
	title: ReactNode
	/** A quieter line under the heading (e.g. the email and the roles). */
	subtitle?: ReactNode
	/** Over the hero's bottom right corner, shown on hover and focus (e.g. "Edit avatar"). */
	heroAction?: ReactNode
	apps: readonly AccountApp[]
	/** `AccountPreferenceCard`s. The section is left out when empty. */
	preferences?: ReactNode
	/** Further sections between the preferences and the footer. */
	children?: ReactNode
	/** Footer rows next to sign-out. */
	actions?: readonly AccountAction[]
	onSignOut: () => void
	/** Sign-out is in flight: the button is disabled. */
	isSigningOut?: boolean
	/** The running version, so a bug report can say what it was. Left out when empty. */
	version?: string
	/** Replaces the body (hero included) while set, e.g. a list the dialog drills into.
	 * The panel brings its own heading and way back. */
	panel?: ReactNode
	/** Accessible name of the dialog while `panel` is shown (usually the panel's heading). */
	panelTitle?: string
	labels: AccountDialogLabels
	'data-testid'?: string
}

/** The name inside an {@link AccountDialog} greeting, in full ink against the muted rest. */
export function AccountDialogName({ children }: { children: ReactNode }) {
	return <span className="text-fg">{children}</span>
}

/**
 * The avatar button for the top bar that opens the {@link AccountDialog}. Pass the
 * accessible name (e.g. "Account") as `label`.
 */
export function AccountButton({
	user,
	label,
	onPress,
	className,
}: {
	user: Pick<AccountDialogUser, 'name' | 'picture'>
	label: string
	onPress: () => void
	className?: string
}) {
	return (
		<Button variant="ghost" aria-label={label} aria-haspopup="dialog" className={['ml-2 p-2', className].filter(Boolean).join(' ')} onPress={onPress}>
			<Avatar name={user.name} src={user.picture} />
		</Button>
	)
}

/** A preference tile for the dialog's `preferences` slot: a title, a hint, and the control. */
export function AccountPreferenceCard({ title, hint, children }: { title: string; hint: ReactNode; children: ReactNode }) {
	return (
		<div className="relative flex min-h-40 flex-col justify-between gap-5 rounded-lg bg-surface-card p-4 dark:border dark:border-border">
			<div className="flex flex-col gap-2">
				<Text weight="medium">{title}</Text>
				<Text size="small" tone="muted">{hint}</Text>
			</div>
			<div className="flex min-h-control-tall items-center">{children}</div>
		</div>
	)
}

/** The account window: hero, greeting, apps, preferences, extra sections, footer. */
export function AccountDialog({
	isOpen,
	onOpenChange,
	user,
	title,
	subtitle,
	heroAction,
	apps,
	preferences,
	children,
	actions = [],
	onSignOut,
	isSigningOut = false,
	version,
	panel,
	panelTitle,
	labels,
	'data-testid': testId,
}: AccountDialogProps) {
	const titleId = useId()
	const [hoveredApp, setHoveredApp] = useState<string | null>(null)
	const illustrated = Boolean(user.figure && user.background)
	const close = () => onOpenChange(false)

	return (
		<ModalOverlay isOpen={isOpen} isDismissable onOpenChange={onOpenChange}>
			<ModalSurface className="max-h-[85vh] w-[90vw] max-w-[900px] overflow-y-auto p-0">
				<ModalDialog
					aria-labelledby={panel ? undefined : titleId}
					aria-label={panel ? panelTitle : undefined}
					data-testid={testId}
					className="outline-none"
				>
					{panel ? (
						panel
					) : (
						<>
							<div
								className={`group relative flex h-48 items-end justify-center overflow-hidden rounded-t-lg sm:h-56 ${illustrated ? '' : 'bg-surface-muted'}`}
								style={illustrated ? { backgroundColor: user.background } : undefined}
								data-testid="account-dialog-hero"
							>
								{heroAction ? (
									<span className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
										{heroAction}
									</span>
								) : null}
								{illustrated ? (
									<img src={user.figure} alt={user.name} width={512} height={512} className="h-full w-full object-contain object-bottom" />
								) : (
									<div className="flex h-full items-center">
										<Avatar name={user.name} src={user.picture} size="lg" />
									</div>
								)}
								<Button
									variant="ghost"
									aria-label={labels.close}
									onPress={close}
									className="absolute top-3 right-3 h-9 w-9 rounded-full bg-surface p-0 text-fg hover:bg-surface-muted"
								>
									<CloseIcon aria-hidden="true" className="size-[18px]" />
								</Button>
							</div>

							<div className="flex flex-col gap-6 p-5">
								<div className="flex flex-col gap-2">
									<DisplayHeading asChild className="m-0 min-w-0 break-words pb-0.5 tracking-[0] text-fg-muted">
										<h2 id={titleId}>{title}</h2>
									</DisplayHeading>
									{subtitle ? <Text size="small" tone="muted">{subtitle}</Text> : null}
								</div>

								{apps.length > 0 ? (
									<section className="flex flex-col gap-3">
										<Text weight="medium">{labels.apps}</Text>
										<div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
											{apps.map((app) => (
												<AppCard
													key={app.id}
													app={app}
													soonLabel={labels.soon}
													accent={illustrated ? user.background : undefined}
													active={hoveredApp === null ? Boolean(app.current) : hoveredApp === app.id}
													onHover={(hovered) => setHoveredApp(hovered ? app.id : null)}
												/>
											))}
										</div>
									</section>
								) : null}

								{preferences ? (
									<section className="flex flex-col gap-3">
										<Text weight="medium">{labels.preferences}</Text>
										<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{preferences}</div>
									</section>
								) : null}

								{children}

								<div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
									{version ? (
										<Text size="small" tone="muted">
											{labels.version} {version}
										</Text>
									) : null}
									<div className="ml-auto flex flex-wrap items-center gap-3">
										{actions.map((action) =>
											action.href ? (
												<LinkButton key={action.id} variant="secondary" href={action.href}>
													{action.label}
												</LinkButton>
											) : (
												<Button key={action.id} variant="secondary" onPress={action.onPress}>
													{action.label}
												</Button>
											),
										)}
										<Button variant="destructive" isDisabled={isSigningOut} onPress={onSignOut}>
											{labels.signOut}
										</Button>
									</div>
								</div>
							</div>
						</>
					)}
				</ModalDialog>
			</ModalSurface>
		</ModalOverlay>
	)
}

// The card reads as Podoba's `Card` (surface-card, 8px radius, 16px padding): plain in
// the light theme, outlined in the dark one, and outlined in the person's avatar colour
// when it is the current app.
const CARD =
	'relative flex min-h-44 w-full flex-col items-start justify-end gap-3 overflow-hidden rounded-lg bg-surface-card p-4 text-left text-compact leading-4 text-fg no-underline ' +
	'cursor-pointer outline-none dark:border dark:border-border ' +
	'data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focus-visible]:ring-offset-2 ' +
	'data-[disabled]:cursor-default data-[disabled]:opacity-50'

function AppCard({
	app,
	soonLabel,
	accent,
	active,
	onHover,
}: {
	app: AccountApp
	soonLabel: string
	accent?: string
	active: boolean
	onHover: (hovered: boolean) => void
}) {
	const disabled = Boolean(app.soon || app.lockedLabel || app.isDisabled || (!app.href && !app.onPress))
	const className = `${CARD} ${app.current ? 'border border-border' : ''}`
	const style: CSSProperties | undefined = app.current && accent ? { borderColor: accent } : undefined
	const body = (
		<>
			{app.lockedLabel ? (
				<span className="absolute right-4 top-4 z-20">
					<Badge label={app.lockedLabel} color="grey" />
				</span>
			) : null}
			{app.soon ? (
				<span className="mb-auto">
					<Badge label={soonLabel} color="grey" />
				</span>
			) : null}
			<span className={`relative z-20 flex w-full flex-col items-center gap-2 text-center ${app.artwork ? 'mt-auto' : ''}`}>
				<Text weight="medium">{app.name}</Text>
				<Text size="micro" tone="muted" className="whitespace-nowrap leading-4">
					{app.description}
				</Text>
			</span>
			{app.artwork ? (
				<>
					<AppArtwork artwork={app.artwork} active={active} keepPosition={Boolean(app.current)} />
					<span
						aria-hidden="true"
						className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] bg-white/60 backdrop-blur-xl [mask-image:linear-gradient(to_bottom,transparent_40%,black_85%,black_100%)] dark:bg-surface-card/80"
					/>
				</>
			) : null}
		</>
	)
	const shared = {
		className,
		style,
		isDisabled: disabled,
		autoFocus: app.autoFocus,
		'aria-current': app.current ? ('page' as const) : undefined,
		onHoverStart: () => onHover(true),
		onHoverEnd: () => onHover(false),
	}
	// A disabled card goes nowhere, so it is a disabled button even when it has an address.
	return app.href && !disabled ? (
		<RACLink {...shared} href={app.href}>
			{body}
		</RACLink>
	) : (
		<RACButton {...shared} onPress={app.onPress}>
			{body}
		</RACButton>
	)
}

function AppArtwork({ artwork, active, keepPosition }: { artwork: AccountAppArtwork; active: boolean; keepPosition: boolean }) {
	const video = useRef<HTMLVideoElement>(null)
	const [playing, setPlaying] = useState(false)
	useEffect(() => {
		const element = video.current
		if (!element) return
		if (active && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			void element
				.play()
				?.then(() => setPlaying(true))
				.catch(() => setPlaying(false))
		} else {
			element.pause()
			if (!keepPosition) element.currentTime = 0
		}
	}, [active, keepPosition])
	const layer = `absolute inset-0 h-full w-full scale-125 object-contain ${artwork.className ?? ''}`
	return (
		<span aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 block h-full w-full shrink-0 overflow-hidden">
			{artwork.video ? (
				<video ref={video} src={artwork.video} muted loop playsInline preload="none" onPlaying={() => setPlaying(true)} className={layer} />
			) : null}
			<img src={artwork.poster} alt="" className={`${layer} ${playing && (active || keepPosition) ? 'invisible' : ''}`} />
		</span>
	)
}
