import type { ReactNode } from 'react'
import { ToggleButton, ToggleButtonGroup } from 'react-aria-components'
import { Tooltip, TooltipTrigger } from './tooltip'

/**
 * ViewToggle — controlled segmented icon-toggle (port of gs-platform's
 * `ViewToggle`).
 *
 * gs renders N 36px-square icon buttons; exactly one is active. The Tasks /
 * Projects screens use it as the view-switcher (Table / Kanban / Calendar), so
 * the API is kept generic: pass any list of `{ id, icon, label }` options.
 *
 * Built on React Aria Components `ToggleButtonGroup` + `ToggleButton` (single
 * selection, empty-selection disallowed). RAC supplies the roving-tabindex
 * radiogroup-style keyboard model (arrow keys move + select), `aria-pressed`
 * state and focus management for free. Each option's `label` is its accessible
 * name (`aria-label`) and its hover/focus tooltip.
 *
 * gs SCSS → our tokens (Tailwind + `@app/tokens` CSS vars, no SCSS — hard rule
 * #3). The gs active treatment is a blue `#007bff` border — flagged OFF-brand,
 * so the active segment uses our brand treatment instead (`fg` border +
 * `surface-muted` fill). No blue anywhere.
 *   - resting border `rgba(0,0,0,.1)` → `border-fg/10` (translucent black, closest)
 *   - radius `4px`                    → `rounded-[4px]`
 *   - hover bg `#f9f9f9`              → `surface-card` (#f7f6f2)
 *   - active border (gs blue)         → `fg` (#0d0d0d) — on-brand
 *   - active bg                       → `surface-muted` (#eceae1)
 *   - active press `scale(.95)`       → `data-[pressed]:scale-95`
 *   - icon box `16px`                 → `h-4 w-4`
 */

export type ViewToggleOption = {
	/** Stable identifier — matched against `value` and returned by `onChange`. */
	id: string
	/** Icon node rendered inside the 16px box (decorative; `label` names it). */
	icon: ReactNode
	/** Accessible name + hover/focus tooltip for the option. */
	label: string
}

export type ViewToggleProps = {
	/** The selectable view options, rendered left-to-right. */
	options: ViewToggleOption[]
	/** Currently-active option id (controlled). */
	value: string
	/** Fired with the newly-selected option id. */
	onChange: (id: string) => void
	/** Accessible name for the whole group (e.g. "Switch view"). */
	'aria-label': string
	/** Disable the entire group. */
	isDisabled?: boolean
	className?: string
}

const buttonClass =
	'inline-flex h-9 w-9 shrink-0 cursor-pointer select-none items-center justify-center rounded-[4px] ' +
	'border border-fg/10 bg-surface text-fg outline-none transition-all duration-200 ' +
	'data-[hovered]:bg-surface-card ' +
	// On-brand active treatment (NOT gs blue): fg border + surface-muted fill.
	'data-[selected]:border-fg data-[selected]:bg-surface-muted ' +
	'data-[pressed]:scale-95 ' +
	'data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focus-visible]:ring-offset-2 ' +
	'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50'

export function ViewToggle({
	options,
	value,
	onChange,
	isDisabled,
	className,
	'aria-label': ariaLabel,
}: ViewToggleProps) {
	return (
		<ToggleButtonGroup
			aria-label={ariaLabel}
			selectionMode="single"
			disallowEmptySelection
			isDisabled={isDisabled}
			selectedKeys={[value]}
			onSelectionChange={keys => {
				const next = [...keys][0]
				if (next != null && String(next) !== value) onChange(String(next))
			}}
			className={['inline-flex items-center gap-1', className].filter(Boolean).join(' ')}
		>
			{options.map(option => (
				<TooltipTrigger key={option.id}>
					<ToggleButton id={option.id} aria-label={option.label} className={buttonClass}>
						<span
							className="flex h-4 w-4 items-center justify-center [&_svg]:h-4 [&_svg]:w-4"
							aria-hidden="true"
						>
							{option.icon}
						</span>
					</ToggleButton>
					<Tooltip>{option.label}</Tooltip>
				</TooltipTrigger>
			))}
		</ToggleButtonGroup>
	)
}
