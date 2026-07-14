import {
	Button as RACButton,
	Disclosure as RACDisclosure,
	DisclosurePanel as RACDisclosurePanel,
	type DisclosureProps as RACDisclosureProps,
} from 'react-aria-components'
import type { ReactNode } from 'react'

/**
 * CollapsibleCard — a titled, expandable card (title + description + chevron,
 * expanding to reveal a body).
 *
 * Styled composition over React Aria Components' `Disclosure` (see
 * `./disclosure.tsx` for the unstyled primitive): RAC supplies the WAI-ARIA
 * disclosure wiring (`aria-expanded` / `aria-controls`, keyboard activation,
 * hidden-until-expanded panel) and, on its root element, a `data-expanded`
 * attribute. We make the root a Tailwind `group`, so the chevron rotates via
 * `group-data-[expanded]:rotate-90` — no render-prop plumbing needed.
 *
 * Token mapping (Tailwind + `@podoba/tokens` CSS vars — no SCSS, hard rule #3):
 *   - surface → `bg-surface-card` (#f7f6f2), 1px `border-border`, `rounded-lg`
 *     (8px) — same skin as `Card` / `StatsCard`.
 *   - title → `text-heading4` (1.125rem) `font-medium text-fg`.
 *   - description → `text-body text-fg-muted`.
 *
 * Presentational only (hard rule #1): all copy via props, no API/i18n.
 *
 * Controlled or uncontrolled — pass `isExpanded` + `onExpandedChange` to control,
 * or `defaultExpanded` to seed the uncontrolled state.
 *
 *   <CollapsibleCard title="Variables" description="Shared variables applied across this template.">
 *     <Select label="Color theme" …/>
 *   </CollapsibleCard>
 */
export type CollapsibleCardProps = {
	/** Bold card title (the always-visible header line). */
	title: ReactNode
	/** Optional muted supporting line under the title. */
	description?: ReactNode
	/** The collapsible body, revealed when expanded. */
	children?: ReactNode
	/** Seed the uncontrolled expanded state. */
	defaultExpanded?: boolean
	/** Controlled expanded state (pair with `onExpandedChange`). */
	isExpanded?: boolean
	/** Fires when the user toggles the card. */
	onExpandedChange?: (isExpanded: boolean) => void
	/** Disable expand/collapse. */
	isDisabled?: boolean
	/** Extra classes merged onto the card root. */
	className?: string
	'data-testid'?: string
}

const Chevron = () => (
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		aria-hidden="true"
		className="mt-0.5 shrink-0 text-fg transition-transform duration-150 group-data-[expanded]:rotate-90"
	>
		<path
			d="M6 4l4 4-4 4"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
)

export function CollapsibleCard({
	title,
	description,
	children,
	defaultExpanded,
	isExpanded,
	onExpandedChange,
	isDisabled,
	className,
	...rest
}: CollapsibleCardProps) {
	const disclosureProps: RACDisclosureProps = {
		defaultExpanded,
		isExpanded,
		onExpandedChange,
		isDisabled,
	}
	return (
		<RACDisclosure
			{...disclosureProps}
			data-testid={rest['data-testid']}
			className={[
				'group overflow-hidden rounded-lg border border-border bg-surface-card',
				className,
			]
				.filter(Boolean)
				.join(' ')}
		>
			<RACButton
				slot="trigger"
				className={
					'flex w-full items-center justify-between gap-4 rounded-lg p-6 text-left outline-none ' +
					'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60 ' +
					'data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focus-visible]:ring-inset'
				}
			>
				<span className="flex flex-col gap-1">
					<span className="text-heading4 font-medium leading-tight text-fg">{title}</span>
					{description ? (
						<span className="text-body leading-snug text-fg-muted">{description}</span>
					) : null}
				</span>
				<Chevron />
			</RACButton>
			<RACDisclosurePanel className="px-6 pb-6">{children}</RACDisclosurePanel>
		</RACDisclosure>
	)
}
