import type { ReactNode } from 'react'
import { Checkbox as RACCheckbox, type CheckboxProps as RACCheckboxProps } from 'react-aria-components'

/**
 * Checkbox — labelled boolean control with indeterminate support.
 *
 * Ported 1:1 from gs-platform's `Checkbox` (20px box, 2px border, checked =
 * filled `fg` with a white check, 200ms transition). Built on React Aria
 * Components `Checkbox`, which renders the `<label>` wrapper + hidden native
 * input and exposes `isSelected` / `isIndeterminate` via its render prop and
 * `data-*` attributes (keyboard + ARIA for free). The visual box is a styled
 * `<span>` driven by `group-data-[…]` hooks. Styling = Tailwind + `@app/tokens`.
 */
const checkIcon = (
	<svg viewBox="0 0 14 14" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
		<path
			d="M11.6666 3.5L5.24998 9.91667L2.33331 7"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
)

const dashIcon = (
	<svg viewBox="0 0 14 14" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
		<path d="M3 7H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
	</svg>
)

export type CheckboxProps = Omit<RACCheckboxProps, 'children'> & {
	/** Visible label rendered next to the box. */
	children?: ReactNode
}

export const Checkbox = ({ children, ...props }: CheckboxProps) => (
	<RACCheckbox
		{...props}
		className="group flex cursor-pointer select-none items-center gap-3 text-small text-fg data-[disabled]:cursor-not-allowed"
	>
		{({ isSelected, isIndeterminate }) => (
			<>
				{/* gs token map: border #eceae1 → border · hover #aba89c → fg-subtle ·
				    checked fill #0d0d0d → fg · check #ffffff → fg-inverted · error → danger. */}
				<span
					className={
						'flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border-2 border-border bg-surface text-fg-inverted ' +
						'transition-all duration-200 ' +
						'group-data-[hovered]:border-fg-subtle ' +
						'group-data-[selected]:border-fg group-data-[selected]:bg-fg ' +
						'group-data-[indeterminate]:border-fg group-data-[indeterminate]:bg-fg ' +
						'group-data-[focus-visible]:ring-2 group-data-[focus-visible]:ring-ring group-data-[focus-visible]:ring-offset-2 ' +
						'group-data-[invalid]:border-danger ' +
						'group-data-[disabled]:opacity-50'
					}
				>
					{isIndeterminate ? dashIcon : isSelected ? checkIcon : null}
				</span>
				{children}
			</>
		)}
	</RACCheckbox>
)
