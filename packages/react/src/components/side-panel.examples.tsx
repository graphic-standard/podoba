import { useState } from 'react'

import { Button } from './button'
import { SidePanel } from './side-panel'

function DefaultExample(): React.ReactNode {
	const [open, setOpen] = useState(false)
	return (
		<>
			<Button onPress={() => setOpen(true)}>Open panel</Button>
			<SidePanel
				isOpen={open}
				onOpenChange={setOpen}
				title="Assistant"
				description="Acme Robotics"
				closeLabel="Close assistant"
				footer={<Button className="w-full">Send</Button>}
			>
				<p className="text-small text-fg-muted">Ask a question about the current Brand.</p>
			</SidePanel>
		</>
	)
}

function SizeExample({ size }: { size: 'sm' | 'md' | 'lg' }): React.ReactNode {
	const [open, setOpen] = useState(false)
	return (
		<>
			<Button variant="secondary" onPress={() => setOpen(true)}>
				{size.toUpperCase()}
			</Button>
			<SidePanel
				isOpen={open}
				onOpenChange={setOpen}
				title={`${size.toUpperCase()} panel`}
				closeLabel="Close panel"
				size={size}
			>
				<p className="text-small text-fg">Responsive owned-scroll content.</p>
			</SidePanel>
		</>
	)
}

function PendingExample(): React.ReactNode {
	const [open, setOpen] = useState(false)
	return (
		<>
			<Button variant="secondary" onPress={() => setOpen(true)}>Pending state</Button>
			<SidePanel
				isOpen={open}
				onOpenChange={setOpen}
				title="Saving"
				description="Dismissal is temporarily disabled."
				closeLabel="Close panel"
				isDismissable={false}
			>
				<div role="status" className="text-small text-fg-muted">Working…</div>
			</SidePanel>
		</>
	)
}

export const examples = {
	default: () => <DefaultExample />,
	sizes: () => (
		<div className="flex gap-2">
			<SizeExample size="sm" />
			<SizeExample size="md" />
			<SizeExample size="lg" />
		</div>
	),
	states: () => <PendingExample />,
}

export const meta = {
	category: 'Layout',
	description: 'Accessible right-side modal panel with responsive full-screen mobile behavior.',
}

