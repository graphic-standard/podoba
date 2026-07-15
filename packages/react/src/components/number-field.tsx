import type { ReactNode } from 'react'
import {
	Button as RACButton,
	FieldError,
	Group,
	Input as RACInput,
	Label,
	NumberField as RACNumberField,
	type NumberFieldProps as RACNumberFieldProps,
	Text,
} from 'react-aria-components'

/**
 * NumberField — numeric input with steppers, min/max and locale-aware formatting
 * (pass `formatOptions` for currency/percent/units). Built on React Aria
 * Components `NumberField`; styled to match the other form fields.
 */
const stepper =
	'flex h-full w-9 shrink-0 items-center justify-center text-body text-fg-muted outline-none transition-colors ' +
	'hover:bg-surface-muted hover:text-fg data-[pressed]:bg-surface-muted data-[disabled]:opacity-40'

export type NumberFieldProps = RACNumberFieldProps & {
	/** Visible label (required for accessibility). */
	label: ReactNode
	description?: ReactNode
	errorMessage?: string
	placeholder?: string
}

export const NumberField = ({ label, description, errorMessage, placeholder, ...props }: NumberFieldProps) => (
	<RACNumberField {...props} className="group flex flex-col gap-2">
		<Label className="text-heading5 font-medium text-fg">{label}</Label>
		<Group
			className={
				'flex h-12 w-full items-center overflow-hidden rounded-lg border border-border bg-surface text-small text-fg transition-colors ' +
				'data-[hovered]:border-fg-subtle ' +
				'data-[focus-within]:border-brand-green data-[focus-within]:ring-2 data-[focus-within]:ring-ring ' +
				'group-data-[invalid]:border-danger group-data-[invalid]:ring-2 group-data-[invalid]:ring-danger ' +
				'data-[disabled]:bg-surface-muted data-[disabled]:opacity-60'
			}
		>
			<RACButton slot="decrement" className={`${stepper} border-r border-border`}>
				–
			</RACButton>
			<RACInput
				placeholder={placeholder}
				className="min-w-0 flex-1 bg-transparent px-4 text-small tabular-nums text-fg outline-none placeholder:text-fg-muted"
			/>
			<RACButton slot="increment" className={`${stepper} border-l border-border`}>
				+
			</RACButton>
		</Group>
		{description ? (
			<Text slot="description" className="text-label text-fg-muted">
				{description}
			</Text>
		) : null}
		<FieldError className="text-label text-danger">{errorMessage}</FieldError>
	</RACNumberField>
)
