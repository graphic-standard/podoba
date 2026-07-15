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
	// White fill so the field reads as editable. The gs original used a cream
	// (#f7f6f2 → surface-card) fill, but our Card surface is ALSO surface-card, so
	// a filled field inside a card vanished and read as disabled. Inverted: active
	// = white (surface), disabled = the muted cream. border #eceae1 → border ·
	// hover #aba89c → fg-subtle · focus #75e7b8 → brand-green · error → danger.
	// Identical to textarea.tsx's filled-field skin; `fieldSize` adds the
	// single-line height (gs sizes the field via padding only).
	baseClass:
		'w-full rounded-lg border border-border bg-surface px-4 text-small text-fg ' +
		'outline-none transition-colors duration-200 placeholder:text-fg-muted ' +
		'data-[hovered]:border-fg-subtle ' +
		'data-[focused]:border-brand-green data-[focused]:ring-2 data-[focused]:ring-ring ' +
		'data-[invalid]:border-danger data-[invalid]:ring-danger ' +
		'data-[disabled]:bg-surface-muted data-[disabled]:opacity-60 data-[disabled]:pointer-events-none',
	variants: {
		// `fieldSize` (not `size`) to avoid colliding with the native <input size>
		// attribute, which RAC's Input inherits (a numeric prop).
		fieldSize: {
			sm: 'h-8',
			md: 'h-10',
			lg: 'h-12',
		},
	},
	defaultVariants: {
		fieldSize: 'md',
	},
})

export type InputProps = TextFieldProps & {
	/** Visible field label (required for accessibility). */
	label: ReactNode
	/** Helper text rendered under the field. */
	description?: ReactNode
	/** Error message; pass a string for a static error or rely on validation. */
	errorMessage?: string
	placeholder?: string
	size?: 'sm' | 'md' | 'lg'
}

export const Input = ({ label, description, errorMessage, placeholder, size, ...props }: InputProps) => (
	<TextField {...props} className="flex w-full flex-col gap-2">
		<Label className="text-heading5 font-medium text-fg">{label}</Label>
		<StyledInput placeholder={placeholder} fieldSize={size} />
		{description ? (
			<Text slot="description" className="text-label text-fg-muted">
				{description}
			</Text>
		) : null}
		<FieldError className="text-label text-danger">{errorMessage}</FieldError>
	</TextField>
)
