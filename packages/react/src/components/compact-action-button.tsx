import { Button as AriaButton } from 'react-aria-components'
import { uic } from '../utils/uic'

export const COMPACT_ACTION_VARIANTS = ['primary', 'linear'] as const
export type CompactActionVariant = (typeof COMPACT_ACTION_VARIANTS)[number]

/** Compact Manager action; separate from the larger primitive dialog actions.
 * Same semantic palette as Button / DialogActionButton. The hover shadow is the
 * literal Button already uses — no shadow token covers a button lift, and the two
 * must match. */
export const CompactActionButton = uic(AriaButton, {
	displayName: 'CompactActionButton',
	baseClass: 'inline-flex items-center justify-center rounded-full px-3.5 py-1 text-compact font-normal leading-[normal] cursor-pointer transition-all duration-120 ease-[ease] motion-reduce:transition-none outline-none ' +
		'data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focus-visible]:ring-offset-2 ' +
		'data-[hovered]:shadow-[0_0_5px_0_rgba(0,0,0,0.5)] data-[pressed]:shadow-none data-[disabled]:shadow-none data-[disabled]:cursor-not-allowed',
	variants: { variant: {
		primary: 'border-0 bg-brand-primary text-fg-inverted data-[hovered]:bg-neutral-600 data-[pressed]:bg-brand-primary data-[disabled]:bg-fg-subtle',
		linear: 'border border-brand-primary bg-transparent text-brand-primary data-[hovered]:bg-surface-muted data-[pressed]:bg-transparent data-[disabled]:border-fg-subtle data-[disabled]:text-fg-subtle',
	} },
	defaultVariants: { variant: 'primary' },
})
