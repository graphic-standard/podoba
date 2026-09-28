import type { ReactNode } from 'react'
import {
	Button as RACButton,
	Input as RACInput,
	Label,
	SearchField as RACSearchField,
	type SearchFieldProps as RACSearchFieldProps,
	Text,
} from 'react-aria-components'
import {
	fieldDescriptionClass,
	fieldLabelClass,
	fieldSizeClasses,
	fieldStackClass,
	outlinedFieldClasses,
	type FieldSize,
} from './field-appearance'

/**
 * SearchField — a text input for search, with a clear (✕) button that appears
 * once there's a value and a leading search glyph. Built on React Aria
 * Components `SearchField` (Esc clears, `type=search` semantics). Styled to
 * match the other form fields.
 */
const SearchGlyph = () => (
	<svg
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		aria-hidden="true"
		className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-subtle"
	>
		<circle cx="11" cy="11" r="7" />
		<path d="M21 21l-4.3-4.3" strokeLinecap="round" />
	</svg>
)

export type SearchFieldProps = RACSearchFieldProps & {
	label?: ReactNode
	description?: ReactNode
	placeholder?: string
	/** Field height, matching `Input`'s `size`. */
	size?: FieldSize
}

export const SearchField = ({ label, description, placeholder, size = 'md', ...props }: SearchFieldProps) => (
	<RACSearchField {...props} className={`group ${fieldStackClass}`}>
		{label ? <Label className={fieldLabelClass}>{label}</Label> : null}
		<div className="relative flex items-center">
			<SearchGlyph />
			<RACInput
				placeholder={placeholder}
				className={
					`w-full rounded-lg pl-10 pr-10 ${fieldSizeClasses[size]} ${outlinedFieldClasses()} ` +
					'[&::-webkit-search-cancel-button]:hidden'
				}
			/>
			{/* RAC hides this automatically when the field is empty. */}
			<RACButton className="absolute right-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-fg-subtle outline-none transition-colors hover:bg-surface-muted hover:text-fg group-data-[empty]:hidden data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
					<path d="M6 6l12 12M18 6 6 18" />
				</svg>
			</RACButton>
		</div>
		{description ? (
			<Text slot="description" className={fieldDescriptionClass}>
				{description}
			</Text>
		) : null}
	</RACSearchField>
)
