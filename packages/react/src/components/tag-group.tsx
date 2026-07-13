import type { ReactNode } from 'react'
import {
	Button as RACButton,
	Label,
	Tag as RACTag,
	type TagProps as RACTagProps,
	TagGroup as RACTagGroup,
	type TagGroupProps as RACTagGroupProps,
	TagList,
	Text,
} from 'react-aria-components'

/**
 * TagGroup + Tag — a set of chips (labels, filters, or a removable tag input).
 * Built on React Aria Components `TagGroup` (roving focus, optional selection,
 * removal via `onRemove` + a per-tag ✕). Pass `Tag`s as `TagList` children.
 */
export type TagGroupProps = Omit<RACTagGroupProps, 'children'> & {
	label?: ReactNode
	description?: ReactNode
	children: ReactNode
}

export const TagGroup = ({ label, description, children, ...props }: TagGroupProps) => (
	<RACTagGroup {...props} className="flex flex-col gap-2">
		{label ? <Label className="text-heading5 font-medium text-fg">{label}</Label> : null}
		<TagList className="flex flex-wrap gap-2 outline-none">{children}</TagList>
		{description ? (
			<Text slot="description" className="text-xs text-fg-muted">
				{description}
			</Text>
		) : null}
	</RACTagGroup>
)

export const Tag = ({ children, textValue, ...props }: RACTagProps) => (
	<RACTag
		{...props}
		// We wrap children in a render fn (for the remove button), so RAC can't infer
		// the tag's text — derive it from a string child for accessibility.
		textValue={textValue ?? (typeof children === 'string' ? children : undefined)}
		className={
			'inline-flex cursor-default select-none items-center gap-1.5 rounded-full border border-border bg-surface-card px-3 py-1 text-sm text-fg outline-none transition-colors ' +
			'data-[hovered]:border-fg-subtle ' +
			'data-[selected]:border-fg data-[selected]:bg-surface-muted ' +
			'data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring ' +
			'data-[disabled]:opacity-50'
		}
	>
		{({ allowsRemoving }) => (
			<>
				{children as ReactNode}
				{allowsRemoving ? (
					<RACButton
						slot="remove"
						className="-mr-1 flex h-4 w-4 items-center justify-center rounded-full text-fg-subtle outline-none transition-colors hover:bg-surface-muted hover:text-fg data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring"
					>
						<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
							<path d="M6 6l12 12M18 6 6 18" />
						</svg>
					</RACButton>
				) : null}
			</>
		)}
	</RACTag>
)
