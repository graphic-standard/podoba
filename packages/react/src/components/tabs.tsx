import {
	Tab as RACTab,
	type TabProps,
	TabList as RACTabList,
	type TabListProps,
	TabPanel as RACTabPanel,
	type TabPanelProps,
	Tabs as RACTabs,
} from 'react-aria-components'
import { uic } from '../utils/uic'

/**
 * Tabs — built on React Aria Components `Tabs`.
 *
 * RAC supplies the WAI-ARIA tabs pattern: roving tabindex, arrow-key
 * navigation, `aria-selected` / `aria-controls` wiring and panel association.
 * Styling via `uic`.
 */
export const Tabs = RACTabs

export const TabList = uic(RACTabList, {
	displayName: 'TabList',
	baseClass: 'flex gap-2 border-b border-border',
}) as <T extends object>(props: TabListProps<T>) => ReturnType<typeof RACTabList>

export const Tab = uic(RACTab, {
	displayName: 'Tab',
	// gs `Tabs.module.scss` `.trigger`: 12/16px padding, heading-5 (16px/20px) medium,
	// `--color-text-secondary` ink (#242423, the light neutral `surface-inverted`
	// carries), 2px underline, `all 200ms ease-in-out`.
	baseClass:
		'cursor-pointer select-none border-b-2 border-transparent px-4 py-3 text-heading5 font-medium text-surface-inverted ' +
		'outline-none transition-all duration-200 ease-[ease-in-out] motion-reduce:transition-none ' +
		'data-[hovered]:text-fg ' +
		'data-[selected]:border-brand-primary data-[selected]:text-fg ' +
		'data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring ' +
		'data-[disabled]:opacity-50 data-[disabled]:pointer-events-none',
}) as (props: TabProps) => ReturnType<typeof RACTab>

export const TabPanel = uic(RACTabPanel, {
	displayName: 'TabPanel',
	baseClass: 'py-4 text-small text-fg outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring',
}) as (props: TabPanelProps) => ReturnType<typeof RACTabPanel>
