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
import {
	fieldDescriptionClass,
	fieldControlClasses,
	type FieldAppearance,
	fieldErrorClass,
	fieldLabelClasses,
	type FieldLabelSize,
	fieldStackClass,
	type FieldSize,
} from './field-appearance'

/**
 * NumberField — numeric input with steppers, min/max and locale-aware formatting
 * (pass `formatOptions` for currency/percent/units). Built on React Aria
 * Components `NumberField`; styled to match the other form fields.
 */
const stepper =
	'flex h-full w-9 shrink-0 cursor-pointer items-center justify-center text-body text-fg-muted outline-none transition-colors ' +
	'hover:bg-surface-muted hover:text-fg data-[pressed]:bg-surface-muted data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40'

export type NumberFieldProps = RACNumberFieldProps & {
	/** Visible label (required for accessibility). */
	appearance?: FieldAppearance
	labelSize?: FieldLabelSize
	label: ReactNode
	description?: ReactNode
	errorMessage?: string
	placeholder?: string
	/** Field height, matching `Input`'s `size`. */
	size?: FieldSize
}

export const NumberField = ({
	label,
	labelSize = 'default',
	appearance = 'outlined',
	description,
	errorMessage,
	placeholder,
	size = 'md',
	...props
}: NumberFieldProps) => (
	<RACNumberField {...props} className={`group ${fieldStackClass}`}>
		<Label className={fieldLabelClasses[labelSize]}>{label}</Label>
		<Group
			className={`flex w-full items-center overflow-hidden rounded-lg ${fieldControlClasses(appearance, size, true)}`}
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
			<Text slot="description" className={fieldDescriptionClass}>
				{description}
			</Text>
		) : null}
		<FieldError className={fieldErrorClass}>{errorMessage}</FieldError>
	</RACNumberField>
)
