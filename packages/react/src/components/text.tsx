import { uic } from '../utils/uic'

/**
 * Text + Heading — the typography primitives for the management SPA.
 *
 * They express the `@app/tokens` type ramp as variant props so screens stop
 * hand-writing `text-[NNpx]` literals (the scale, not arbitrary pixels). Two ramps:
 *
 *   • <Text> — the SIZE-ONLY UI ramp (micro · caption · label · compact · callout ·
 *     body · subtitle · title · headline · display). Like the tokens, these set
 *     font-size only; pair with `leading-*` via `className` where a fixed leading
 *     matters. `weight` + `tone` cover the common cases.
 *   • <Heading> — the semantic heading ramp (`level` 1–5 → text-heading1…5), which
 *     DO carry a matching line-height. Renders an <h2> by default; pass `asChild`
 *     to project the styles onto the correct heading element for the document
 *     outline (e.g. `<Heading asChild level="1"><h1>…</h1></Heading>`).
 *
 * Both are `uic` factories, so they accept `className` (merged, conflict-resolved),
 * `asChild`, refs, and all native props. Presentational only (hard rule #1): no API,
 * no i18n.
 */

export const Text = uic('span', {
	displayName: 'Text',
	baseClass: 'text-fg',
	variants: {
		size: {
			micro: 'text-micro',
			caption: 'text-caption',
			label: 'text-label',
			compact: 'text-compact',
			callout: 'text-callout',
			body: 'text-body',
			subtitle: 'text-subtitle',
			title: 'text-title',
			headline: 'text-headline',
			display: 'text-display',
		},
		// NC Fontina caps at medium (500) as the heaviest weight in the system, so
		// `semibold` and `bold` are kept as API-compatible aliases that render
		// medium rather than going heavier. Keeping the keys avoids a breaking
		// change for consumers already passing weight="semibold" / "bold".
		weight: {
			regular: 'font-normal',
			medium: 'font-medium',
			semibold: 'font-medium',
			bold: 'font-medium',
		},
		tone: {
			default: 'text-fg',
			muted: 'text-fg-muted',
			subtle: 'text-fg-subtle',
			inverted: 'text-fg-inverted',
		},
	},
	defaultVariants: { size: 'body', weight: 'regular', tone: 'default' },
})

export const Heading = uic('h2', {
	displayName: 'Heading',
	baseClass: 'font-medium tracking-tight text-fg',
	variants: {
		level: {
			'1': 'text-heading1',
			'2': 'text-heading2',
			'3': 'text-heading3',
			'4': 'text-heading4',
			'5': 'text-heading5',
		},
	},
	defaultVariants: { level: '2' },
})
