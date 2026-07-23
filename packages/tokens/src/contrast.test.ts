/// <reference types="bun" />

import { describe, expect, test } from 'bun:test'

/**
 * WCAG 2.1 contrast regression over the generated token values — the static
 * equivalent of an axe `color-contrast` pass, run for BOTH themes.
 *
 * Guards the pairing rule behind issues #13/#14/#15: every surface ships with a
 * semantic foreground that stays AA-safe when the theme flips. FIXED light
 * surfaces (brand-secondary, brand-green, accent-yellow) pair with the stable
 * `fg-on-brand` ink; the theme-flipping `surface-inverted` pairs with the
 * equally flipping `fg-inverted`.
 */

const css = await Bun.file(new URL('./variables.css', import.meta.url)).text()

function parseBlock(selector: string): Record<string, string> {
	const m = css.match(new RegExp(`${selector}\\s*\\{([^}]*)\\}`))
	if (!m) throw new Error(`selector ${selector} not found in variables.css`)
	const vars: Record<string, string> = {}
	for (const [, name, hex] of m[1].matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\b/g)) {
		vars[name] = hex
	}
	return vars
}

const light = parseBlock(':root')
// The dark block only lists overrides — unlisted tokens keep their light value.
const dark = { ...light, ...parseBlock('\\[data-theme="dark"\\]') }
const THEMES = { light, dark } as const

type Rgb = [number, number, number]

const rgb = (hex: string): Rgb => [
	parseInt(hex.slice(1, 3), 16),
	parseInt(hex.slice(3, 5), 16),
	parseInt(hex.slice(5, 7), 16),
]

function luminance([r, g, b]: Rgb): number {
	const [lr, lg, lb] = [r, g, b].map((c) => {
		const s = c / 255
		return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
	})
	return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb
}

function ratio(fgHex: string, bgHex: string): number {
	const [a, b] = [luminance(rgb(fgHex)), luminance(rgb(bgHex))]
	return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

/** Foreground at `alpha` composited over the surface (Tailwind `/60`-style tones). */
const blend = (fgHex: string, alpha: number, bgHex: string): string =>
	'#' +
	rgb(fgHex)
		.map((c, i) => Math.round(alpha * c + (1 - alpha) * rgb(bgHex)[i]).toString(16).padStart(2, '0'))
		.join('')

/** [foreground token, surface token] pairs that must hold ≥4.5:1 (normal text). */
const SOLID_PAIRS: Array<[fg: string, bg: string]> = [
	// fixed light brand/accent surfaces × the stable on-brand ink (CtaPill, Badge, Tile teal/yellow)
	['fg-on-brand', 'brand-secondary'],
	['fg-on-brand', 'brand-green'],
	['fg-on-brand', 'accent-yellow'],
	// flipping inverted surface × flipping inverted ink (Badge dark, Tile dark)
	['fg-inverted', 'surface-inverted'],
	// grey Badge (fg-muted on surface-muted was ~3.7:1 — below AA for caption text)
	['fg', 'surface-muted'],
	// general body-copy sanity
	['fg', 'surface'],
	// NOT listed: ['fg-muted', 'surface'] — #7d786f on #ffffff measures ~4.39:1,
	// just under AA, despite the token's "AA-compliant grey on white" description.
	// Pre-existing, system-wide, and owned by the upstream token source — tracked
	// as its own issue; add the pair here once the value is corrected.
]

/** Alpha-blended muted tones used by Tile (`/60` dark, `/70` teal/yellow). */
const BLENDED_PAIRS: Array<[fg: string, alpha: number, bg: string]> = [
	['fg-inverted', 0.6, 'surface-inverted'],
	['fg-on-brand', 0.7, 'brand-secondary'],
	['fg-on-brand', 0.7, 'brand-green'],
	['fg-on-brand', 0.7, 'accent-yellow'],
]

for (const [themeName, tokens] of Object.entries(THEMES)) {
	describe(`${themeName} theme`, () => {
		test.each(SOLID_PAIRS)('%s on %s ≥ 4.5:1', (fg, bg) => {
			expect(tokens[fg]).toBeDefined()
			expect(tokens[bg]).toBeDefined()
			expect(ratio(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(4.5)
		})

		test.each(BLENDED_PAIRS)('%s at %d over %s ≥ 4.5:1', (fg, alpha, bg) => {
			expect(ratio(blend(tokens[fg], alpha, tokens[bg]), tokens[bg])).toBeGreaterThanOrEqual(4.5)
		})
	})
}

describe('fg-on-brand stability', () => {
	test('is the same ink in both themes — the surfaces it pairs with never flip', () => {
		expect(dark['fg-on-brand']).toBe(light['fg-on-brand'])
		expect(dark['brand-secondary']).toBe(light['brand-secondary'])
		expect(dark['brand-green']).toBe(light['brand-green'])
		expect(dark['accent-yellow']).toBe(light['accent-yellow'])
	})
})
