import { DialogActionButton } from './dialog-action-button'
export const examples = {
	default: () => <DialogActionButton>Review Mapping</DialogActionButton>,
	variants: () => <><DialogActionButton variant="secondary">Change CSV</DialogActionButton><DialogActionButton>Bind CSV</DialogActionButton></>,
	states: () => <><DialogActionButton isDisabled>Bind CSV</DialogActionButton><DialogActionButton isPending>Binding CSV…</DialogActionButton></>,
}
export const meta = { category: 'Primitives', description: 'Source UI dialog action palette, typography and pointer/keyboard states, independent of dashboard CTAs.' }
