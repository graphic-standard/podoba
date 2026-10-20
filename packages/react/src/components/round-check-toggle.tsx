import { ToggleButton, type ToggleButtonProps } from 'react-aria-components'
import { uic } from '../utils/uic'

/** GS output-annotation done control, shared without task or billing logic. */
const RoundCheckControl = uic(ToggleButton, {
	displayName: 'RoundCheckControl',
	baseClass: 'grid h-6 w-6 shrink-0 place-items-center rounded-full border border-border bg-surface-card text-fg-subtle outline-none transition-colors data-[hovered]:border-fg-subtle data-[hovered]:text-fg data-[selected]:border-brand-green data-[selected]:bg-brand-green data-[selected]:text-fg-on-brand data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[disabled]:cursor-default',
})

export type RoundCheckToggleProps = Omit<ToggleButtonProps, 'children' | 'aria-label' | 'className'> & {
	/** Required accessible name; the consumer supplies its translated item/action. */
	'aria-label': string
	className?: string
}

export function RoundCheckToggle(props: RoundCheckToggleProps) {
	return <RoundCheckControl {...props}>
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7" /></svg>
	</RoundCheckControl>
}
