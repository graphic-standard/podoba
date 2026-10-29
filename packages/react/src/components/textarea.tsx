import { useFieldAutoFocus } from './field-autofocus'
import {
	useId,
	useRef,
	useState,
	type KeyboardEventHandler,
	type FormEventHandler,
	type Ref,
	type ReactNode,
} from 'react'
import { FieldError, Label, Text, TextArea as RACTextArea, TextField, type TextFieldProps } from 'react-aria-components'
import { uic } from '../utils/uic'
import {
	fieldDescriptionClass,
	fieldErrorClass,
	fieldLabelClasses,
	type FieldLabelSize,
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
	labelSize?: FieldLabelSize
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
	textAreaRef?: Ref<HTMLTextAreaElement>
	onTextAreaKeyDown?: KeyboardEventHandler<HTMLTextAreaElement>
	onTextAreaInput?: FormEventHandler<HTMLTextAreaElement>
}

export const Textarea = ({
	label,
	labelSize = 'default',
	description,
	errorMessage,
	placeholder,
	rows,
	textAreaClassName,
	textAreaRef,
	onTextAreaKeyDown,
	onTextAreaInput,
	appearance = 'outlined',
	autoFocus,
	...props
}: TextareaProps) => {
	const fieldRef = useFieldAutoFocus(autoFocus)
	return (
		// Label and gap match `Input` in both appearances (gs 17px/20px field label,
		// 12px to the control), so a Title + Description pair reads as one form.
		<TextField {...props} ref={fieldRef} className={`${fieldStackClass} w-full`}>
			<Label className={fieldLabelClasses[labelSize]}>{label}</Label>
			<StyledTextArea
				ref={textAreaRef}
				onKeyDown={onTextAreaKeyDown}
				onInput={onTextAreaInput}
				className={textAreaClassName}
				placeholder={placeholder}
				rows={rows}
				appearance={appearance}
			/>
			{description ? (
				<Text slot="description" className={fieldDescriptionClass}>
					{description}
				</Text>
			) : null}
			<FieldError className={fieldErrorClass}>{errorMessage}</FieldError>
		</TextField>
	)
}

export interface MentionTextareaProps {
	id?: string
	label: string
	value: string
	onChange: (value: string) => void
	options: ReadonlyArray<{ id: string; name: string }>
	placeholder?: string
	readOnly?: boolean
	autoFocus?: boolean
	rows?: number
}

/** Multiline comment field with keyboard-accessible @ people suggestions. */
export function MentionTextarea({
	id,
	label,
	value,
	onChange,
	options,
	placeholder,
	readOnly,
	autoFocus,
	rows = 3,
}: MentionTextareaProps): ReactNode {
	const listId = useId()
	const fieldId = id ?? `${listId}-field`
	const field = useRef<HTMLTextAreaElement>(null)
	const [mention, setMention] = useState<{ start: number; end: number; query: string } | null>(null)
	const [active, setActive] = useState(0)
	const matches = mention
		? options.filter((option) => option.name.toLocaleLowerCase().includes(mention.query.toLocaleLowerCase()))
		: []
	const open = !readOnly && matches.length > 0
	const activeIndex = Math.min(active, Math.max(0, matches.length - 1))
	const updateMention = (text: string, caret: number) => {
		const prefix = text.slice(0, caret)
		const match = /\s$/.test(prefix) ? null : /(?:^|\s)@([^@\n]*)$/.exec(prefix)
		setMention(match ? { start: caret - (match[1]?.length ?? 0) - 1, end: caret, query: match[1] ?? '' } : null)
		setActive(0)
	}
	const select = (person: { id: string; name: string }) => {
		if (!mention || readOnly) return
		const inserted = `@${person.name} `
		onChange(value.slice(0, mention.start) + inserted + value.slice(mention.end))
		const caret = mention.start + inserted.length
		setMention(null)
		requestAnimationFrame(() => {
			field.current?.focus()
			field.current?.setSelectionRange(caret, caret)
		})
	}
	return (
		<div className="relative flex flex-col gap-2">
			<label htmlFor={fieldId} className="sr-only">
				{label}
			</label>
			<textarea
				ref={field}
				id={fieldId}
				value={value}
				placeholder={placeholder}
				readOnly={readOnly}
				autoFocus={autoFocus}
				rows={rows}
				onInput={(event) => {
					onChange(event.currentTarget.value)
					updateMention(event.currentTarget.value, event.currentTarget.selectionStart)
				}}
				onSelect={(event) => {
					if (!readOnly) updateMention(event.currentTarget.value, event.currentTarget.selectionStart)
				}}
				onBlur={() => setMention(null)}
				onKeyDown={(event) => {
					if (!open) return
					if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
						event.preventDefault()
						setActive((index) => (index + (event.key === 'ArrowDown' ? 1 : -1) + matches.length) % matches.length)
					} else if (event.key === 'Enter' && !event.shiftKey) {
						event.preventDefault()
						const person = matches[activeIndex]
						if (person) select(person)
					} else if (event.key === 'Escape') {
						event.preventDefault()
						event.stopPropagation()
						setMention(null)
					}
				}}
				aria-autocomplete="list"
				aria-controls={open ? listId : undefined}
				aria-activedescendant={open ? `${listId}-${activeIndex}` : undefined}
				className="min-h-[5.5rem] resize-y rounded-sm border border-border bg-surface p-3 text-small text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring read-only:text-fg-muted"
			/>
			{open ? (
				<ul
					id={listId}
					role="listbox"
					aria-label={label}
					className="m-0 flex max-h-40 list-none flex-col overflow-y-auto rounded-md border border-border bg-surface-card p-1 shadow-lg"
				>
					{matches.map((person, index) => (
						<li
							key={person.id}
							id={`${listId}-${index}`}
							role="option"
							aria-selected={index === activeIndex}
							onPointerDown={(event) => event.preventDefault()}
							onMouseDown={(event) => event.preventDefault()}
							onClick={() => select(person)}
							className={`cursor-pointer rounded-md px-3 py-2 text-small text-fg hover:bg-surface-muted ${index === activeIndex ? 'bg-surface-muted' : ''}`}
						>
							@{person.name}
						</li>
					))}
				</ul>
			) : null}
		</div>
	)
}
