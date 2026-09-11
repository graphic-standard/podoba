import type { ReactNode } from 'react'
import {
	Dialog as RACDialog,
	DialogTrigger as RACDialogTrigger,
	type DialogProps as RACDialogProps,
	Heading,
	Modal as RACModal,
	ModalOverlay as RACModalOverlay,
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

// Current gs modal backdrop: warm surface-card scrim at 66% under a 10px blur.
export const ModalOverlay = uic(RACModalOverlay, {
	displayName: 'DialogOverlay',
	baseClass:
		'fixed inset-0 z-50 flex items-center justify-center p-4 ' +
		'bg-modal-backdrop backdrop-blur-modal-backdrop ' +
		'data-[entering]:animate-modal-overlay-in data-[exiting]:animate-modal-overlay-out',
})

// gs content card: white bg, 20px padding, 8px radius and the shared two-layer
// modal elevation.
export const ModalSurface = uic(RACModal, {
	displayName: 'DialogModal',
	baseClass:
		'relative rounded-lg bg-surface p-5 outline-none shadow-modal-surface ' +
		'data-[entering]:animate-modal-surface-in data-[exiting]:animate-modal-surface-out',
})

/**
 * Unstyled accessible dialog body for edge-to-edge / split modal compositions.
 * Pair only with the shared {@link ModalOverlay} and {@link ModalSurface}; ordinary
 * form and confirmation dialogs should use the composed {@link Dialog}.
 */
export const ModalDialog = RACDialog

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
	/** Optional form-specific width cap; the viewport width preset still applies. */
	maxWidth?: number
	/** Responsive intrinsic detail envelope, independent of title sizing. */
	widthPreset?: 'responsive-detail' | 'custom-task-detail'
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
	maxWidth,
	widthPreset,
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
		<ModalOverlay
			// Full-screen is an immersive takeover: swap the light scrim for a heavier
			// backdrop blur so the page behind reads as clearly blurred around the
			// near-fullscreen canvas. (tailwind-merge dedupes the base blur/scrim.)
			className={isFlex ? 'bg-black/25 backdrop-blur-lg' : undefined}
			isOpen={isOpen}
			defaultOpen={defaultOpen}
			onOpenChange={onOpenChange}
			isDismissable={isDismissable}
		>
			<ModalSurface
				className={
					widthPreset === 'responsive-detail'
						? 'w-[90vw] max-w-125 md:max-w-150 lg:max-w-160 xl:max-w-180 max-h-[85vh] overflow-y-auto'
						: widthPreset === 'custom-task-detail'
							? 'w-[90vw] min-w-[400px] max-w-[500px] md:max-w-[600px] lg:max-w-[640px] xl:max-w-[720px] max-h-[85vh] overflow-y-auto max-[460px]:min-w-0'
							: SIZE_CLASS[size]
				}
				style={maxWidth === undefined ? undefined : { maxWidth }}
			>
				<ModalDialog
					{...props}
					className={isFlex ? 'flex min-h-0 flex-1 flex-col outline-none' : 'outline-none'}
				>
					{(renderProps) => (
						<>
							<div className={isFlex ? 'mb-4 flex shrink-0 items-start justify-between gap-4' : 'block'}>
								{title || description ? (
									<div className="min-w-0">
										{title ? (
											<div className="flex items-center gap-2">
												<Heading slot="title" className={isFlex ? `${TITLE_CLASS[size]} text-fg` : 'm-0 mb-4 max-w-5/6 text-heading1 font-medium tracking-normal text-fg'}>
													{title}
												</Heading>
												{badge ? (
													<span className="inline-flex shrink-0 items-center rounded-full bg-surface-muted px-2 py-0.5 text-label font-medium text-fg-muted">
														{badge}
													</span>
												) : null}
											</div>
										) : null}
										{description ? (
											// Source ordinary descriptions use the 14px/18px label ramp.
											<p className={isFlex ? 'mt-1 text-body text-fg' : 'm-0 mb-6 max-w-5/6 text-small leading-4.5 font-normal text-fg-workflow-muted'}>{description}</p>
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
									className={`${isFlex ? '-mr-1 -mt-1' : 'absolute top-[calc(var(--spacing)*3.375)] end-4 max-md:end-3'} inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-fg-subtle outline-none transition-colors hover:bg-surface-muted hover:text-fg focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none`}
								>
									<svg
										width={isFlex ? 18 : 15}
										height={isFlex ? 18 : 15}
										viewBox={isFlex ? '0 0 24 24' : '0 0 15 15'}
										fill="none"
										stroke={isFlex ? 'currentColor' : undefined}
										strokeWidth="2"
										strokeLinecap="round"
										aria-hidden="true"
									>
										<path fill={isFlex ? undefined : 'currentColor'} d={isFlex ? 'M6 6l12 12M18 6 6 18' : 'M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z'} />
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
				</ModalDialog>
			</ModalSurface>
		</ModalOverlay>
	)
}
