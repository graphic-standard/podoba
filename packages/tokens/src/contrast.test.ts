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
	// 8-digit values are captured too — NOT to assert them, but so `opaque()` below
	// can reject them. A 6-digit-only regex silently skipped a translucent dark
	// override and let the pair re-test the inherited LIGHT value instead.
	for (const [, name, hex] of m[1].matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{8}|#[0-9a-fA-F]{6})\b/g)) {
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

/**
 * A static pair only means something for an OPAQUE value: a translucent token's
 * effective colour depends on whatever it is composited over, which is a property
 * of the layout, not of the token. Fail loudly rather than measure a fiction.
 */
function opaque(name: string, hex: string): string {
	if (hex.length !== 7) {
		throw new Error(
			`token ${name} is translucent (${hex}) — its effective colour depends on what it composites over, so it cannot be an operand of a static pair`,
		)
	}
	return hex
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
	// grey Badge — full `fg` ink. #19 lifted `fg-muted` on `surface-muted` from 3.64:1
	// to 4.96:1, so the pair is no longer disqualified, but a Badge is caption-size and
	// keeps the stronger ink; this pair is what that choice is asserted against.
	['fg', 'surface-muted'],
	// general body-copy sanity
	['fg', 'surface'],
	// #19: `fg-muted` was #7d786f, which cleared NONE of its own surfaces (4.39:1 on
	// white, 4.06:1 on surface-card, 3.64:1 on surface-muted) while its description
	// called itself "AA-compliant grey on white". The upstream token source darkened
	// it to #67635b; these four pairs are the ones that value was tuned against, and
	// the binding one is `border`/`surface-muted` (#eceae1), not white.
	['fg-muted', 'surface'],
	['fg-muted', 'surface-card'],
	['fg-muted', 'surface-muted'],
	// NOT listed: ['fg-muted', 'border'] — in light `border` IS #eceae1, so the pair
	// is numerically identical to the line above, and in dark it is a translucent
	// #ffffff1a hairline that `opaque()` rejects. `bg-border` is only ever a 1px rule
	// in this repo (separator.tsx, dropdown-menu.tsx), never a text background.
]

/** Alpha-blended muted tones used by Tile (`/60` dark, `/70` teal/yellow). */
const BLENDED_PAIRS: Array<[fg: string, alpha: number, bg: string]> = [
	['fg-inverted', 0.6, 'surface-inverted'],
	['fg-on-brand', 0.7, 'brand-secondary'],
	['fg-on-brand', 0.7, 'brand-green'],
	['fg-on-brand', 0.7, 'accent-yellow'],
	// Button's inactive (disabled / pending) label: it softens the INK over the
	// variant's own surface rather than fading the whole control, so every ink ×
	// surface combination it can land on has to hold AA on its own.
	// `primary` — inverted ink on the brand fill, kept so a submitting CTA stays
	// brand-coloured.
	['fg-inverted', 0.7, 'brand-primary'],
	// `secondary` (surface-card), `destructive` (surface-muted) and `ghost`, which
	// is transparent and therefore inherits whichever surface it sits on.
	['fg', 0.6, 'surface-card'],
	['fg', 0.6, 'surface-muted'],
	['fg', 0.6, 'surface'],
]

for (const [themeName, tokens] of Object.entries(THEMES)) {
	describe(`${themeName} theme`, () => {
		test.each(SOLID_PAIRS)('%s on %s ≥ 4.5:1', (fg, bg) => {
			expect(tokens[fg]).toBeDefined()
			expect(tokens[bg]).toBeDefined()
			expect(ratio(opaque(fg, tokens[fg]), opaque(bg, tokens[bg]))).toBeGreaterThanOrEqual(4.5)
		})

		test.each(BLENDED_PAIRS)('%s at %d over %s ≥ 4.5:1', (fg, alpha, bg) => {
			// `blend()` applies the alpha ITSELF, so both operands must be opaque here
			// for the same reason they must be in the solid test — `rgb()` slices bytes
			// 1–7 and would silently discard a token's own alpha channel.
			const [inkHex, bgHex] = [opaque(fg, tokens[fg]), opaque(bg, tokens[bg])]

			expect(ratio(blend(inkHex, alpha, bgHex), bgHex)).toBeGreaterThanOrEqual(4.5)
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
