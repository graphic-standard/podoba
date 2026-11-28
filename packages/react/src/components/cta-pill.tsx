import { createContext, forwardRef, useContext, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Button, type ButtonProps } from './button'

const ShortcutHint = createContext<string | undefined>(undefined)
/** What the action needs to draw the hold ring: whether to, whether a hold runs, how long it lasts. */
const HoldRing = createContext<{ feedback: boolean; holding: boolean; ms: number }>({ feedback: false, holding: false, ms: 550 })

/** A press on a disabled action is not a hold: nothing would follow it. */
const DISABLED_ACTION = 'button:disabled, [aria-disabled="true"], [data-disabled]'

/**
 * Whether a press landed on a disabled action in this pill. A disabled `Button` has
 * `pointer-events: none`, so the browser sends the press to whatever is under it (the
 * action's wrapper, the pill), never to the button: read the pointer's position
 * against each disabled action instead of the event target. Scoped to the pill, so a
 * disabled ancestor outside it changes nothing.
 */
function pressOnDisabledAction(pill: Element, x: number, y: number): boolean {
 for (const action of pill.querySelectorAll(DISABLED_ACTION)) {
  const r = action.getBoundingClientRect()
  if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return true
 }
 return false
}

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
 /** How long a press must rest before it opens the menu, in ms. Defaults to 550. */
 holdMs?: number
 /** Draw a ring around the action that fills while a hold runs, so a press that is
  * turning into a hold shows it. Off by default. */
 holdFeedback?: boolean
 /** Put the action under the text, aligned to the end, instead of beside it. For a
  * pill with a `subHeading` in a narrow column. Off by default. */
 stacked?: boolean
}

/** Shared header action surface. Business actions and menu content belong to the consumer. */
export function CtaPill({ lead, emphasis, tail, children, mobileHeader = false, tone = 'brand', subHeading, onOpenMenu, menuHint, holdMs = 550, holdFeedback = false, stacked = false }: CtaPillProps) {
 const hintId = useId()
 const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
 const held = useRef(false)
 const [holding, setHolding] = useState(false)
 const origin = useRef<{ x: number; y: number } | null>(null)
 const clear = () => { if (timer.current) clearTimeout(timer.current); timer.current = null; setHolding(false) }
 useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
 const interactive = tone === 'brand' && Boolean(onOpenMenu)
 return <div className="relative h-full w-full" onPointerDownCapture={event => {
  if (!interactive || event.button !== 0) return
  if (pressOnDisabledAction(event.currentTarget, event.clientX, event.clientY)) return
  clear(); held.current = false; origin.current = { x: event.clientX, y: event.clientY }
  if (holdFeedback) setHolding(true)
  timer.current = setTimeout(() => { held.current = true; setHolding(false); onOpenMenu?.() }, holdMs)
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
 // While a hold runs too: a touch platform raises its own long-press contextmenu
 // (~500 ms) before a longer holdMs ends, and its menu or selection would win.
 // A right click never starts a hold, so desktop menus are untouched.
 }} onContextMenu={event => { if (held.current || timer.current) event.preventDefault() }}>
  <ShortcutHint.Provider value={interactive && menuHint ? hintId : undefined}>
  <HoldRing.Provider value={{ feedback: interactive && holdFeedback, holding: interactive && holding, ms: holdMs }}>
   {interactive && menuHint ? <span id={hintId} className="sr-only">{menuHint}</span> : null}
   <div className={[
    'box-border flex h-full min-h-16 w-full justify-between rounded-lg py-2.75 pr-3 pl-4.5',
    stacked ? 'flex-col items-stretch gap-3' : 'items-center gap-nav-x',
    tone === 'brand' ? 'bg-brand-green' : tone === 'disabled' ? 'border border-border-muted bg-surface opacity-60' : 'border border-border-muted bg-transparent',
    mobileHeader && tone === 'brand' ? 'min-h-mobile-cta px-12 py-5 shadow-mobile-cta sm:min-h-16 sm:py-2.75 sm:pr-3 sm:pl-4.5 sm:shadow-none' : '',
   ].join(' ')}>
    <div className={`min-w-0 flex-1 text-heading4 font-medium leading-5 tracking-[-0.02em] ${tone === 'brand' ? 'text-fg-on-brand' : 'text-fg'}`}>
     <span>{lead}{emphasis ? <> <span className="font-semibold">{emphasis}</span></> : null}{tail ? <> {tail}</> : null}</span>
     {subHeading ? <span className="block text-label font-normal leading-4">{subHeading}</span> : null}
    </div>
    <div className={stacked ? 'max-w-full shrink-0 self-end' : 'shrink-0'}>{children}</div>
   </div>
  </HoldRing.Provider>
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
// The ring is a second background layer on the border box, under the button's own
// fill on the padding box; the transparent 2px border is where it shows. The border
// is there whenever feedback is on, so starting a hold does not resize the button.
// The sweep starts at the top (0deg) and runs clockwise. With reduced motion there is
// no sweep: the ring shows full for as long as the hold runs.
const ringIdle: CSSProperties = { border: '2px solid transparent' }
const ringHolding = (ms: number): CSSProperties => ({
 ...ringIdle,
 backgroundImage: 'linear-gradient(var(--color-surface-inverted), var(--color-surface-inverted)), conic-gradient(from 0deg, var(--color-fg-inverted) var(--cta-hold-progress), transparent 0)',
 backgroundOrigin: 'padding-box, border-box',
 backgroundClip: 'padding-box, border-box',
 ['--cta-hold-duration' as string]: `${ms}ms`,
})

export const CtaPillAction = forwardRef<HTMLButtonElement, CtaPillActionProps>(function CtaPillAction({ coverParent = false, ...props }, ref) {
 const hint = useContext(ShortcutHint)
 const ring = useContext(HoldRing)
 return <Button {...props} ref={ref} variant="primary" size="md" aria-describedby={hint} aria-keyshortcuts={hint ? 'Shift+F10' : undefined}
  data-holding={ring.holding ? '' : undefined}
  style={ring.feedback ? (ring.holding ? ringHolding(ring.ms) : ringIdle) : undefined}
  className={'bg-surface-inverted px-3 font-normal leading-[15.5px] tracking-[0] text-fg-inverted data-[pressed]:bg-surface-inverted' + (ring.holding ? ' animate-cta-hold motion-reduce:animate-none motion-reduce:[--cta-hold-progress:100%]' : '') + (coverParent ? " after:absolute after:inset-0 after:cursor-pointer after:content-['']" : '')} />
})
