import { uic } from '../utils/uic'

/**
 * Card — surface panel (port of gs-manager's `Card`).
 *
 * gs SCSS → our tokens (Tailwind + `@app/tokens` CSS vars, no SCSS — hard rule #3):
 *   - `--radius-lg` (8px) → `rounded-lg` (our `--radius-lg` is 0.5rem = 8px). NB the
 *     `rounded-panel` token is 1.1rem (~17.6px), NOT the 8px card radius — gs's Card
 *     used `--radius-lg`, so this maps to `rounded-lg`.
 *   - `--color-background-secondary` (the light card fill) → `bg-surface-card`
 *     (our `--color-surface-card` = #f7f6f2).
 *   - `outlined` → 1px `--color-border` (#eceae1) → `border border-border`.
 *   - `elevated` → `card-shadow('md')` → `shadow-md`.
 *   - padding sm/md/lg = 16/24/32px → `p-4` / `p-6` / `p-8`.
 *
 * Presentational only (hard rule #1) — no app imports. `relative` is preserved from
 * gs so absolutely-positioned children (e.g. a Kanban overlay) anchor to the card.
 */
export const Card = uic('div', {
	displayName: 'Card',
	baseClass: 'relative rounded-lg bg-surface-card',
	variants: {
		variant: {
			plain: '',
			outlined: 'border border-border',
			elevated: 'shadow-md',
		},
		padding: {
			none: 'p-0',
			sm: 'p-4',
			md: 'p-6',
			lg: 'p-8',
		},
	},
	defaultVariants: {
		variant: 'plain',
		padding: 'md',
	},
})

export type CardProps = React.ComponentProps<typeof Card>
