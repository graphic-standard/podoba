import { useEffect } from 'react'

/**
 * Long press on touch → the same `contextmenu` event a right-click sends.
 *
 * Android Chrome already fires `contextmenu` when a finger is held; iOS Safari never
 * does. Rather than teach every surface a second gesture, one document-wide detector
 * turns a held touch into a `contextmenu` MouseEvent at the finger, so every
 * `onContextMenu` handler (ContextMenu's wrapper, `useContextMenu().open`, a grid's own
 * handler) opens on a phone with no change on the screen that uses it.
 *
 * It is mounted by those components, reference-counted, and does nothing for a mouse.
 *
 * One gesture opens at most one menu: whichever comes first, our event at
 * {@link LONG_PRESS_MS} or Android's own, wins and the other is swallowed.
 *
 * A long press counts as "consumed" only when something called `preventDefault()` on
 * the event, i.e. a menu actually opened. Only then does the detector:
 *  - cancel the press underneath (a synthetic `pointercancel`), so a card that is a
 *    React Aria button does not also activate when the finger lifts (React Aria clicks
 *    it itself 80 ms after a long press otherwise);
 *  - swallow the click the browser may still send for the lift;
 *  - clear a text selection the hold may have started.
 * A press on text with no menu behind it keeps the platform's own selection and callout.
 *
 * Our own `contextmenu` is stopped at `<html>`, after React's root handlers: a listener
 * on `document` (an app-wide fallback menu) never sees a long press, so iOS keeps text
 * selection on plain page content. The exception is an app whose React root is
 * `document` itself; its fallback should skip events where
 * {@link isLongPressContextMenu} is true.
 *
 * Cancelled by moving more than {@link LONG_PRESS_SLOP} px, a scroll of the page or of a
 * box around the finger, a second finger,
 * or the browser's own `pointercancel`. Text fields and open menu panels are left alone.
 */

/** How long a finger must rest before the menu opens. */
export const LONG_PRESS_MS = 500
/** How far (px) the finger may drift before the hold counts as a scroll or a drag. */
export const LONG_PRESS_SLOP = 10
/** The lift's compatibility click comes within this window after `pointerup`. */
const CLICK_GUARD_MS = 400
/** A second, native `contextmenu` for the same hold arrives within this window. */
const DUPLICATE_WINDOW_MS = 1000

/** Marks a context-menu target: text selection is held off while a finger rests on it. */
export const CONTEXT_MENU_TARGET_ATTRIBUTE = 'data-context-menu-target'
const TEXT_ENTRY = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])'
const MENU_PANEL = '[data-context-menu-panel]'

/** Per-target filter (a wrapper's `shouldOpen`), consulted before the selection lock. */
const targetFilters = new WeakMap<Element, (target: Element) => boolean>()

/** Registers the predicate that says which targets inside `element` open a menu. */
export function registerContextMenuTarget(element: Element, accepts: (target: Element) => boolean): () => void {
	targetFilters.set(element, accepts)
	return () => {
		if (targetFilters.get(element) === accepts) targetFilters.delete(element)
	}
}

interface Gesture {
	pointerId: number
	target: Element
	startX: number
	startY: number
	x: number
	y: number
	timer: ReturnType<typeof setTimeout> | undefined
	/** Our event went out, or Android's arrived first. */
	fired: boolean
	/** The menu came from Android's own event, not ours. */
	native: boolean
	consumed: boolean
	unlock: (() => void) | undefined
}

let gesture: Gesture | null = null
let lastConsumedAt = -Infinity
let clickGuardUntil = -Infinity
let dispatching: Event | null = null
let consumers = 0

const now = () => performance.now()

const LONG_PRESS = Symbol.for('podoba.longPress')

/** True for the `contextmenu` the detector sends on a touch long press. */
export function isLongPressContextMenu(event: { nativeEvent?: Event } | Event): boolean {
	const native = 'nativeEvent' in event && event.nativeEvent ? event.nativeEvent : (event as Event)
	return (native as unknown as Record<symbol, unknown>)[LONG_PRESS] === true
}

function lockSelection(target: Element): (() => void) | undefined {
	const host = target.closest(`[${CONTEXT_MENU_TARGET_ATTRIBUTE}]`)
	if (!(host instanceof HTMLElement)) return undefined
	if (targetFilters.get(host)?.(target) === false) return undefined
	// Inline on the target, not on <html> like React Aria's press does: the two would
	// save and restore each other's value and could leave the page unselectable.
	const style = host.style
	const previous = [style.getPropertyValue('user-select'), style.getPropertyValue('-webkit-user-select')] as const
	style.setProperty('user-select', 'none')
	style.setProperty('-webkit-user-select', 'none')
	return () => {
		if (previous[0]) style.setProperty('user-select', previous[0])
		else style.removeProperty('user-select')
		if (previous[1]) style.setProperty('-webkit-user-select', previous[1])
		else style.removeProperty('-webkit-user-select')
	}
}

function end(g: Gesture) {
	clearTimeout(g.timer)
	g.unlock?.()
	if (g.consumed) clickGuardUntil = now() + CLICK_GUARD_MS
	if (gesture === g) gesture = null
}

function consume(g: Gesture) {
	if (g.consumed) return
	g.consumed = true
	lastConsumedAt = now()
	globalThis.getSelection?.()?.removeAllRanges()
	// End whatever press the hold started underneath, without ending our gesture.
	if (typeof PointerEvent === 'function') {
		const cancel = new PointerEvent('pointercancel', {
			bubbles: true,
			pointerId: g.pointerId,
			pointerType: 'touch',
			isPrimary: true,
		})
		dispatching = cancel
		try {
			g.target.dispatchEvent(cancel)
		} finally {
			dispatching = null
		}
	}
}

function fire() {
	const g = gesture
	if (!g || g.fired) return
	g.fired = true
	const event = new MouseEvent('contextmenu', {
		bubbles: true,
		cancelable: true,
		composed: true,
		button: 2,
		clientX: g.x,
		clientY: g.y,
	})
	Object.defineProperty(event, LONG_PRESS, { value: true })
	dispatching = event
	try {
		g.target.dispatchEvent(event)
	} finally {
		dispatching = null
	}
	if (event.defaultPrevented) consume(g)
}

const onPointerDown = (event: PointerEvent) => {
	if (event === dispatching || event.pointerType === 'mouse') return
	if (gesture) end(gesture)
	// A second finger is a pinch, not a hold.
	if (!event.isPrimary) return
	const target = event.target
	if (!(target instanceof Element) || target.closest(TEXT_ENTRY) || target.closest(MENU_PANEL)) return
	const g: Gesture = {
		pointerId: event.pointerId,
		target,
		startX: event.clientX,
		startY: event.clientY,
		x: event.clientX,
		y: event.clientY,
		timer: undefined,
		fired: false,
		native: false,
		consumed: false,
		unlock: lockSelection(target),
	}
	g.timer = setTimeout(fire, LONG_PRESS_MS)
	gesture = g
}

const onPointerMove = (event: PointerEvent) => {
	const g = gesture
	if (!g || event.pointerId !== g.pointerId || g.fired) return
	g.x = event.clientX
	g.y = event.clientY
	if (Math.hypot(g.x - g.startX, g.y - g.startY) > LONG_PRESS_SLOP) end(g)
}

const onPointerEnd = (event: PointerEvent) => {
	if (event === dispatching) return
	const g = gesture
	if (g && event.pointerId === g.pointerId) end(g)
}

/** A scroll of the page or of a box around the finger; a carousel elsewhere is not. */
const onScroll = (event: Event) => {
	const g = gesture
	if (!g || g.fired) return
	const scrolled = event.target
	// Not a node: the window itself, i.e. the page.
	if (!(scrolled instanceof Node) || scrolled === document || scrolled.contains(g.target)) end(g)
}

const onSelectStart = (event: Event) => {
	if (gesture?.unlock || gesture?.consumed) event.preventDefault()
}

const onClick = (event: MouseEvent) => {
	if (now() > clickGuardUntil) return
	clickGuardUntil = -Infinity
	event.preventDefault()
	event.stopImmediatePropagation()
}

const swallow = (event: Event) => {
	event.preventDefault()
	event.stopImmediatePropagation()
}

/** Window capture: decides which of the two events for one hold goes through. */
const onContextMenuCapture = (event: MouseEvent) => {
	if (event === dispatching) return
	const fromMouse = (event as Partial<PointerEvent>).pointerType === 'mouse'
	const g = gesture
	if (!g) {
		// The hold already ended (the browser may cancel the pointer first). A touch
		// `contextmenu` right after a consumed long press is its duplicate.
		if (!fromMouse && now() - lastConsumedAt < DUPLICATE_WINDOW_MS) swallow(event)
		return
	}
	if (g.fired) {
		if (g.consumed) swallow(event)
		return
	}
	// Android's own event came first: it is the long press. Ours stays unsent.
	clearTimeout(g.timer)
	g.fired = true
	g.native = true
	// Read the outcome once the event has been through every handler.
	setTimeout(() => {
		if (event.defaultPrevented && gesture === g) consume(g)
		else if (event.defaultPrevented) lastConsumedAt = now()
	}, 0)
}

/**
 * Whether React renders into `document` itself (`hydrateRoot(document, …)`, as
 * full-document SSR frameworks do). React then listens on `document`, so stopping at
 * `<html>` would keep every `onContextMenu` handler from running.
 */
function documentIsReactRoot(): boolean {
	// React clears the key to null on unmount rather than deleting it.
	const props = document as unknown as Record<string, unknown>
	return Object.keys(document).some((key) => key.startsWith('__reactContainer$') && props[key] != null)
}

/**
 * `<html>` bubble: our event stops after React's root, before `document` listeners.
 * Not when the root IS `document`: there an app-wide fallback on `document` sees the
 * long press too and should skip it with {@link isLongPressContextMenu}.
 */
const onContextMenuBubble = (event: MouseEvent) => {
	if (event === dispatching && isLongPressContextMenu(event) && !documentIsReactRoot()) event.stopPropagation()
}

function install() {
	const options = { capture: true, passive: true } as const
	window.addEventListener('pointerdown', onPointerDown, options)
	window.addEventListener('pointermove', onPointerMove, options)
	window.addEventListener('pointerup', onPointerEnd, options)
	window.addEventListener('pointercancel', onPointerEnd, options)
	window.addEventListener('scroll', onScroll, options)
	window.addEventListener('selectstart', onSelectStart, true)
	window.addEventListener('click', onClick, true)
	window.addEventListener('contextmenu', onContextMenuCapture, true)
	document.documentElement.addEventListener('contextmenu', onContextMenuBubble)
}

function uninstall() {
	window.removeEventListener('pointerdown', onPointerDown, true)
	window.removeEventListener('pointermove', onPointerMove, true)
	window.removeEventListener('pointerup', onPointerEnd, true)
	window.removeEventListener('pointercancel', onPointerEnd, true)
	window.removeEventListener('scroll', onScroll, true)
	window.removeEventListener('selectstart', onSelectStart, true)
	window.removeEventListener('click', onClick, true)
	window.removeEventListener('contextmenu', onContextMenuCapture, true)
	document.documentElement.removeEventListener('contextmenu', onContextMenuBubble)
	if (gesture) end(gesture)
	lastConsumedAt = -Infinity
	clickGuardUntil = -Infinity
}

/** Turns the long-press detector on while the calling component is mounted. */
export function retainLongPressContextMenu(): () => void {
	if (consumers++ === 0) install()
	let released = false
	return () => {
		if (released) return
		released = true
		if (--consumers === 0) uninstall()
	}
}

/**
 * Makes a touch long press send `contextmenu` while this component is mounted.
 * ContextMenu and useContextMenu call it; a surface with its own `onContextMenu` and
 * no podoba menu can call it too.
 */
export function useLongPressContextMenu(): void {
	useEffect(() => retainLongPressContextMenu(), [])
}
