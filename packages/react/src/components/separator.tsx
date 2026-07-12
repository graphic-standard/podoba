import { Separator as RACSeparator, type SeparatorProps as RACSeparatorProps } from 'react-aria-components'

/**
 * Separator — thin 1px rule (port of gs-platform's `Separator`).
 *
 * Built on React Aria Components `Separator`, which renders the element with
 * `role="separator"` and the correct `aria-orientation` for assistive tech.
 *
 * gs SCSS → our tokens (Tailwind + `@app/tokens` CSS vars, no SCSS — hard rule
 * #3): the gs `1px` rule on `var(--color-border)` (#eceae1) maps to our
 * `border` token. Horizontal = full-width 1px-tall line; vertical = full-height
 * 1px-wide line. Driven with `bg-border` so the rule paints regardless of the
 * element's own border-box.
 */

export type SeparatorProps = RACSeparatorProps & {
	/** Rule direction. Defaults to horizontal. */
	orientation?: 'horizontal' | 'vertical'
	className?: string
}

export function Separator({ orientation = 'horizontal', className, ...props }: SeparatorProps) {
	return (
		<RACSeparator
			{...props}
			orientation={orientation}
			className={[
				'shrink-0 bg-border',
				orientation === 'vertical' ? 'h-full w-px' : 'h-px w-full',
				className,
			]
				.filter(Boolean)
				.join(' ')}
		/>
	)
}
