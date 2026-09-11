import { Button as AriaButton } from 'react-aria-components'
import { z } from 'zod'
import { uic } from '../utils/uic'

export const dialogActionVariantSchema = z.enum(['primary', 'secondary'])

/** Source UI dialog action, distinct from the frontend dashboard CTA Button.
 * Palette uses semantic tokens; keyboard focus retains the shared RAC treatment.
 */
export const DialogActionButton = uic(AriaButton, {
	displayName: 'DialogActionButton',
	baseClass: 'inline-flex items-center justify-center rounded-full px-6 py-3 text-body font-medium leading-5 cursor-pointer transition-colors duration-200 motion-reduce:transition-none outline-none ' +
		'data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focus-visible]:ring-offset-2 ' +
		'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed data-[pending]:cursor-progress',
	variants: { variant: {
		primary: 'border-0 bg-(--color-action-solid) text-(--color-action-solid-fg) data-[hovered]:bg-(--color-action-solid-hover) data-[pressed]:bg-(--color-action-solid-pressed)',
		secondary: 'border border-border bg-(--color-action-soft) text-fg data-[hovered]:bg-(--color-action-soft-hover) data-[hovered]:border-(--color-action-soft-border-hover) data-[pressed]:bg-(--color-action-soft-pressed)',
	} },
	defaultVariants: { variant: 'primary' },
})
