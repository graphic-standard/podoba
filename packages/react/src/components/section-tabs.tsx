import type { ReactNode } from 'react'
import { Button } from './button'
import { SwitchViewIcon } from './source-icons'

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
	/**
	 * gs `switchable` tab: pressing the already selected tab switches the view
	 * (e.g. Tasks list and board) instead of re-selecting it. While selected it shows
	 * the source "switch view" burst before the label, revealed on hover and keyboard
	 * focus (width 0 to 14px, opacity 0 to 1, 120ms `ease`).
	 */
	switchable?: boolean
	/** Native tooltip on a selected switchable tab (translated, e.g. "Switch view"). */
	switchHintLabel?: string
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

// gs `.tabButton`: inactive ink `#242423` (the light-theme neutral that
// `surface-inverted` carries; it flips to a light ink on the dark shell), selected
// and hovered `fg` on `surface-muted`, background + colour eased over 120ms `ease`.
const tabBase =
	'inline-flex h-7 shrink-0 items-center gap-2 rounded-sm px-nav-x py-1.5 text-compact font-normal text-surface-inverted outline-none ' +
	'transition-colors duration-120 ease-[ease] motion-reduce:transition-none data-[hovered]:bg-surface-muted data-[hovered]:text-fg ' +
	'data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring ' +
	'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[disabled]:bg-transparent data-[disabled]:text-fg-muted'

const tabActive = 'bg-surface-muted text-fg'

// gs `.tabButton` (switchable form): 12px gap, so the selected tab is 12px wider even
// while the 0px icon is hidden (measured 77px at rest, 91px on hover for "All (18)").
const tabSwitchable = 'group/switch'
const tabSwitchIcon =
	'h-3.5 w-0 shrink-0 overflow-hidden opacity-0 transition-[width,opacity] duration-120 ease-[ease] motion-reduce:transition-none ' +
	'group-data-[hovered]/switch:w-3.5 group-data-[hovered]/switch:opacity-100 ' +
	'group-data-[focus-visible]/switch:w-3.5 group-data-[focus-visible]/switch:opacity-100'

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
							resetContent ? tabBase : 'h-7 w-7 rounded-sm p-0 text-surface-inverted data-[hovered]:text-fg',
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
				const switchHint = Boolean(tab.switchable && selected && !tab.disabled)
				return (
					<Button
						key={tab.key}
						variant="ghost"
						isDisabled={tab.disabled}
						aria-pressed={selected}
						onPress={() => onChange(tab.key)}
						data-switchable={switchHint || undefined}
						className={[tabBase, selected && !tab.disabled ? tabActive : '', switchHint ? tabSwitchable : '']
							.filter(Boolean)
							.join(' ')}
					>
						{switchHint ? (
							// React Aria's Button drops `title`, so the native hint rides on the content.
							<span title={tab.switchHintLabel} className="inline-flex items-center gap-3">
								<SwitchViewIcon className={tabSwitchIcon} />
								<span>{tab.label}</span>
							</span>
						) : (
							<span>{tab.label}</span>
						)}
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
