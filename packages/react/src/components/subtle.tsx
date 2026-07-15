import type { ReactNode } from 'react'

/**
 * Subtle — inline de-emphasised text (the light `fg-subtle` grey, #b3b3b3). Wraps its
 * children in a `text-fg-subtle` span; anything OUTSIDE it stays at the surrounding
 * full-contrast `fg`. Compose it freely to two-tone arbitrary runs of a line — unlike
 * a fixed-slot header it handles mid-line emphasis in ANY order and ANY language:
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
 */
export function Subtle({ children }: { children: ReactNode }) {
	return <span className="text-fg-subtle">{children}</span>
}
