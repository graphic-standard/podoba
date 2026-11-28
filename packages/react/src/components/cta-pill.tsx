import { createContext, forwardRef, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Button, type ButtonProps } from './button'

const ShortcutHint = createContext<string | undefined>(undefined)
const HoldProgress = createContext(false)

export interface CtaPillProps {
 lead: ReactNode
 emphasis?: ReactNode
 tail?: ReactNode
 children: ReactNode
 mobileHeader?: boolean
 tone?: 'brand' | 'neutral' | 'disabled'
 subHeading?: ReactNode
 /** Secondary action on a long press or Shift+F10. The consumer provides its content. */
 onOpenMenu?: () => void
 menuHint?: string
}

/** Shared header action surface. Business actions and menu content belong to the consumer. */
export function CtaPill({ lead, emphasis, tail, children, mobileHeader = false, tone = 'brand', subHeading, onOpenMenu, menuHint }: CtaPillProps) {
 const hintId = useId()
 const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
 const held = useRef(false)
 const [holding, setHolding] = useState(false)
 const origin = useRef<{ x: number; y: number } | null>(null)
 const clear = () => { if (timer.current) clearTimeout(timer.current); timer.current = null; setHolding(false) }
 useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
 const interactive = tone === 'brand' && Boolean(onOpenMenu)
 return <div className="relative h-full w-full" onPointerDownCapture={event => {
  if (!interactive || event.button !== 0 || (event.target instanceof Element && event.target.closest('button:disabled'))) return
  clear(); setHolding(true); held.current = false; origin.current = { x: event.clientX, y: event.clientY }
  timer.current = setTimeout(() => { held.current = true; setHolding(false); onOpenMenu?.() }, 750)
 }} onPointerMoveCapture={event => {
  if (origin.current && Math.hypot(event.clientX - origin.current.x, event.clientY - origin.current.y) > 12) clear()
 }} onPointerCancelCapture={clear} onPointerUpCapture={event => {
  clear(); origin.current = null
  if (held.current) { event.preventDefault(); event.stopPropagation() }
 }} onClickCapture={event => {
  if (held.current) { event.preventDefault(); event.stopPropagation(); held.current = false; return }
  if (tone !== 'brand') return
  const target = event.target
  if (target instanceof Element && !target.closest('button, a, input, [role="button"]')) event.currentTarget.querySelector<HTMLButtonElement>('button:not(:disabled)')?.click()
 }} onKeyDownCapture={event => {
  if (interactive && (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10'))) { event.preventDefault(); event.stopPropagation(); onOpenMenu?.() }
 }} onContextMenu={event => { if (held.current) event.preventDefault() }}>
  <ShortcutHint.Provider value={interactive && menuHint ? hintId : undefined}>
   <HoldProgress.Provider value={interactive && holding}>
   <style>{`@property --cta-hold-progress { syntax: "<percentage>"; inherits: false; initial-value: 0%; } @keyframes cta-hold-progress { from { --cta-hold-progress: 0%; } to { --cta-hold-progress: 100%; } }`}</style>
   {interactive && menuHint ? <span id={hintId} className="sr-only">{menuHint}</span> : null}
   <div className={[
    'box-border flex h-full min-h-16 w-full items-center justify-between gap-nav-x rounded-lg py-2.75 pr-3 pl-4.5',
    tone === 'brand' ? 'bg-brand-green' : tone === 'disabled' ? 'border border-border-muted bg-surface opacity-60' : 'border border-border-muted bg-transparent',
    mobileHeader && tone === 'brand' ? 'min-h-mobile-cta px-12 py-5 shadow-mobile-cta sm:min-h-16 sm:py-2.75 sm:pr-3 sm:pl-4.5 sm:shadow-none' : '',
   ].join(' ')}>
    <div className={`min-w-0 flex-1 text-heading4 font-medium leading-5 tracking-[-0.02em] ${tone === 'brand' ? 'text-fg-on-brand' : 'text-fg'}`}>
     <span>{lead}{emphasis ? <> <span className="font-semibold">{emphasis}</span></> : null}{tail ? <> {tail}</> : null}</span>
     {subHeading ? <span className="block text-label font-normal leading-4">{subHeading}</span> : null}
    </div>
    <div className="shrink-0">{children}</div>
   </div>
   </HoldProgress.Provider>
  </ShortcutHint.Provider>
 </div>
}

export interface CtaPillActionProps {
 children: ReactNode
 onClick?: ButtonProps['onClick']
 onPress?: ButtonProps['onPress']
 isDisabled?: boolean
 isPending?: ButtonProps['isPending']
 'aria-expanded'?: boolean
 'aria-label'?: string
 'data-testid'?: string
 coverParent?: boolean
}
export const CtaPillAction = forwardRef<HTMLButtonElement, CtaPillActionProps>(function CtaPillAction({ coverParent = false, ...props }, ref) {
 const hint = useContext(ShortcutHint)
 const holding = useContext(HoldProgress)
 return <Button {...props} ref={ref} variant="primary" size="md" aria-describedby={hint} aria-keyshortcuts={hint ? 'Shift+F10' : undefined} style={holding ? { border: '2px solid transparent', backgroundImage: 'linear-gradient(var(--color-surface-inverted), var(--color-surface-inverted)), conic-gradient(from 55deg, var(--color-fg-inverted) var(--cta-hold-progress), transparent 0)', backgroundOrigin: 'padding-box, border-box', backgroundClip: 'padding-box, border-box', animation: 'cta-hold-progress 750ms linear forwards' } : { border: '2px solid transparent' }} className={'bg-surface-inverted px-3 font-normal leading-[15.5px] tracking-[0] text-fg-inverted hover:bg-neutral-600 hover:shadow-none data-[pressed]:bg-surface-inverted data-[pressed]:shadow-none' + (coverParent ? " after:absolute after:inset-0 after:cursor-pointer after:content-['']" : '')} />
})
