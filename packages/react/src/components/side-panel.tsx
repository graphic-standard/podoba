import type { ReactNode } from 'react'
import {
	Button as RACButton,
	Dialog as RACDialog,
	Heading,
	Modal as RACModal,
	ModalOverlay as RACModalOverlay,
} from 'react-aria-components'

import { uic } from '../utils/uic'

export type SidePanelSize = 'sm' | 'md' | 'lg'

export interface SidePanelProps {
	/** Controlled open state. */
	isOpen: boolean
	/** Called for Escape, backdrop dismissal and the close control. */
	onOpenChange: (isOpen: boolean) => void
	/** Accessible panel title. */
	title: ReactNode
	/** Optional supporting copy below the title. */
	description?: ReactNode
	/** App-supplied localized label for the close control. */
	closeLabel: string
	/** Panel width from the shared responsive scale. */
	size?: SidePanelSize
	/** Disable Escape/backdrop dismissal while a critical operation is pending. */
	isDismissable?: boolean
	/** Owned-scroll panel content. */
	children: ReactNode | ((options: { close: () => void }) => ReactNode)
	/** Optional pinned action area below the scroll region. */
	footer?: ReactNode | ((options: { close: () => void }) => ReactNode)
	/** Optional test id forwarded to the dialog element. */
	'data-testid'?: string
}

const SidePanelOverlay = uic(RACModalOverlay, {
	displayName: 'SidePanel.Overlay',
	baseClass:
		'fixed inset-0 z-50 flex justify-end bg-modal-backdrop backdrop-blur-modal-backdrop ' +
		'data-[entering]:animate-modal-overlay-in data-[exiting]:animate-modal-overlay-out ' +
		'motion-reduce:data-[entering]:animate-none motion-reduce:data-[exiting]:animate-none',
})

const SidePanelSurface = uic(RACModal, {
	displayName: 'SidePanel.Surface',
	baseClass:
		'ml-auto flex h-dvh w-full flex-col overflow-hidden bg-surface outline-none shadow-modal-surface ' +
		'sm:rounded-l-lg data-[entering]:animate-side-panel-in data-[exiting]:animate-side-panel-out ' +
		'motion-reduce:data-[entering]:animate-none motion-reduce:data-[exiting]:animate-none',
	variants: {
		size: {
			sm: 'sm:max-w-sm',
			md: 'sm:max-w-md',
			lg: 'sm:max-w-lg',
		},
	},
	defaultVariants: { size: 'md' },
})

const SidePanelClose = uic(RACButton, {
	displayName: 'SidePanel.Close',
	baseClass:
		'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-fg-subtle outline-none ' +
		'transition-colors hover:bg-surface-muted hover:text-fg ' +
		'data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focus-visible]:ring-offset-2',
})

/**
 * Responsive modal side panel.
 *
 * React Aria owns focus containment, Escape/backdrop dismissal, scroll locking
 * and trigger focus return. The surface is a full-screen owned-scroll sheet on
 * mobile and a right-aligned panel on larger viewports. All copy and product
 * content are supplied by the consuming application.
 */
export function SidePanel({
	isOpen,
	onOpenChange,
	title,
	description,
	closeLabel,
	size = 'md',
	isDismissable = true,
	children,
	footer,
	'data-testid': testId,
}: SidePanelProps): React.ReactNode {
	return (
		<SidePanelOverlay
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			isDismissable={isDismissable}
		>
			<SidePanelSurface size={size}>
				<RACDialog
					data-testid={testId}
					className="flex min-h-0 flex-1 flex-col outline-none"
				>
					{renderProps => (
						<>
							<header className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4">
								<div className="min-w-0 pt-1">
									<Heading slot="title" className="text-heading1 font-medium tracking-tight text-fg">
										{title}
									</Heading>
									{description ? (
										<p className="mt-1 text-small text-fg-muted">{description}</p>
									) : null}
								</div>
								<SidePanelClose aria-label={closeLabel} onClick={() => onOpenChange(false)}>
									<svg
										width="20"
										height="20"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										aria-hidden="true"
									>
										<path d="M6 6l12 12M18 6 6 18" />
									</svg>
								</SidePanelClose>
							</header>
							<div className="min-h-0 flex-1 overflow-y-auto p-5">
								{typeof children === 'function' ? children(renderProps) : children}
							</div>
							{footer ? (
								<footer className="shrink-0 border-t border-border px-5 pt-4 pb-mobile-cta-bottom sm:pb-4">
									{typeof footer === 'function' ? footer(renderProps) : footer}
								</footer>
							) : null}
						</>
					)}
				</RACDialog>
			</SidePanelSurface>
		</SidePanelOverlay>
	)
}
