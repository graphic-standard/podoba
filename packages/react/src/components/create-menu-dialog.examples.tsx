import { useState } from 'react'
import { Button } from './button'
import { CreateMenuDialog } from './create-menu-dialog'

function Example() {
 const [open, setOpen] = useState(false)
 return <><Button onPress={() => setOpen(true)}>Open menu</Button><CreateMenuDialog isOpen={open} onOpenChange={setOpen} title="Create something new" closeLabel="Close"><Button>New project</Button></CreateMenuDialog></>
}
export const examples = { default: () => <Example /> }
export const meta = { category: 'Composite', description: 'A large creation menu with an optional decorative video background.' }
