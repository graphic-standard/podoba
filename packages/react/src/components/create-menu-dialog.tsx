import { useId, type ReactNode } from 'react'
import { Button } from './button'
import { ModalDialog, ModalOverlay, ModalSurface } from './dialog'
import { CloseIcon } from './icons'
import { DisplayHeading } from './text'

export interface CreateMenuDialogProps {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	/** Large centred title, e.g. "What do you want to create?". Line breaks in a string are kept. */
	title: ReactNode
	/** Accessible name of the close button, translated by the consumer. */
	closeLabel: string
	/**
	 * URL of a decorative video that loops behind the dialog. The asset belongs to the
	 * consumer (Podoba ships none). It plays muted and inline, is hidden from assistive
	 * tech, and is not shown at all with reduced motion.
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
	return (
		<ModalOverlay className="p-0" isOpen={isOpen} onOpenChange={onOpenChange} isDismissable>
			{backgroundVideo ? (
				<div aria-hidden="true" data-create-menu-video="" className="pointer-events-none absolute inset-0 overflow-hidden bg-surface-inverted motion-reduce:hidden">
					<video src={backgroundVideo} autoPlay muted loop playsInline className="h-full w-full object-cover brightness-125" />
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
						className="absolute end-4 top-3.5 z-10 h-8 w-8 rounded-md p-0 text-fg-muted"
					>
						<CloseIcon aria-hidden="true" className="h-4.5 w-4.5" />
					</Button>
					<header className="flex shrink-0 flex-col items-center gap-2 px-10 pt-8 md:pt-12">
						<DisplayHeading id={titleId} className="m-0 mb-4 whitespace-pre-line text-center text-[clamp(2rem,3vw,3rem)] leading-[1.05] tracking-[-0.02em]">
							{title}
						</DisplayHeading>
					</header>
					<div data-create-menu-body="" className="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
						{children}
					</div>
				</ModalDialog>
			</ModalSurface>
		</ModalOverlay>
	)
}
