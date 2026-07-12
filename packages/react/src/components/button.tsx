import { Button as RACButton, type ButtonProps as RACButtonProps } from 'react-aria-components'
import { uic } from '../utils/uic'

/**
 * Button — management SPA action button.
 *
 * Built on React Aria Components `Button` (full keyboard + ARIA + press
 * handling for free) wrapped with `uic` for type-safe Tailwind variants.
 */
export const Button = uic(RACButton, {
	displayName: 'Button',
	// gs `Button.module.scss`: pill radius, FIXED 13px / weight-400 text (`text-compact`)
	// on every size — size variants change PADDING ONLY, never the text scale. 200ms
	// ease-in-out transition.
	baseClass:
		'inline-flex items-center justify-center gap-2 rounded-full text-compact leading-4 transition-all duration-200 ease-in-out ' +
		'outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focus-visible]:ring-offset-2 ' +
		'data-[disabled]:opacity-50 data-[disabled]:pointer-events-none ' +
		'data-[pending]:opacity-70 data-[pending]:cursor-progress',
	variants: {
		variant: {
			// primary (gs `_primary`): base neutral-400 (#242423 = surface-inverted) →
			// hover neutral-600 (#333333) + `0 0 5px rgba(0,0,0,.5)` shadow → active back
			// to neutral-400 (surface-inverted, no shadow).
			primary:
				'bg-surface-inverted text-fg-inverted hover:bg-neutral-600 hover:shadow-[0_0_5px_0_rgba(0,0,0,0.5)] data-[pressed]:bg-surface-inverted data-[pressed]:shadow-none',
			// secondary: #f7f6f2 (surface-card) + 1px #eceae1 (border); hover bg #eceae1
			// (surface-muted) + border #aba89c (fg-subtle); active bg #eceae1.
			secondary:
				'bg-surface-card text-fg border border-border hover:bg-surface-muted hover:border-fg-subtle data-[pressed]:bg-surface-muted',
			// ghost: transparent → hover/active #eceae1 (surface-muted).
			ghost: 'bg-transparent text-fg hover:bg-surface-muted data-[pressed]:bg-surface-muted',
			// destructive: #ef4444 → danger token; hover/active dim via opacity (gs parity).
			destructive: 'bg-danger text-danger-fg hover:opacity-90 data-[pressed]:opacity-80',
		},
		size: {
			// gs sizes: PADDING ONLY (spacing-2/4, 3/6, 4/8) — text is a fixed 13px/400
			// from the base, never a size-scaled ramp.
			sm: 'py-2 px-4',
			md: 'py-3 px-6',
			lg: 'py-4 px-8',
		},
	},
	defaultVariants: {
		variant: 'primary',
		size: 'md',
	},
})

export type ButtonProps = RACButtonProps & {
	variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
	size?: 'sm' | 'md' | 'lg'
}
