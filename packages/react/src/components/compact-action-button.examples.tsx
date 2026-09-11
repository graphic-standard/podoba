import { CompactActionButton } from './compact-action-button'
export const examples = {
	default: () => <CompactActionButton>Create Task</CompactActionButton>,
	variants: () => <><CompactActionButton variant="linear">Cancel</CompactActionButton><CompactActionButton>Mark done</CompactActionButton></>,
	states: () => <><CompactActionButton isDisabled>Create Task</CompactActionButton><CompactActionButton variant="linear" isDisabled>Cancel</CompactActionButton><CompactActionButton isPending>Marking...</CompactActionButton></>,
}
export const meta = { category: 'Primitives', description: 'Compact source Manager actions with primary/linear emphasis, keyboard focus and disabled states.' }
