import type { ComponentProps, ReactNode } from 'react'
import { uic } from '../utils/uic'

// Extracted from GS outputs-actions-panel: same typography, spacing and glyph.
const InlineAlertRoot = uic('p', {
	displayName: 'InlineAlertRoot',
	baseClass: 'flex items-start gap-2 text-caption text-danger',
})

export type InlineAlertProps = Omit<ComponentProps<'p'>, 'children'> & {
	/** Consumer-provided, translated message. */
	children: ReactNode
}

export function InlineAlert({ children, role = 'alert', ...props }: InlineAlertProps) {
	return <InlineAlertRoot {...props} role={role}>
		<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
			<path d="M10.3 3.9 1.8 18.5a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
			<path d="M12 9v4" /><path d="M12 17h.01" />
		</svg>
		<span>{children}</span>
	</InlineAlertRoot>
}
