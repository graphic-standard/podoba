import type { ReactNode } from 'react'
import {
	Dialog as RACDialog,
	DialogTrigger as RACDialogTrigger,
	type DialogProps as RACDialogProps,
	Heading,
	Modal,
	ModalOverlay,
} from 'react-aria-components'
import { uic } from '../utils/uic'

/**
 * Dialog — modal dialog built on React Aria Components.
 *
 * RAC `Modal` provides focus trapping, scroll locking, `Esc` to close and
 * `aria-modal` semantics automatically. Compose with `DialogTrigger` for the
 * open/close state, or drive it controlled via `Modal`'s `isOpen`.
 */
export const DialogTrigger = RACDialogTrigger

// gs modal backdrop — gs `Dialog.module.scss` overlay: a neutral grey scrim
// (`rgba(179,179,179,0.5)`) under a light `blur(2px)`.
const Overlay = uic(ModalOverlay, {
	displayName: 'DialogOverlay',
	baseClass:
		'fixed inset-0 z-50 flex items-center justify-center p-4 ' +
		'bg-[rgba(179,179,179,0.5)] backdrop-blur-[2px] ' +
		'data-[entering]:animate-in data-[exiting]:animate-out',
})

// gs content card: white bg, 20px padding (`p-5`), 8px radius (`rounded-lg`), and
// the gs `Dialog.module.scss` card shadow — a light single-layer
// `0 2px 8px rgba(0,0,0,.06)`. No border: gs defines the card with the shadow alone.
const StyledModal = uic(Modal, {
	displayName: 'DialogModal',
	baseClass:
		'rounded-lg bg-surface p-5 outline-none shadow-[0px_2px_8px_0px_rgba(0,0,0,0.06)]',
})

/**
 * Modal width presets. `md` (default) is the form/confirm dialog (gs DialogContent
 * default, 586px); `sm` is a tighter confirm; `lg`/`xl` host wider, taller content
 * (e.g. a multi-step workspace stepper); `full` is a near-fullscreen canvas (e.g.
 * the output-template picker gallery). The taller presets cap height with an internal
 * scroll so content never overflows the viewport.
 */
export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

// gs size presets (exact px max-widths from the designer's spec): sm 420 / md 586
// / lg 720 / xl 900. All cap to `90vw` width and `85vh` height with internal
// scroll. Default is `md` (gs DialogContent default = 586px).
const SIZE_CLASS: Record<DialogSize, string> = {
	sm: 'w-[90vw] max-w-[420px] max-h-[85vh] overflow-y-auto',
	md: 'w-[90vw] max-w-[586px] max-h-[85vh] overflow-y-auto',
	lg: 'w-[90vw] max-w-[720px] max-h-[85vh] overflow-y-auto',
	xl: 'w-[90vw] max-w-[900px] max-h-[85vh] overflow-y-auto',
	// Our addition (not in gs): a fixed near-fullscreen canvas (flex column so the
	// body fills and any inner region can scroll with the header/footer pinned).
	full: 'w-[95vw] max-w-[95vw] h-[92vh] flex flex-col',
}

/** Title size scales with the modal: small dialogs stay compact, large canvases get
 *  a proper heading (gs picker headline). */
// gs `.title` = heading-1 (1.75rem/28px) · weight 500 (medium) · 30px line. sm/md
// were 18px/600; all sizes now use the gs medium weight (not semibold).
const TITLE_CLASS: Record<DialogSize, string> = {
	sm: 'text-heading1 font-medium tracking-tight',
	md: 'text-heading1 font-medium tracking-tight',
	lg: 'text-heading2 font-medium tracking-tight',
	xl: 'text-heading2 font-medium tracking-tight',
	full: 'text-heading1 font-medium tracking-tight',
}

export type DialogProps = RACDialogProps & {
	/** Accessible dialog title — rendered as the labelling heading. */
	title?: ReactNode
	/**
	 * Optional sub-text under the title (e.g. "Invite collaborators and manage
	 * visibility"). Rendered muted; pairs with `title` to form a header block.
	 */
	description?: ReactNode
	/**
	 * Optional pill rendered inline beside the title (e.g. a status / step / count
	 * badge). Caller supplies the content; the Dialog supplies the pill chrome.
	 */
	badge?: ReactNode
	/** Width preset — `md` (default) for forms; `sm` for tight confirms; `lg`/`xl` for wide stepper content. */
	size?: DialogSize
	children: ReactNode | ((opts: { close: () => void }) => ReactNode)
	/**
	 * Controlled open state. Provide together with `onOpenChange` to drive the
	 * dialog from caller state (the modal renders only when `isOpen`). Omit both
	 * to let an enclosing `DialogTrigger` own the open/close state instead.
	 */
	isOpen?: boolean
	/** Uncontrolled initial open state (ignored when `isOpen` is provided). */
	defaultOpen?: boolean
	/** Notified on open/close — fires with `false` on Esc / click-outside / close(). */
	onOpenChange?: (isOpen: boolean) => void
	/** Allow dismissing via Esc and click-outside (default true). */
	isDismissable?: boolean
	/** Accessible label for the close (✕) control. Defaults to "Close". */
	closeLabel?: string
}

export const Dialog = ({
	title,
	description,
	badge,
	// gs DialogContent defaults to `md` (586px form width).
	size = 'md',
	children,
	isOpen,
	defaultOpen,
	onOpenChange,
	isDismissable = true,
	closeLabel = 'Close',
	...props
}: DialogProps) => {
	// `full` is a fixed-height flex canvas: the body fills and scrolls internally so
	// the header (+ a footer the content pins) stay put. Other sizes are content-height.
	const isFlex = size === 'full'
	return (
		// `isOpen`/`defaultOpen`/`onOpenChange` go to the RAC ModalOverlay: when
		// provided the dialog is controlled (renders independently of a DialogTrigger);
		// when omitted the overlay reads its state from an enclosing DialogTrigger.
		// Either way the RACDialog render-prop `close` resolves against the active
		// overlay state, so `close()` works in both modes.
		<Overlay
			// Full-screen is an immersive takeover: swap the light 2px scrim for a
			// heavier backdrop blur so the page behind reads as clearly blurred around
			// the near-fullscreen canvas. (tailwind-merge dedupes the base blur/scrim.)
			className={isFlex ? "bg-black/25 backdrop-blur-lg" : undefined}
			isOpen={isOpen}
			defaultOpen={defaultOpen}
			onOpenChange={onOpenChange}
			isDismissable={isDismissable}
		>
			<StyledModal className={SIZE_CLASS[size]}>
				<RACDialog
					{...props}
					className={isFlex ? 'flex min-h-0 flex-1 flex-col outline-none' : 'outline-none'}
				>
					{(renderProps) => (
						<>
							<div className="mb-4 flex shrink-0 items-start justify-between gap-4">
								{title || description ? (
									<div className="min-w-0">
										{title ? (
											<div className="flex items-center gap-2">
												<Heading slot="title" className={`${TITLE_CLASS[size]} text-fg`}>
													{title}
												</Heading>
												{badge ? (
													<span className="inline-flex shrink-0 items-center rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-fg-muted">
														{badge}
													</span>
												) : null}
											</div>
										) : null}
										{description ? (
											// gs `.description` = base 16px, text-secondary (=fg).
											<p className="mt-1 text-body text-fg">{description}</p>
										) : null}
									</div>
								) : (
									<span aria-hidden="true" />
								)}
								<button
									type="button"
									onClick={renderProps.close}
									aria-label={closeLabel}
									// gs close: 32px square (`h-8 w-8`), medium radius (`rounded-md`),
									// tertiary icon color (`text-fg-subtle`) → primary (`text-fg`) +
									// subtle hover bg on hover. Smooth color transition.
									className="-mr-1 -mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-fg-subtle outline-none transition-colors hover:bg-surface-muted hover:text-fg focus-visible:ring-2 focus-visible:ring-ring"
								>
									<svg
										width="18"
										height="18"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										aria-hidden="true"
									>
										<path d="M6 6l12 12M18 6 6 18" />
									</svg>
								</button>
							</div>
							{isFlex ? (
								<div className="flex min-h-0 flex-1 flex-col">
									{typeof children === 'function' ? children(renderProps) : children}
								</div>
							) : typeof children === 'function' ? (
								children(renderProps)
							) : (
								children
							)}
						</>
					)}
				</RACDialog>
			</StyledModal>
		</Overlay>
	)
}
