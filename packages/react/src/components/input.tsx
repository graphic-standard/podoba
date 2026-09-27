import type { ReactNode } from 'react'
import {
	FieldError,
	Input as RACInput,
	Label,
	Text,
	TextField,
	type TextFieldProps,
} from 'react-aria-components'
import { uic } from '../utils/uic'
import {
	fieldDescriptionClass,
	fieldErrorClass,
	fieldLabelClass,
	fieldSizeClasses,
	fieldStackClass,
	filledFieldClasses,
	outlinedFieldClasses,
	type FieldAppearance,
	type FieldSize,
} from './field-appearance'

/**
 * Input — labelled single-line text field.
 *
 * Ported 1:1 from gs-platform's `Input` (filled field, brand-green focus
 * border). Built on React Aria Components `TextField` (associates label /
 * description / error automatically via `aria-describedby` + `aria-invalid`).
 * The inner `<input>` styling comes from `uic` and matches our `Textarea`
 * (same filled-field spec) so the two controls stay visually consistent.
 */
const StyledInput = uic(RACInput, {
	displayName: 'InputControl',
	// White fill + border so the field reads as editable. The gs original used a
	// borderless cream (#f7f6f2 → surface-card) fill, but our Card surface is ALSO
	// surface-card — and in dark theme surface-card and surface are the SAME colour
	// (#242423) — so a borderless cream field vanishes on both. Inverted: active =
	// surface, disabled = the muted cream. border #eceae1 → border · hover #aba89c →
	// fg-subtle · focus #75e7b8 → brand-green · error → danger. That outlined skin
	// lives in `outlinedFieldClasses` and every outlined control uses it, so they
	// all render the same box; `fieldSize` adds the single-line height on top.
	baseClass: 'w-full rounded-lg px-4',
	variants: {
		appearance: {
			filled: filledFieldClasses,
			outlined: outlinedFieldClasses(),
		},
		// `fieldSize` (not `size`) to avoid colliding with the native <input size>
		// attribute, which RAC's Input inherits (a numeric prop).
		fieldSize: { ...fieldSizeClasses, filled: 'h-10.5 py-3' },
	},
	defaultVariants: {
		appearance: 'outlined',
		fieldSize: 'md',
	},
})

export type InputProps = TextFieldProps & {
	/** Filled matches the original Manager dialog fields; outlined remains the default. */
	appearance?: FieldAppearance
	/** Visible field label (required for accessibility). */
	label: ReactNode
	/** Helper text rendered under the field. */
	description?: ReactNode
	/** Error message; pass a string for a static error or rely on validation. */
	errorMessage?: string
	placeholder?: string
	size?: FieldSize
	/** Optional class for the TextField root. */
	rootClassName?: string
	/** Optional class for the inner native input (for product-specific composition). */
	inputClassName?: string
}

export const Input = ({ label, description, errorMessage, placeholder, size, appearance = 'outlined', rootClassName, inputClassName, ...props }: InputProps) => (
	<TextField {...props} className={`${fieldStackClass} w-full ${rootClassName ?? ''}`}>
		<Label className={fieldLabelClass}>{label}</Label>
		<StyledInput className={inputClassName} placeholder={placeholder} appearance={appearance} fieldSize={size ?? (appearance === 'filled' ? 'filled' : undefined)} />
		{description ? (
			<Text slot="description" className={fieldDescriptionClass}>
				{description}
			</Text>
		) : null}
		<FieldError className={fieldErrorClass}>{errorMessage}</FieldError>
	</TextField>
)
