import { useEffect, useRef } from 'react'

/** Wait until dialog focus scopes and slotted controls have mounted. */
export function useFieldAutoFocus(autoFocus: boolean | undefined) {
	const ref = useRef<HTMLDivElement>(null)
	useEffect(() => {
		if (!autoFocus) return
		const frame = requestAnimationFrame(() => {
			const control = ref.current?.querySelector<HTMLInputElement | HTMLTextAreaElement>('input, textarea')
			if (!control || control.disabled) return
			const active = control.ownerDocument.activeElement
			// Do not steal focus if the user or another field has already claimed it.
			if (
				active === control.ownerDocument.body ||
				active === control.closest('[role="dialog"], [role="alertdialog"]')
			) {
				control.focus({ preventScroll: true })
			}
		})
		return () => cancelAnimationFrame(frame)
	}, [autoFocus])
	return ref
}
