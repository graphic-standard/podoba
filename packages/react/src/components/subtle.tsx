import type { ComponentProps } from 'react'

import { uic } from '../utils/uic'

/**
 * Subtle — inline de-emphasised text. Wraps its children in a de-emphasised span;
 * anything OUTSIDE it stays at the surrounding full-contrast `fg`. Compose it freely
 * to two-tone arbitrary runs of a line — unlike a fixed-slot header it handles
 * mid-line emphasis in ANY order and ANY language:
 *
 *   <h1>
 *     <Subtle>Good afternoon</Subtle> {name} 👋
 *     <br />
 *     <Subtle>You have</Subtle> {count} planned tasks <Subtle>today</Subtle>
 *   </h1>
 *
 * With i18n, put the `<subtle>…</subtle>` runs INSIDE the translation string and render
 * it via `<Trans components={{ subtle: <Subtle /> }} />`, so each locale places the
 * emphasis where its own word order needs it. Presentational only (hard rule #1).
 *
 * ## Tone
 *
 * `muted` (the default) is `fg-muted`, which clears WCAG 2.1 AA normal-text contrast
 * on every light surface it pairs with (5.98:1 on `surface`, 5.53:1 on `surface-card`,
 * 4.96:1 on `surface-muted`) and 6.52:1 / 5.30:1 in the dark theme. Meaningful copy —
 * a greeting, a task count, a caption — belongs here.
 *
 * `decorative` is the lighter `fg-subtle` (#b3b3b3) this component used to apply
 * unconditionally. It measures 2.10:1 on `surface` and 1.94:1 on `surface-card`, below
 * even the 3:1 large-text floor, so it is ORNAMENTAL ONLY: separators, watermarks,
 * repeated decorative runs that carry no information a reader would miss. Never put
 * text a user has to read behind it.
 */
export const Subtle = uic('span', {
	displayName: 'Subtle',
	variants: {
		tone: {
			muted: 'text-fg-muted',
			decorative: 'text-fg-subtle',
		},
	},
	defaultVariants: { tone: 'muted' },
})

export type SubtleProps = ComponentProps<typeof Subtle>
