import { ReloadIcon } from './reload-icon'
export const examples = {
	default: () => <ReloadIcon />,
	labeled: () => <span><ReloadIcon />Import CSV</span>,
	muted: () => <span className="text-fg-muted"><ReloadIcon /></span>,
}
export const meta = { category: 'Primitives', description: 'Decorative original 15px reload glyph; the parent action supplies its accessible name.' }
