import { useEffect, useId, useRef } from 'react'
import { uic } from '../utils/uic'

export interface ContextSearchPanelProps {
	isOpen: boolean
	value: string
	onChange: (value: string) => void
	onClose: () => void
	label: string
	placeholder: string
	clearLabel: string
	closeLabel: string
}
const SearchInput = uic('input', { displayName: 'ContextSearchPanelInput', baseClass: 'min-h-[38px] min-w-0 w-full rounded-lg border border-border bg-surface px-3 text-body text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring' })
const ActionButton = uic('button', { displayName: 'ContextSearchPanelButton', baseClass: 'min-h-[38px] rounded-lg border border-border bg-surface-card px-3 text-small font-medium text-fg cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring' })

export function ContextSearchPanel({ isOpen, value, onChange, onClose, label, placeholder, clearLabel, closeLabel }: ContextSearchPanelProps) {
	const panelRef = useRef<HTMLDivElement>(null)
	const inputRef = useRef<HTMLInputElement>(null)
	const closeRef = useRef(onClose)
	closeRef.current = onClose
	const inputId = useId()
	useEffect(() => {
		if (!isOpen) return
		inputRef.current?.focus()
		const key = (event: KeyboardEvent) => { if (event.key === 'Escape') closeRef.current() }
		const mouse = (event: MouseEvent) => {
			if (event.target instanceof Node && !panelRef.current?.contains(event.target)) closeRef.current()
		}
		document.addEventListener('keydown', key)
		document.addEventListener('mousedown', mouse)
		return () => {
			document.removeEventListener('keydown', key)
			document.removeEventListener('mousedown', mouse)
		}
	}, [isOpen])
	if (!isOpen) return null
	return (
		<div className="relative shrink-0" role="search" aria-label={label}>
			<div ref={panelRef} className="absolute right-0 top-[calc(100%+0.5rem)] z-[5] w-[min(40vw,32rem)] min-w-96 rounded-lg border border-border-muted bg-surface p-2 shadow-[0_12px_30px_color-mix(in_srgb,var(--color-fg)_14%,transparent)] max-[1023px]:left-0 max-[1023px]:right-auto max-[1023px]:w-[min(90vw,32rem)] max-[1023px]:min-w-[min(90vw,24rem)]">
				<label className="sr-only" htmlFor={inputId}>{label}</label>
				<div className="flex items-center gap-2">
					<SearchInput ref={inputRef} id={inputId} value={value} onChange={event => onChange(event.currentTarget.value)} placeholder={placeholder} />
					{value ? <ActionButton type="button" onClick={() => onChange('')}>{clearLabel}</ActionButton> : null}
					<ActionButton type="button" onClick={onClose}>{closeLabel}</ActionButton>
				</div>
			</div>
		</div>
	)
}
