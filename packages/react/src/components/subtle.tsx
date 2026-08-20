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
 * `muted` covers the reading surfaces and nothing else. Every surface that carries
 * its OWN ink needs the matching tone, because `fg-muted` is below AA on all of
 * them — `Tile.mutedTone()` has always encoded this pairing, and these two tones
 * are the same rule made reachable from a bare run of text:
 *
 *   surface-inverted (#242423 — does NOT flip, so it is a dark panel in the LIGHT
 *     theme too: a dark `Tile`, `Badge color="dark"`)   fg-muted 2.60:1
 *     → `inverted`, `fg-inverted/60` — 6.49:1 light, 4.99:1 dark
 *
 *   the FIXED brand fills, which never flip: brand-green (fg-muted 3.95:1),
 *     accent-yellow (4.01:1), brand-secondary (3.60:1) — a teal or yellow `Tile`,
 *     a `CtaPill`, a green/yellow `Badge`
 *     → `on-brand`, `fg-on-brand/70` — 6.08:1 / 6.11:1 / 5.78:1, theme-stable
 *
 * All four blends are asserted in @podoba/tokens `contrast.test.ts`.
 *
 * ## Migrating from ≤ 0.0.34
 *
 * BREAKING for dark and brand surfaces. This component used to render `fg-subtle`
 * unconditionally, which happens to PASS on `surface-inverted` (7.41:1) — so a run
 * that sat on a dark or brand panel got a working colour by accident and now needs
 * `tone="inverted"` / `tone="on-brand"` to keep it. Nothing detects this for you:
 * the tone is a prop, and no lint rule knows which surface a run lands on. Grep for
 * `<Subtle` and `tone="subtle"` inside dark `Tile`s, `bg-surface-inverted` panels,
 * `CtaPill`s and teal/yellow surfaces. On the reading surfaces — the overwhelming
 * majority — the default is strictly better and needs no change.
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
			'on-brand': 'text-fg-on-brand/70',
			decorative: 'text-fg-subtle',
		},
	},
	defaultVariants: { tone: 'muted' },
})

export type SubtleProps = ComponentProps<typeof Subtle>
