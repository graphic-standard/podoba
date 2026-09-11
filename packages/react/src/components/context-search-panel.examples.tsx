import { useState } from 'react'
import { ContextSearchPanel } from './context-search-panel'
function SearchExample() {
	const [value, setValue] = useState('')
	const [isOpen, setIsOpen] = useState(true)
	return <><button type="button" onClick={() => setIsOpen(true)}>Search</button><ContextSearchPanel isOpen={isOpen} value={value} onChange={setValue} onClose={() => setIsOpen(false)} label="Search" placeholder="Search tasks" clearLabel="Clear" closeLabel="Close" /></>
}
export const examples = { default: SearchExample }
export const meta = { category: 'Patterns', description: 'Context search panel with retained query, clear, outside-click and Escape dismissal.' }
