import { useId, type ReactNode } from 'react'
import { Button } from './button'
import { ModalDialog, ModalOverlay, ModalSurface } from './dialog'
import { Heading } from './text'
import { Button as AriaButton } from 'react-aria-components'
import { uic } from '../utils/uic'

export const MemberSelectionGrid = uic('ul', { displayName: 'MemberSelectionGrid', baseClass: 'm-0 mt-8 grid list-none grid-cols-1 gap-3 p-0 max-[767px]:gap-2 min-[640px]:grid-cols-2 min-[768px]:grid-cols-3 min-[1024px]:grid-cols-4' })
export const TeamSelectionGrid = uic('ul', { displayName: 'TeamSelectionGrid', baseClass: 'm-0 mt-8 grid list-none grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 p-0' })
export const MemberSelectionCard = uic(AriaButton, {
	displayName: 'MemberSelectionCard',
	baseClass: 'flex w-full items-center gap-3 rounded-lg border border-border bg-surface-card p-4 text-start text-fg outline-none transition-all duration-200 data-[hovered]:-translate-y-0.5 data-[hovered]:border-brand-primary data-[hovered]:shadow-[0_4px_12px_rgba(0,0,0,0.1)] aria-pressed:border-brand-primary aria-pressed:bg-surface-muted data-[disabled]:cursor-default data-[disabled]:opacity-60 data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring',
})
export const TeamSelectionCard = uic(AriaButton, {
	displayName: 'TeamSelectionCard',
	baseClass: 'block w-full rounded-md border-2 border-border bg-transparent p-4 text-start text-fg outline-none transition-all duration-200 data-[hovered]:border-brand-primary aria-pressed:border-brand-primary aria-pressed:bg-surface-muted data-[disabled]:cursor-default data-[disabled]:opacity-60 data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring',
})
export const MemberSelectionInfo = uic('span', { displayName: 'MemberSelectionInfo', baseClass: 'min-w-0 flex-1' })
export const MemberSelectionName = uic('span', { displayName: 'MemberSelectionName', baseClass: 'mb-1 block text-heading5 font-medium text-fg' })
export const MemberSelectionEmail = uic('span', { displayName: 'MemberSelectionEmail', baseClass: 'block text-compact font-normal text-fg-subtle' })
export const TeamSelectionName = uic('span', { displayName: 'TeamSelectionName', baseClass: 'mb-1 block font-medium text-fg' })
export const TeamSelectionMeta = uic('span', { displayName: 'TeamSelectionMeta', baseClass: 'block text-small font-normal text-fg-subtle' })

/** Intrinsic-height form surface. The tall settings and catalog surfaces remain separate. */
export function CompactSettingsDialog({ isOpen, onOpenChange, isPending = false, title, description, closeLabel, children }: {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	isPending?: boolean
	title: string
	description: string
	closeLabel: string
	children: ReactNode
}) {
	const titleId = useId()
	const descriptionId = useId()
	return <ModalOverlay className="p-0" isOpen={isOpen} onOpenChange={open => { if (!isPending) onOpenChange(open) }} isDismissable={!isPending} isKeyboardDismissDisabled={isPending}>
		<ModalSurface className="relative w-[90vw] max-w-180 max-h-[85vh] overflow-y-auto p-5 min-[768px]:max-[1023px]:w-[85vw] max-[767px]:w-[calc(100vw-6*var(--spacing))] max-[767px]:max-w-[calc(100vw-6*var(--spacing))] max-[767px]:max-h-[calc(100vh-6*var(--spacing))]">
			<ModalDialog aria-labelledby={titleId} aria-describedby={descriptionId} className="outline-none">
				<Heading id={titleId} level="1" className="m-0 mb-4 max-w-5/6 tracking-normal">{title}</Heading>
				<p id={descriptionId} className="m-0 mb-6 max-w-5/6 text-small font-normal text-fg-workflow-muted">{description}</p>
				<div className="mt-4">{children}</div>
				<Button variant="ghost" aria-label={closeLabel} isDisabled={isPending} onPress={() => onOpenChange(false)} className="absolute end-4 top-3.5 h-8 w-8 rounded-md p-0 text-fg-subtle max-[767px]:end-3">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
				</Button>
			</ModalDialog>
		</ModalSurface>
	</ModalOverlay>
}
