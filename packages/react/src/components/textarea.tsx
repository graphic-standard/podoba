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
	// White fill so the field reads as editable — matches input.tsx. The gs
	// original used cream (surface-card), but our Card surface is also surface-card,
	// so a field inside a card vanished / looked disabled. Inverted: active = white
	// (surface), disabled = muted cream. border #eceae1 → border · hover #aba89c →
	// fg-subtle · focus #75e7b8 → brand-green · error → danger. min-h-[120px] is a
	// control dimension (not a design token) — gs uses a literal 120px here too.
	baseClass:
		'min-h-[120px] w-full resize-y rounded-lg border border-border bg-surface px-4 py-3 text-small text-fg ' +
		'outline-none transition-colors duration-200 placeholder:text-fg-muted ' +
		'data-[hovered]:border-fg-subtle ' +
		'data-[focused]:border-brand-green data-[focused]:ring-2 data-[focused]:ring-ring ' +
		'data-[invalid]:border-danger data-[invalid]:ring-danger ' +
		'data-[disabled]:bg-surface-muted data-[disabled]:opacity-60 data-[disabled]:pointer-events-none',
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
		<Label className="text-small font-medium text-fg">{label}</Label>
		<StyledTextArea placeholder={placeholder} rows={rows} />
		{description ? (
			<Text slot="description" className="text-label text-fg-muted">
				{description}
			</Text>
		) : null}
		<FieldError className="text-label text-danger">{errorMessage}</FieldError>
	</TextField>
)
