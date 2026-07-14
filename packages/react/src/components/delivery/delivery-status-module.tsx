// @app/ui — delivery status module (issue 17).
//
// PRESENTATIONAL "black status module" — the signature delivery-UI surface ported
// from the gs-platform `FinalOutputsHandoffPanel` (`.statusModule`): a dark
// inverted surface (white-on-#242423) carrying a status header row, muted status
// text, an optional progress track with a GREEN progress bar, and optional
// trailing "ready" pills. Used by BOTH the final-outputs handoff panel and the
// live delivery-status cards so the two read as one visual language.
//
// APP-AGNOSTIC (hard rule #1): no apps/web imports, no API hooks, no i18n. Every
// string is passed in; the owning surface in apps/web supplies the i18n copy and
// wires behaviour. Pure markup + Tailwind classes bound to @app/tokens CSS vars.
//
// ── Styling (hard rule #3) ────────────────────────────────────────────────────
// Tailwind + @app/tokens only — NO SCSS, NO raw hex.
//   gs-platform `--color-text-primary` (#000 module surface) → our `surface-inverted`
//   gs-platform `--color-background` (white text)            → our `fg-inverted`
//   gs-platform `--color-brand-green` (#22c55e progress)     → our `success`
//   gs-platform `--radius-full` (track / pills)              → `rounded-full`
//   gs-platform `--radius-panel-sm` (module)                 → `rounded-md`
//
// ── a11y ──────────────────────────────────────────────────────────────────────
// White (#fff) on the dark surface (#242423) ≈ 14.9:1 — passes WCAG AA. The muted
// status text uses `text-white/70` (white at 70% over the dark surface) ≈ 8.6:1 —
// still AA. (We use the stock `white`/opacity utilities for the muted tints rather
// than `fg-inverted/NN`: Tailwind cannot inject an alpha channel into an arbitrary
// `var(--color-…)`, so an opacity modifier on `fg-inverted` would be a no-op; the
// `fg-inverted` token IS white, so `text-white` is the same colour, alpha-capable.)
// The green bar (#22c55e on #242423) is a NON-TEXT graphical indicator (~5.6:1,
// above the 3:1 non-text minimum). The progress track is `aria-hidden`; when a
// numeric value matters, expose it in the header (text), not the bar.

import type { ReactNode } from 'react'
import { uic } from '../../utils/uic'

/** The dark status-module shell (inverted surface + white text). */
export const DeliveryStatusModuleRoot = uic('div', {
	displayName: 'DeliveryStatusModule',
	baseClass:
		'grid gap-3 rounded-md bg-surface-inverted p-4 text-fg-inverted',
})

export interface DeliveryStatusModuleProps {
	/** Status header — left-aligned headline (e.g. "Files ready"). */
	heading: ReactNode
	/** Optional right-aligned header annotation (e.g. "50 %", "3 ready"). */
	headingMeta?: ReactNode
	/** Muted status sentence under the header. */
	statusText?: ReactNode
	/**
	 * Optional progress fraction in [0, 1]. When provided, renders the green
	 * progress track. Clamped; the track itself is decorative (`aria-hidden`).
	 */
	progress?: number
	/** Optional trailing pills / actions row (e.g. "ready" chips). */
	children?: ReactNode
	/** Forwarded test id. */
	'data-testid'?: string
}

/**
 * Black status module with an optional green progress bar. The visual heart of the
 * delivery UI — stack it under a white output card or use it as a job-status card.
 */
export function DeliveryStatusModule({
	heading,
	headingMeta,
	statusText,
	progress,
	children,
	'data-testid': testId,
}: DeliveryStatusModuleProps): React.ReactNode {
	const hasProgress = progress != null
	const pct = hasProgress ? Math.max(0, Math.min(1, progress)) * 100 : 0

	return (
		<DeliveryStatusModuleRoot data-testid={testId}>
			<div className="flex items-center justify-between gap-4 text-sm font-medium">
				<span>{heading}</span>
				{headingMeta != null ? <span>{headingMeta}</span> : null}
			</div>

			{statusText != null ? (
				<p className="m-0 text-xs text-white/70">{statusText}</p>
			) : null}

			{hasProgress ? (
				<div
					className="h-2 overflow-hidden rounded-full bg-white/25"
					aria-hidden="true"
				>
					<span
						className="block h-full rounded-full bg-success transition-[width]"
						style={{ width: `${pct}%` }}
					/>
				</div>
			) : null}

			{children != null ? (
				<div className="flex flex-wrap items-center gap-2 text-xs text-white/80">
					{children}
				</div>
			) : null}
		</DeliveryStatusModuleRoot>
	)
}

/** A hairline "ready" pill for the trailing actions row (inverted palette). */
export const DeliveryStatusPill = uic('span', {
	displayName: 'DeliveryStatusPill',
	baseClass:
		'inline-flex min-h-5 items-center rounded-full border border-white/30 px-3',
})
