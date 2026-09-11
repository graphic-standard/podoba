import { ContextActionGlyph, ContextActionGlyphSchema } from './context-action-glyph'
import { Button } from './button'
export const examples = {
	default: () => <ContextActionGlyph kind="edit" />,
	variants: () => <>{ContextActionGlyphSchema.options.map(kind => <ContextActionGlyph key={kind} kind={kind} />)}</>,
	sizes: () => <><ContextActionGlyph kind="settings" /><ContextActionGlyph kind="settings" className="size-5" /></>,
	states: () => <><Button><ContextActionGlyph kind="open" />Open</Button><Button isDisabled><ContextActionGlyph kind="archive" />Archive</Button></>,
}
export const meta = { category: 'Primitives', description: 'Decorative compact action glyphs from the original Radix icon set; inherit the parent action color and accessible name.' }
