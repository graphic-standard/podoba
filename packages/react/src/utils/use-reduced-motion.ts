import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

const subscribe = (change: () => void) => {
	if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {}
	const media = window.matchMedia(QUERY)
	media.addEventListener?.('change', change)
	return () => media.removeEventListener?.('change', change)
}
const snapshot = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(QUERY).matches

/**
 * Whether the user asked for reduced motion, known on the first client render (read
 * synchronously, unlike an effect), so a component can skip mounting something heavy
 * such as an autoplaying video instead of mounting it and hiding it. `false` on the
 * server.
 */
export function useReducedMotion(): boolean {
	return useSyncExternalStore(subscribe, snapshot, () => false)
}
