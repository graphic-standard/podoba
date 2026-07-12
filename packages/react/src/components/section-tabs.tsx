import type { ReactNode } from 'react'
import { Button } from './button'

/**
 * SectionTabs — horizontal section/filter tab row (port of gs-platform
 * `SectionTabs`, also the reusable form of `apps/web`'s `FilterBar`).
 *
 * gs-platform renders left-aligned text tabs (active = subtle pill) with an
 * optional leading "reset" glyph button. Disabled sections are dimmed; here we
 * additionally surface a small "Soon" badge on disabled tabs so unbuilt sections
 * read as upcoming rather than broken.
 *
 * Controlled: the consumer owns `active` and handles `onChange`. Each tab is a
 * React Aria `Button`, so keyboard activation, focus rings and disabled handling
 * come for free. The selected tab carries `aria-pressed` for SR state.
 *
 * Presentational only (hard rule #1): all labels via props, no API/i18n.
 */

export type SectionTab = {
	key: string
	label: ReactNode
	/** Disabled tabs render dimmed with a "Soon" badge and cannot be selected. */
	disabled?: boolean
}

export type SectionTabsProps = {
	tabs: SectionTab[]
	active: string
	onChange: (key: string) => void
	/** Label shown on disabled tabs. Defaults to "Soon" (override per-locale). */
	soonLabel?: ReactNode
	/** When set, renders a leading reset control. */
	onReset?: () => void
	/** Accessible label for the reset control (e.g. translated "Reset filters"). */
	resetLabel?: string
	/** Glyph for the reset control; defaults to a small grid icon. */
	resetIcon?: ReactNode
	className?: string
}

const GridGlyph = () => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
		<rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
		<rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
		<rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
		<rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
	</svg>
)

const tabBase =
	'inline-flex h-7 items-center gap-2 rounded-sm px-3 text-compact text-fg-muted outline-none ' +
	'transition-colors duration-[120ms] ease-[ease] data-[hovered]:bg-surface-muted data-[hovered]:text-fg ' +
	'data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring ' +
	'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[disabled]:bg-transparent data-[disabled]:text-fg-muted'

const tabActive = 'bg-surface-muted font-medium text-fg'

export function SectionTabs({
	tabs,
	active,
	onChange,
	soonLabel = 'Soon',
	onReset,
	resetLabel = 'Reset',
	resetIcon,
	className,
}: SectionTabsProps) {
	return (
		<div className={['flex flex-wrap items-center gap-1', className].filter(Boolean).join(' ')} role="group">
			{onReset ? (
				<Button
					variant="ghost"
					aria-label={resetLabel}
					onPress={onReset}
					className="h-7 w-7 rounded-sm p-0 text-fg-muted data-[hovered]:text-fg"
				>
					{resetIcon ?? <GridGlyph />}
				</Button>
			) : null}
			{tabs.map((tab) => {
				const selected = active === tab.key
				return (
					<Button
						key={tab.key}
						variant="ghost"
						isDisabled={tab.disabled}
						aria-pressed={selected}
						onPress={() => onChange(tab.key)}
						className={[tabBase, selected && !tab.disabled ? tabActive : ''].filter(Boolean).join(' ')}
					>
						<span>{tab.label}</span>
						{tab.disabled ? (
							<span className="inline-flex items-center rounded-full bg-surface-muted px-1.5 py-0.5 text-micro font-medium leading-none text-fg-muted">
								{soonLabel}
							</span>
						) : null}
					</Button>
				)
			})}
		</div>
	)
}
