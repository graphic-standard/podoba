import { RoundCheckToggle } from './round-check-toggle'

export const examples = {
	default: () => <RoundCheckToggle aria-label="Mark comment complete" />,
	states: () => <div className="flex items-center gap-3"><RoundCheckToggle aria-label="Open comment" /><RoundCheckToggle aria-label="Completed comment" defaultSelected /></div>,
	disabled: () => <div className="flex items-center gap-3"><RoundCheckToggle aria-label="Open read-only item" isDisabled /><RoundCheckToggle aria-label="Completed read-only item" defaultSelected isDisabled /></div>,
}
export const meta = { category: 'Primitives', description: 'GS 24px circular check toggle. Space/Enter toggle aria-pressed; selected uses brand-green. Labels and persistence belong to the consumer.' }
