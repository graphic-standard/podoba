import { useId, type ReactNode } from 'react'
import { Button } from './button'
import { ModalDialog, ModalOverlay, ModalSurface } from './dialog'
import { DisplayHeading } from './text'

/** Full-height creation menu with an optional decorative video backdrop. */
export function CreateMenuDialog({ isOpen, onOpenChange, title, closeLabel, backgroundVideo, children }: {
 isOpen: boolean
 onOpenChange: (open: boolean) => void
 title: ReactNode
 closeLabel: string
 backgroundVideo?: string
 children: ReactNode
}) {
 const titleId = useId()
 return <ModalOverlay className="p-0" isOpen={isOpen} onOpenChange={onOpenChange} isDismissable>
  {backgroundVideo ? <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden bg-surface-inverted"><video src={backgroundVideo} autoPlay muted loop playsInline className="h-full w-full object-cover brightness-125 motion-reduce:hidden" /></div> : null}
  <ModalSurface className="relative box-border flex h-9/10 max-h-324 w-9/10 max-w-432 flex-col overflow-hidden p-0 shadow-none max-md:h-23/25 max-md:w-24/25" data-settings-variant="catalog">
   <ModalDialog aria-labelledby={titleId} className="relative flex min-h-0 flex-1 flex-col gap-4 p-6 outline-none max-md:p-4">
    <Button variant="ghost" aria-label={closeLabel} onPress={() => onOpenChange(false)} className="absolute end-4 top-3.5 z-10 h-8 w-8 rounded-md p-0 text-fg-muted"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></Button>
    <header className="flex shrink-0 flex-col items-center gap-2 px-10 pt-8 md:pt-12"><DisplayHeading id={titleId} className="m-0 mb-4 whitespace-pre-line text-center text-[clamp(2rem,3vw,3rem)] leading-[1.05] tracking-[-0.02em]">{title}</DisplayHeading></header>
    <div className="min-h-0 flex-1 overflow-y-auto" style={{ scrollbarGutter: 'stable' }}>{children}</div>
   </ModalDialog>
  </ModalSurface>
 </ModalOverlay>
}
