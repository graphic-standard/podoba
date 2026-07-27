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
	/** Visible reset content. When set, renders a source-style text tab (e.g. "Summary"). */
	resetContent?: ReactNode
	/** Whether the reset/overview destination is the currently selected section. */
	isResetSelected?: boolean
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
	'inline-flex h-7 shrink-0 items-center gap-2 rounded-sm px-nav-x py-1.5 text-compact font-normal text-fg-muted outline-none ' +
	'transition-colors duration-150 ease-in-out data-[hovered]:bg-surface-muted data-[hovered]:text-fg ' +
	'data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring ' +
	'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[disabled]:bg-transparent data-[disabled]:text-fg-muted'

const tabActive = 'bg-surface-muted text-fg'

export function SectionTabs({
	tabs,
	active,
	onChange,
	soonLabel = 'Soon',
	onReset,
	resetLabel = 'Reset',
	resetIcon,
	resetContent,
	isResetSelected = false,
	className,
}: SectionTabsProps) {
	return (
		<div
			className={[
				'flex min-h-9 w-full flex-nowrap items-start gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:w-2/3 lg:flex-wrap lg:overflow-visible lg:pb-0',
				className,
			]
				.filter(Boolean)
				.join(' ')}
			role="group"
		>
			{onReset ? (
				<div className="sticky left-0 z-10 shrink-0 bg-surface pr-1 lg:static lg:bg-transparent lg:pr-0">
					<Button
						variant="ghost"
						aria-label={resetLabel}
						aria-pressed={isResetSelected}
						onPress={onReset}
						className={[
							resetContent ? tabBase : 'h-7 w-7 rounded-sm p-0 text-fg-muted data-[hovered]:text-fg',
							isResetSelected ? tabActive : '',
						]
							.filter(Boolean)
							.join(' ')}
					>
						{resetContent ?? resetIcon ?? <GridGlyph />}
					</Button>
				</div>
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
