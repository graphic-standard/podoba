import { uic } from '../utils/uic'

/**
 * Section — vertical rhythm wrapper (port of gs-manager's `Section`).
 *
 * gs SCSS → our tokens (Tailwind + `@app/tokens` CSS vars, no SCSS — hard rule #3):
 *   - full-width block, `overflow` left visible so focus rings / negative-margin
 *     sticky headers on children aren't clipped (gs comment) → `w-full`.
 *   - vertical padding scale (gs `--spacing-*`, responsive @640px = Tailwind `sm:`):
 *       none → `py-0`
 *       sm   → `py-4`
 *       md   → `py-6 sm:py-8`   (the gs default)
 *       lg   → `py-8 sm:py-12`
 *       xl   → `py-12 sm:py-16`
 *
 * Presentational only (hard rule #1) — no app imports.
 */
export const Section = uic('section', {
	displayName: 'Section',
	baseClass: 'w-full',
	variants: {
		padding: {
			none: 'py-0',
			sm: 'py-4',
			md: 'py-6 sm:py-8',
			lg: 'py-8 sm:py-12',
			xl: 'py-12 sm:py-16',
		},
	},
	defaultVariants: {
		padding: 'md',
	},
})

export type SectionProps = React.ComponentProps<typeof Section>
