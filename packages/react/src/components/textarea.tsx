import type { ReactNode } from 'react'
import {
	FieldError,
	Label,
	Text,
	TextArea as RACTextArea,
	TextField,
	type TextFieldProps,
} from 'react-aria-components'
import { uic } from '../utils/uic'
import {
	fieldDescriptionClass,
	fieldErrorClass,
	fieldLabelClass,
	fieldStackClass,
	filledFieldClasses,
	outlinedFieldClasses,
	type FieldAppearance,
} from './field-appearance'

/**
 * Textarea — labelled multi-line text field.
 *
 * Ported 1:1 from gs-platform's `Textarea` (filled field, 120px min-height,
 * vertical resize, brand-green focus border). Built on React Aria Components
 * `TextField` + `TextArea` so the label / description / error are associated
 * automatically via `aria-describedby` + `aria-invalid`. Styling comes from
 * `uic` (Tailwind + `@app/tokens` CSS vars). API mirrors our `Input`.
 */
const StyledTextArea = uic(RACTextArea, {
	displayName: 'TextAreaControl',
	// White fill so the field reads as editable — matches input.tsx. The gs
	// original used cream (surface-card), but our Card surface is also surface-card,
	// so a field inside a card vanished / looked disabled. Inverted: active = white
	// (surface), disabled = muted cream. border #eceae1 → border · hover #aba89c →
	// fg-subtle · focus #75e7b8 → brand-green · error → danger. min-h-[120px] is a
	// control dimension (not a design token) — gs uses a literal 120px here too.
	baseClass: 'min-h-30 w-full resize-y rounded-lg px-4 py-3',
	variants: {
		appearance: {
			filled: filledFieldClasses,
			outlined: outlinedFieldClasses(),
		},
	},
	defaultVariants: { appearance: 'outlined' },
})

export type TextareaProps = TextFieldProps & {
	appearance?: FieldAppearance
	/** Visible field label (required for accessibility). */
	label: ReactNode
	/** Helper text rendered under the field. */
	description?: ReactNode
	/** Error message; pass a string for a static error or rely on validation. */
	errorMessage?: string
	placeholder?: string
	/** Initial visible row count (the field still grows / resizes vertically). */
	rows?: number
	/** Optional class for the inner native textarea, used by source-specific modal layouts. */
	textAreaClassName?: string
}

export const Textarea = ({ label, description, errorMessage, placeholder, rows, textAreaClassName, appearance = 'outlined', ...props }: TextareaProps) => (
	// Label and gap match `Input` in both appearances (gs 17px/20px field label,
	// 12px to the control), so a Title + Description pair reads as one form.
	<TextField {...props} className={`${fieldStackClass} w-full`}>
		<Label className={fieldLabelClass}>{label}</Label>
		<StyledTextArea className={textAreaClassName} placeholder={placeholder} rows={rows} appearance={appearance} />
		{description ? (
			<Text slot="description" className={fieldDescriptionClass}>
				{description}
			</Text>
		) : null}
		<FieldError className={fieldErrorClass}>{errorMessage}</FieldError>
	</TextField>
)
