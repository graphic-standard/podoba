/// <reference types="bun" />

import { expect, test } from 'bun:test'

/**
 * Letter spacing is tuned per typeface. variables.css carries the GS scale, set for
 * the GT America it names in --font-sans; fonts.css swaps in NC Fontina and must
 * bring that face's own scale with it. A tracking token added to variables.css but
 * not here would quietly apply GT America's negative tracking to NC Fontina.
 *
 * `--tracking-display-large` is left out on purpose: it is the hero heading's
 * proportional (em) value from the GS source, and both faces use it as is.
 */

const SCALE = ['--tracking-normal', '--tracking-tight', '--tracking-wide', '--tracking-wider']

const read = (file: string) => Bun.file(new URL(file, import.meta.url)).text()
const names = (css: string, prefix: string) =>
	new Set([...css.matchAll(new RegExp(`(--${prefix}[a-z0-9-]*):`, 'g'))].map((m) => m[1]))

test('fonts.css overrides the whole tracking scale that variables.css declares', async () => {
	const [variables, fonts] = await Promise.all([read('./variables.css'), read('./fonts.css')])
	const declared = names(variables, 'tracking-')
	declared.delete('--tracking-display-large')
	expect([...declared].sort()).toEqual([...SCALE].sort())
	expect([...names(fonts, 'tracking-')].sort()).toEqual([...SCALE].sort())
	expect(fonts).toContain('--font-sans:')
})
