import type { ReactNode } from 'react'
import { Button } from './button'
import { uic } from '../utils/uic'

/** Shared Studio/editor island. The app owns commands and selection retention. */
export const IslandToolbar = uic('div', {
	displayName: 'IslandToolbar',
	baseClass:
		'flex max-w-full items-center gap-1 overflow-x-auto rounded-full bg-surface-inverted px-2 py-1 text-fg-inverted shadow-lg',
	defaultProps: { role: 'toolbar' },
})
export const IslandToolbarSeparator = uic('span', {
	displayName: 'IslandToolbarSeparator',
	baseClass: 'mx-1 h-5 w-px shrink-0 bg-white/25',
	defaultProps: { 'aria-hidden': true },
})
const Control = uic(Button, {
	displayName: 'IslandToolbarControl',
	baseClass:
		'group/island-control h-8 min-w-8 shrink-0 justify-center gap-0 rounded-full px-2 py-0 text-fg-inverted hover:gap-2 hover:bg-white/15 focus-visible:gap-2 aria-pressed:bg-white/20',
	defaultVariants: { variant: 'ghost', size: 'sm' },
})
export function IslandToolbarButton({
	label,
	icon,
	...props
}: Omit<Parameters<typeof Control>[0], 'children'> & { label: string; icon: ReactNode }) {
	return (
		<Control {...props} aria-label={label}>
			{icon}
			<span
				aria-hidden="true"
				className="max-w-0 overflow-hidden truncate whitespace-nowrap text-compact font-normal leading-4 opacity-0 transition-[max-width,opacity] duration-150 group-hover/island-control:max-w-40 group-hover/island-control:opacity-100 group-focus-visible/island-control:max-w-40 group-focus-visible/island-control:opacity-100 motion-reduce:transition-none"
			>
				{label}
			</span>
		</Control>
	)
}
