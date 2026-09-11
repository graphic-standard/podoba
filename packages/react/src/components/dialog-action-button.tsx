import { Button as AriaButton } from 'react-aria-components'
import { uic } from '../utils/uic'

export const DIALOG_ACTION_VARIANTS = ['primary', 'secondary'] as const
export type DialogActionVariant = (typeof DIALOG_ACTION_VARIANTS)[number]

/** Source UI dialog action, distinct from the frontend dashboard CTA Button.
 * Shares Button's semantic palette (brand-primary / surface-card) so the two never
 * drift apart; only the geometry — pill radius, 24/12 padding — is specific here.
 * Keyboard focus retains the shared RAC treatment.
 */
export const DialogActionButton = uic(AriaButton, {
	displayName: 'DialogActionButton',
	baseClass: 'inline-flex items-center justify-center rounded-full px-6 py-3 text-body font-medium leading-5 cursor-pointer transition-colors duration-200 motion-reduce:transition-none outline-none ' +
		'data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focus-visible]:ring-offset-2 ' +
		'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed data-[pending]:cursor-progress',
	variants: { variant: {
		primary: 'border-0 bg-brand-primary text-fg-inverted data-[hovered]:bg-neutral-600 data-[pressed]:bg-brand-primary',
		secondary: 'border border-border bg-surface-card text-fg data-[hovered]:bg-surface-muted data-[hovered]:border-border-muted data-[pressed]:bg-surface-muted',
	} },
	defaultVariants: { variant: 'primary' },
})
