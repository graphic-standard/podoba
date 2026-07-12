import { uic } from '../utils/uic'

/**
 * PageContainer — max-width page shell (port of gs-manager's `PageContainer`).
 *
 * gs SCSS → our tokens (Tailwind + `@app/tokens` CSS vars, no SCSS — hard rule #3).
 * No `size` → full-width with no constraint (horizontal padding is owned by the
 * AppShell content, as in gs). The `size` scale maps to Tailwind's stock screen
 * max-widths, matching gs's pixel values exactly:
 *   - sm  → 640px, centred            → `max-w-screen-sm mx-auto`
 *   - md  → 768px, centred            → `max-w-screen-md mx-auto`
 *   - lg  → 1024px, centred           → `max-w-screen-lg mx-auto`
 *   - xl  → 1280px, LEFT-aligned to match the header, then released to full width
 *           at ≥1200px → `max-w-screen-xl ml-0 mr-0 min-[1200px]:max-w-full`
 *   - 2xl → 1536px, centred, then released to full-width left-aligned at ≥1600px →
 *           `max-w-screen-2xl mx-auto min-[1600px]:max-w-full min-[1600px]:mx-0`
 *   - full → no constraint            → `max-w-full`
 *
 * Presentational only (hard rule #1) — no app imports.
 */
export const PageContainer = uic('div', {
	displayName: 'PageContainer',
	baseClass: 'w-full',
	variants: {
		size: {
			sm: 'max-w-screen-sm mx-auto',
			md: 'max-w-screen-md mx-auto',
			lg: 'max-w-screen-lg mx-auto',
			xl: 'max-w-screen-xl ml-0 mr-0 min-[1200px]:max-w-full',
			'2xl': 'max-w-screen-2xl mx-auto min-[1600px]:max-w-full min-[1600px]:mx-0',
			full: 'max-w-full',
		},
	},
})

export type PageContainerProps = React.ComponentProps<typeof PageContainer>
