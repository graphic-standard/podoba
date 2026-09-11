import { useState } from 'react'
import { Button } from './button'
import { RequestChangesModal } from './request-changes-modal'

function Example({ pending = false, error }: { pending?: boolean; error?: string }) {
	const [open, setOpen] = useState(false)
	return <>
		<Button onPress={() => setOpen(true)}>Request changes</Button>
		{open ? <RequestChangesModal
			isOpen onOpenChange={setOpen} isPending={pending} error={error}
			onConfirm={() => setOpen(false)}
			labels={{
				title: 'Request changes', body: 'Describe what needs to change before the next review.',
				noteLabel: 'Requested changes', notePlaceholder: 'Describe the requested changes…',
				cancel: 'Cancel', confirm: 'Request changes', submitting: 'Submitting…',
			}}
		/> : null}
	</>
}

export const examples = {
	default: () => <Example />,
	pending: () => <Example pending />,
	error: () => <Example error="The decision could not be saved. Please try again." />,
}
export const meta = { category: 'Composite', description: 'Required review note with shared filled field, focus management, pending dismissal lock and retry feedback.' }
