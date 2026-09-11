import { useState } from 'react'
import { Button } from './button'
import { CompactSettingsDialog } from './compact-settings-dialog'

function Example({ pending = false }: { pending?: boolean }) {
	const [open, setOpen] = useState(false)
	return <>
		<Button onPress={() => setOpen(true)}>Manage members</Button>
		<CompactSettingsDialog isOpen={open} onOpenChange={setOpen} isPending={pending} title="Manage project members" description="Add or remove collaborators for this project." closeLabel="Close">
			<p>No members in this category.</p>
		</CompactSettingsDialog>
	</>
}
export const examples = { default: () => <Example />, pending: () => <Example pending /> }
export const meta = { category: 'Composite', description: 'Intrinsic-height form modal with stacked title and description, responsive width, and pending dismissal lock.' }
