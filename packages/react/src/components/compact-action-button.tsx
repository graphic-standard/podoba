import { Button as AriaButton } from 'react-aria-components'
import { z } from 'zod'
import { uic } from '../utils/uic'

export const compactActionVariantSchema = z.enum(['primary', 'linear'])

/** Compact Manager action; separate from the larger primitive dialog actions. */
export const CompactActionButton = uic(AriaButton, {
	displayName: 'CompactActionButton',
	baseClass: 'inline-flex items-center justify-center rounded-full px-3.5 py-1 text-compact font-normal leading-[normal] cursor-pointer transition-all duration-120 ease-[ease] motion-reduce:transition-none outline-none ' +
		'data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focus-visible]:ring-offset-2 ' +
		'data-[hovered]:shadow-(--shadow-action-compact-hover) data-[pressed]:shadow-none data-[disabled]:shadow-none data-[disabled]:cursor-not-allowed',
	variants: { variant: {
		primary: 'border-0 bg-(--color-action-solid-hover) text-(--color-action-solid-fg) data-[hovered]:bg-neutral-600 data-[pressed]:bg-(--color-action-solid-hover) data-[disabled]:bg-(--color-action-compact-muted)',
		linear: 'border border-(--color-action-solid-hover) bg-transparent text-(--color-action-solid-hover) data-[hovered]:bg-(--color-action-compact-muted) data-[pressed]:bg-transparent data-[disabled]:border-(--color-action-compact-muted) data-[disabled]:text-(--color-action-compact-muted)',
	} },
	defaultVariants: { variant: 'primary' },
})
