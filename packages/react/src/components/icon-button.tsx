import type { ComponentProps, ReactNode } from 'react'
import { Button } from './button'
import { Tooltip, TooltipTrigger } from './tooltip'

/** The shared 36 px ghost action and its hover/keyboard hint. */
export function IconButton({
	label,
	children,
	className,
	...props
}: Omit<ComponentProps<typeof Button>, 'children' | 'aria-label'> & { label: string; children: ReactNode }) {
	return (
		<TooltipTrigger>
			<Button variant="ghost" {...props} aria-label={label} className={`h-9 w-9 shrink-0 p-0 ${className ?? ''}`}>
				{children}
			</Button>
			<Tooltip>{label}</Tooltip>
		</TooltipTrigger>
	)
}
