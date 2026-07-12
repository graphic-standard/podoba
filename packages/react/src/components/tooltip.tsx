import type { ReactNode } from 'react'
import {
	OverlayArrow,
	Tooltip as RACTooltip,
	type TooltipProps as RACTooltipProps,
	TooltipTrigger as RACTooltipTrigger,
} from 'react-aria-components'

/**
 * Tooltip — dark hover/focus hint, ported 1:1 from gs-platform's `Tooltip` designer
 * component (`packages/ui/src/components/ui/Tooltip.{tsx,module.scss}`).
 *
 * Built on React Aria Components `TooltipTrigger` + `Tooltip` (which gs faked with
 * Radix): RAC gives us hover-intent + focus + touch handling, an `OverlayArrow`
 * primitive, and correct `aria-describedby` wiring on the trigger for free. Wrap
 * any focusable element (e.g. our `Button`) in `TooltipTrigger`, then render a
 * `Tooltip`.
 *
 * gs SCSS → our tokens (Tailwind + `@app/tokens` CSS vars, no SCSS — hard rule #3):
 *   - `--color-brand-black` (#0d0d0d) bg + arrow fill → `bg-fg` / `fill-fg`
 *   - `--color-white` text                            → `text-fg-inverted`
 *   - `--font-size-small-body` (13px)                 → `text-compact`
 *   - `--spacing-3` / `--spacing-4` (12px / 16px) pad → `py-3 px-4`
 *   - `--radius-md` (6px)                             → `rounded-md`
 *   - `--shadow-lg`                                   → `shadow-lg`
 *   - `--z-index-tooltip` (1070)                      → `z-[1070]`
 * Motion: gs `slideUpAndFade` 200ms cubic-bezier(.16,1,.3,1) translateY(2px)→0,
 * gated on RAC's `data-[entering]` (and reversed on `data-[exiting]`) via an
 * injected `@keyframes` pair.
 */

export const TooltipTrigger = RACTooltipTrigger

export interface TooltipProps extends Omit<RACTooltipProps, 'children'> {
	/** Tooltip body — text or rich content. */
	children: ReactNode
	/** Hide the small pointer arrow (shown by default). */
	hideArrow?: boolean
}

export const Tooltip = ({ children, hideArrow = false, ...props }: TooltipProps) => (
	<RACTooltip
		// gs default offset (`sideOffset={5}`); RAC adds arrow size automatically.
		offset={6}
		{...props}
		className="z-[1070] select-none rounded-md bg-fg px-4 py-3 text-compact text-fg-inverted shadow-lg outline-none data-[entering]:[animation:gsTooltipSlideUpFade_200ms_cubic-bezier(0.16,1,0.3,1)] data-[exiting]:[animation:gsTooltipSlideUpFade_150ms_cubic-bezier(0.16,1,0.3,1)_reverse]"
	>
		{/* Injected keyframes (gs `slideUpAndFade`). No SCSS; scoped name. */}
		<style>{KEYFRAMES}</style>
		{hideArrow ? null : (
			<OverlayArrow>
				<svg width="10" height="5" viewBox="0 0 10 5" className="fill-fg" aria-hidden="true">
					<path d="M0 0 L5 5 L10 0 Z" />
				</svg>
			</OverlayArrow>
		)}
		{children}
	</RACTooltip>
)

// gs `slideUpAndFade`: translateY(2px) + opacity 0 → settled. RAC flips the
// rendered arrow per placement, so the keyframe only needs the fade/rise.
const KEYFRAMES = `@keyframes gsTooltipSlideUpFade {
	from { opacity: 0; transform: translateY(2px); }
	to { opacity: 1; transform: translateY(0); }
}`
