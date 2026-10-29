import { IconButton } from './icon-button'
export const examples = {
	default: () => <IconButton label="Close">×</IconButton>,
	variants: () => (
		<div className="flex gap-3">
			<IconButton label="Previous">‹</IconButton>
			<IconButton label="Next">›</IconButton>
		</div>
	),
	states: () => (
		<IconButton label="Remove" isDisabled>
			×
		</IconButton>
	),
}
export const meta = { category: 'Primitives', description: 'Compact ghost icon action with an accessible tooltip.' }
