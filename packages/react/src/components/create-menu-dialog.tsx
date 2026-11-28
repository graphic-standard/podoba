import { useId, type ReactNode } from 'react'
import { Button } from './button'
import { ModalDialog, ModalOverlay, ModalSurface } from './dialog'
import { CloseIcon } from './icons'
import { DisplayHeading } from './text'
import { useReducedMotion } from '../utils/use-reduced-motion'

export interface CreateMenuDialogProps {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	/** Large centred title, e.g. "What do you want to create?". Line breaks in a string are kept. */
	title: ReactNode
	/** Accessible name of the close button, translated by the consumer. */
	closeLabel: string
	/**
	 * URL of a decorative video that loops behind the dialog. The asset belongs to the
	 * consumer (Podoba ships none), and so does its grading: the component applies no
	 * filter. It plays muted and inline and is hidden from assistive tech. With reduced
	 * motion it is not rendered at all, so it is not downloaded either.
	 *
	 * It has no pause control and loops for as long as the dialog is open, so it does
	 * not meet WCAG 2.2.2 (Pause, Stop, Hide) for users who have not asked for reduced
	 * motion. Pass it only where that is acceptable, as decoration behind a surface that
	 * covers most of it; leave it out where 2.2.2 is required.
	 */
	backgroundVideo?: string
	/** The menu itself: create actions, shortcuts, sections. Scrolls inside the dialog. */
	children: ReactNode
}

/**
 * Full-height creation menu: a large title over a scrolling body, in a near
 * full-screen dialog, optionally over a looping background video. A modal surface for
 * "create anything" entry points that list more choices than a dropdown or a context
 * menu holds; the choices are the consumer's.
 *
 * Built on the shared `ModalOverlay` / `ModalSurface`, so it traps focus, closes on
 * Escape and on a press outside, and sizes to the visible viewport (the iOS keyboard).
 */
export function CreateMenuDialog({ isOpen, onOpenChange, title, closeLabel, backgroundVideo, children }: CreateMenuDialogProps) {
	const titleId = useId()
	const reduceMotion = useReducedMotion()
	return (
		<ModalOverlay className="p-0" isOpen={isOpen} onOpenChange={onOpenChange} isDismissable>
			{/* Not rendered with reduced motion, so the browser never fetches it;
			    motion-reduce:hidden also covers a server render that could not know. */}
			{backgroundVideo && !reduceMotion ? (
				<div aria-hidden="true" data-create-menu-video="" className="pointer-events-none absolute inset-0 overflow-hidden bg-surface-inverted motion-reduce:hidden">
					<video src={backgroundVideo} autoPlay muted loop playsInline className="h-full w-full object-cover" />
				</div>
			) : null}
			<ModalSurface className="relative box-border flex h-9/10 max-h-324 w-9/10 max-w-432 flex-col overflow-hidden p-0 shadow-none max-md:h-23/25 max-md:w-24/25">
				<ModalDialog aria-labelledby={titleId} className="relative flex min-h-0 flex-1 flex-col gap-4 p-6 outline-none max-md:p-4">
					<Button
						variant="ghost"
						aria-label={closeLabel}
						onPress={() => onOpenChange(false)}
						// fg-muted, not the library's usual fg-subtle close glyph: that ink is below
						// the 3:1 floor for an icon-only control (see fg-subtle-usage.test.ts).
						// 36px, like the other dialogs' close buttons: on a phone it is the obvious way out.
						className="absolute end-3.5 top-3 z-10 h-9 w-9 rounded-md p-0 text-fg-muted"
					>
						<CloseIcon aria-hidden="true" className="h-4.5 w-4.5" />
					</Button>
					{/* A div, not <header>: inside the dialog a header would be announced as the page banner. */}
					<div className="flex shrink-0 flex-col items-center gap-2 px-10 pt-8 md:pt-12">
						{/* The menu's own display size: it scales with the viewport between the
						    32px and 48px the menu was designed at, tighter than text-display-large. */}
						<DisplayHeading id={titleId} className="m-0 mb-4 whitespace-pre-line text-center text-[clamp(2rem,3vw,3rem)] leading-[1.05] tracking-[-0.02em]">
							{title}
						</DisplayHeading>
					</div>
					<div data-create-menu-body="" className="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
						{children}
					</div>
				</ModalDialog>
			</ModalSurface>
		</ModalOverlay>
	)
}
