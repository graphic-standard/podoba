import { useState } from 'react'
import { CycleMenuButton } from './cycle-menu-button'
import { IslandToolbar } from './island-toolbar'
function Example() {
 const [value, setValue] = useState('blue')
 return <IslandToolbar aria-label="Formatting"><CycleMenuButton label="Color" icon={<span aria-hidden="true">●</span>} value={value} onChange={setValue} options={[{id:'blue',label:'Blue'},{id:'green',label:'Green'},{id:'red',label:'Red',isDisabled:true}]} /></IslandToolbar>
}
export const examples = { default: () => <Example /> }
export const meta = { category: 'Composite', description: 'Cycle choices on short press; hold or Alt+ArrowDown to select from the complete menu.' }
