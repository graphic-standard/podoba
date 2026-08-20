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
 * `muted` (the default) is `fg-muted`. It clears WCAG 2.1 AA normal-text contrast on
 * the READING surfaces — `surface` 5.98:1, `surface-card` 5.53:1, `surface-muted`
 * 4.96:1 in light; 6.52:1 / 5.30:1 in dark. Meaningful copy — a greeting, a task
 * count, a caption — belongs here.
 *
 * `inverted` is for the one surface `muted` does NOT cover: `surface-inverted` does
 * not flip with the theme, so in the LIGHT theme it is a dark #242423 panel (a dark
 * `Tile`, a `Badge color="dark"`) where `fg-muted` collapses to 2.60:1. Reach for
 * this tone whenever the run sits on an inverted surface — `fg-inverted/60` holds
 * 6.49:1 there in light and 4.99:1 in dark, and matches what `Tile`'s own
 * `mutedTone()` already applies to its own dark theme.
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
			inverted: 'text-fg-inverted/60',
			decorative: 'text-fg-subtle',
		},
	},
	defaultVariants: { tone: 'muted' },
})

export type SubtleProps = ComponentProps<typeof Subtle>
