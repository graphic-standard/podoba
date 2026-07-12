import type { ReactNode } from 'react'
import {
	FieldError,
	Label,
	Radio as RACRadio,
	RadioGroup as RACRadioGroup,
	type RadioGroupProps as RACRadioGroupProps,
	type RadioProps as RACRadioProps,
	Text,
} from 'react-aria-components'

/**
 * RadioGroup + Radio — labelled single-choice control.
 *
 * Ported 1:1 from gs-platform's `Radio` (20px round, 2px border, selected =
 * ring + 10px filled `fg` dot, 200ms transition). Built on React Aria
 * Components `RadioGroup` + `Radio` — roving tabindex, arrow-key navigation and
 * ARIA grouping come for free; the group label / description / error are
 * associated automatically. Callers compose `<Radio>` children inside
 * `<RadioGroup>`. Styling = Tailwind + `@app/tokens`.
 */
export type RadioGroupProps = RACRadioGroupProps & {
	/** Visible group label. */
	label?: ReactNode
	/** Helper text rendered under the group. */
	description?: ReactNode
	/** Error message; pass a string for a static error or rely on validation. */
	errorMessage?: string
	children: ReactNode
}

export const RadioGroup = ({ label, description, errorMessage, children, ...props }: RadioGroupProps) => (
	<RACRadioGroup {...props} className="flex flex-col gap-2">
		{label ? <Label className="text-sm font-medium text-fg">{label}</Label> : null}
		<div className="flex flex-col gap-3">{children}</div>
		{description ? (
			<Text slot="description" className="text-xs text-fg-muted">
				{description}
			</Text>
		) : null}
		<FieldError className="text-xs text-danger">{errorMessage}</FieldError>
	</RACRadioGroup>
)

export type RadioProps = Omit<RACRadioProps, 'children'> & {
	/** Visible label rendered next to the dot. */
	children?: ReactNode
}

export const Radio = ({ children, ...props }: RadioProps) => (
	<RACRadio
		{...props}
		className="group flex cursor-pointer select-none items-center gap-3 text-sm text-fg data-[disabled]:cursor-not-allowed"
	>
		{/* gs token map: border #eceae1 → border · hover #aba89c → fg-subtle ·
		    selected dot/border #0d0d0d → fg · error → danger. */}
		<span
			className={
				'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-border bg-surface ' +
				'transition-all duration-200 ' +
				'group-data-[hovered]:border-fg-subtle ' +
				'group-data-[selected]:border-fg ' +
				'group-data-[focus-visible]:ring-2 group-data-[focus-visible]:ring-ring group-data-[focus-visible]:ring-offset-2 ' +
				'group-data-[invalid]:border-danger ' +
				'group-data-[disabled]:opacity-50'
			}
		>
			<span className="h-2.5 w-2.5 rounded-full bg-fg opacity-0 transition-opacity duration-200 group-data-[selected]:opacity-100" />
		</span>
		{children}
	</RACRadio>
)
