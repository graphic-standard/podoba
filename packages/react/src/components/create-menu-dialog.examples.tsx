import { useState } from 'react'
import { Button } from './button'
import { CreateMenuDialog } from './create-menu-dialog'

const choices = ['Page', 'Article', 'Event', 'Venue', 'Club', 'Upload files']

function Example({ backgroundVideo }: { backgroundVideo?: string }) {
	const [open, setOpen] = useState(false)
	return (
		<>
			<Button onPress={() => setOpen(true)}>Create</Button>
			<CreateMenuDialog isOpen={open} onOpenChange={setOpen} title={'What do you\nwant to create?'} closeLabel="Close" backgroundVideo={backgroundVideo}>
				<ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 md:grid-cols-3">
					{choices.map((choice) => (
						<li key={choice}>
							<Button variant="secondary" className="h-24 w-full" onPress={() => setOpen(false)}>
								{choice}
							</Button>
						</li>
					))}
				</ul>
			</CreateMenuDialog>
		</>
	)
}

export const examples = {
	default: () => <Example />,
}
export const meta = {
	category: 'Overlays',
	description:
		'Near full-screen creation menu: a large title over a scrolling body of create actions, optionally over a looping background video the consumer supplies.',
}
