import { describe, expect, test } from 'bun:test'
import { Schema } from '@tiptap/pm/model'
import { EditorState } from '@tiptap/pm/state'

import { canOpenSlash, filterCommands, placeSlashMenu } from './block-editor'
import { safeLinkUrl } from '../utils/safe-link-url'

describe('filterCommands', () => {
	test('returns the whole palette for an empty query', () => {
		expect(filterCommands('').map((c) => c.title)).toContain('Text')
		expect(filterCommands('   ')).toHaveLength(filterCommands('').length)
	})

	test('matches on title and on keyword', () => {
		expect(filterCommands('Heading 1').map((c) => c.title)).toEqual(['Heading 1'])
		expect(filterCommands('h2').map((c) => c.title)).toEqual(['Heading 2'])
		expect(filterCommands('checkbox').map((c) => c.title)).toEqual(['To-do list'])
		expect(filterCommands('list').map((c) => c.title)).toEqual(['Bulleted list', 'Numbered list', 'To-do list'])
	})

	test('is case-insensitive and trims', () => {
		expect(filterCommands('  QUOTE ').map((c) => c.title)).toEqual(['Quote'])
	})

	// The palette closes on an empty result rather than staying open and swallowing
	// Enter/arrows — this is the query that used to strand the caret.
	test('returns nothing for prose that merely happens to contain a slash', () => {
		expect(filterCommands('api/v2')).toHaveLength(0)
		expect(filterCommands('zzz')).toHaveLength(0)
	})
})

// A minimal doc/paragraph/text schema plus a code block — enough to exercise the
// trigger gate without booting a whole editor.
const schema = new Schema({
	nodes: {
		doc: { content: 'block+' },
		paragraph: { content: 'inline*', group: 'block' },
		codeBlock: { content: 'inline*', group: 'block', code: true },
		text: { group: 'inline' },
	},
})

const stateWith = (text: string, nodeType: 'paragraph' | 'codeBlock' = 'paragraph') =>
	EditorState.create({
		schema,
		doc: schema.node('doc', null, [schema.node(nodeType, null, text ? [schema.text(text)] : [])]),
	})

describe('canOpenSlash', () => {
	test('opens at the start of a block', () => {
		expect(canOpenSlash(stateWith(''), 1)).toBe(true)
		expect(canOpenSlash(stateWith('hello'), 1)).toBe(true)
	})

	test('opens after whitespace', () => {
		// "write " — position 7 sits just after the space.
		expect(canOpenSlash(stateWith('write '), 7)).toBe(true)
	})

	test('stays shut mid-word, so URLs and paths type as plain text', () => {
		expect(canOpenSlash(stateWith('and'), 4)).toBe(false)
		expect(canOpenSlash(stateWith('https:'), 7)).toBe(false)
		expect(canOpenSlash(stateWith('api'), 4)).toBe(false)
	})

	test('never opens inside a code block', () => {
		expect(canOpenSlash(stateWith('', 'codeBlock'), 1)).toBe(false)
		expect(canOpenSlash(stateWith('cd ', 'codeBlock'), 4)).toBe(false)
	})

	test('rejects an out-of-range position instead of throwing', () => {
		expect(canOpenSlash(stateWith('hi'), 999)).toBe(false)
		expect(canOpenSlash(stateWith('hi'), -1)).toBe(false)
	})
})

describe('safeLinkUrl', () => {
	test('accepts the allowed schemes and relative paths', () => {
		expect(safeLinkUrl('https://example.com')).toBe('https://example.com')
		expect(safeLinkUrl('  http://example.com  ')).toBe('http://example.com')
		expect(safeLinkUrl('mailto:a@b.c')).toBe('mailto:a@b.c')
		expect(safeLinkUrl('tel:+420123')).toBe('tel:+420123')
		expect(safeLinkUrl('/brand/assets')).toBe('/brand/assets')
		expect(safeLinkUrl('#section')).toBe('#section')
	})

	test('rejects script-bearing schemes', () => {
		expect(safeLinkUrl('javascript:alert(1)')).toBeNull()
		expect(safeLinkUrl('JavaScript:alert(1)')).toBeNull()
		expect(safeLinkUrl('data:text/html,<script>')).toBeNull()
		expect(safeLinkUrl('vbscript:msgbox')).toBeNull()
		expect(safeLinkUrl('example.com')).toBeNull()
		expect(safeLinkUrl('')).toBeNull()
	})
})

describe('placeSlashMenu', () => {
	// A caret 40px tall near the top of a 1200px-wide viewport.
	const caret = { caretTop: 120, caretBottom: 140, caretLeft: 300, width: 256, viewportW: 1200 }

	test('sits just below the caret when there is room', () => {
		const p = placeSlashMenu({ ...caret, wanted: 288, viewportH: 900 })
		expect(p.top).toBe(146) // caretBottom + 6
		expect(p.maxHeight).toBe(288)
	})

	test('stays at the caret in a short viewport instead of jumping to the top edge', () => {
		// 400px tall: 288 does not fit below (246 free), and above (106) is tighter
		// still. The old code flipped anyway and clamped to top: 8 — over the header.
		const p = placeSlashMenu({ ...caret, wanted: 288, viewportH: 400 })
		expect(p.top).toBe(146)
		expect(p.maxHeight).toBe(246) // scrolls within the room below
		expect(p.top).toBeGreaterThan(caret.caretTop)
	})

	test('flips above only when above is roomier, and never past the top edge', () => {
		const p = placeSlashMenu({ ...caret, caretTop: 700, caretBottom: 720, wanted: 288, viewportH: 800 })
		expect(p.maxHeight).toBe(288)
		expect(p.top).toBe(406) // caretTop - 6 - 288
		expect(p.top).toBeGreaterThanOrEqual(8)
		expect(p.top + p.maxHeight).toBeLessThanOrEqual(700)
	})

	test('caps a flipped palette to the room above rather than clamping its top', () => {
		// Caret low in a short viewport: above (186) beats below (54), but cannot fit 288.
		const p = placeSlashMenu({ ...caret, caretTop: 200, caretBottom: 220, wanted: 288, viewportH: 288 })
		expect(p.maxHeight).toBe(186)
		expect(p.top).toBe(8)
		expect(p.top + p.maxHeight).toBeLessThanOrEqual(200)
	})

	test('never returns a negative height when neither side has room', () => {
		const p = placeSlashMenu({ ...caret, caretTop: 10, caretBottom: 30, wanted: 288, viewportH: 32 })
		expect(p.maxHeight).toBeGreaterThanOrEqual(0)
	})

	test('clamps horizontally to the viewport', () => {
		expect(placeSlashMenu({ ...caret, caretLeft: 1190, wanted: 288, viewportH: 900 }).left).toBe(936)
		expect(placeSlashMenu({ ...caret, caretLeft: 0, wanted: 288, viewportH: 900 }).left).toBe(8)
	})
})
