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
	// gs token map: bg #f7f6f2 → surface-card · border #eceae1 → border · hover
	// #aba89c → fg-subtle · focus #75e7b8 → brand-green · error → danger.
	// min-h-[120px] is a control dimension (not a design token) — gs uses a literal
	// 120px here too; there is no spacing token for it.
	baseClass:
		'min-h-[120px] w-full resize-y rounded-lg border border-border bg-surface-card px-4 py-3 text-sm text-fg ' +
		'outline-none transition-colors duration-200 placeholder:text-fg-muted ' +
		'data-[hovered]:border-fg-subtle ' +
		'data-[focused]:border-brand-green data-[focused]:ring-2 data-[focused]:ring-ring ' +
		'data-[invalid]:border-danger data-[invalid]:ring-danger ' +
		'data-[disabled]:opacity-50 data-[disabled]:pointer-events-none',
})

export type TextareaProps = TextFieldProps & {
	/** Visible field label (required for accessibility). */
	label: ReactNode
	/** Helper text rendered under the field. */
	description?: ReactNode
	/** Error message; pass a string for a static error or rely on validation. */
	errorMessage?: string
	placeholder?: string
	/** Initial visible row count (the field still grows / resizes vertically). */
	rows?: number
}

export const Textarea = ({ label, description, errorMessage, placeholder, rows, ...props }: TextareaProps) => (
	<TextField {...props} className="flex w-full flex-col gap-2">
		<Label className="text-sm font-medium text-fg">{label}</Label>
		<StyledTextArea placeholder={placeholder} rows={rows} />
		{description ? (
			<Text slot="description" className="text-xs text-fg-muted">
				{description}
			</Text>
		) : null}
		<FieldError className="text-xs text-danger">{errorMessage}</FieldError>
	</TextField>
)
