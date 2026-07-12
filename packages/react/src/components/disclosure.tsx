import {
	Disclosure as RACDisclosure,
	type DisclosureProps as RACDisclosureProps,
	DisclosurePanel as RACDisclosurePanel,
	type DisclosurePanelProps as RACDisclosurePanelProps,
} from 'react-aria-components'
import { uic } from '../utils/uic'

/**
 * Disclosure — collapsible section built on React Aria Components `Disclosure`.
 *
 * RAC supplies the WAI-ARIA disclosure pattern: `aria-expanded` /
 * `aria-controls` wiring between the trigger and the panel, keyboard
 * activation and hidden-until-expanded panel semantics. Compose with the
 * `@app/ui` `Button` as the trigger (pass `slot="trigger"`):
 *
 *   <Disclosure>
 *     <Button slot="trigger" variant="ghost">Details</Button>
 *     <DisclosurePanel>…</DisclosurePanel>
 *   </Disclosure>
 *
 * Deliberately unstyled — consumers shape the row (border, background,
 * padding) via `className`; `uic` merges it with `tailwind-merge`.
 */
export const Disclosure = uic(RACDisclosure, {
	displayName: 'Disclosure',
}) as (props: RACDisclosureProps & { 'data-testid'?: string }) => ReturnType<typeof RACDisclosure>

export const DisclosurePanel = uic(RACDisclosurePanel, {
	displayName: 'DisclosurePanel',
}) as (
	props: RACDisclosurePanelProps & { 'data-testid'?: string },
) => ReturnType<typeof RACDisclosurePanel>

export type DisclosureProps = RACDisclosureProps
export type DisclosurePanelProps = RACDisclosurePanelProps
