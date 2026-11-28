import type { ComponentProps, ReactNode } from 'react'
import { uic } from '../utils/uic'

const CollectionEmptyMessageRoot = uic('div', {
	displayName: 'CollectionEmptyMessage',
	baseClass: 'flex items-center justify-center text-center',
	variants: {
		compact: {
			true: 'min-h-24 px-4 pt-6 pb-3',
			false: 'min-h-48 px-6 pt-12 pb-6',
		},
	},
	defaultVariants: { compact: false },
	variantsAsDataAttrs: ['compact'],
})

const CollectionEmptyMessageText = uic('p', {
	displayName: 'CollectionEmptyMessageText',
	baseClass: 'm-0 max-w-[36ch] font-medium text-fg-muted',
	variants: {
		compact: {
			true: 'text-body',
			false: 'text-heading4',
		},
	},
	defaultVariants: { compact: false },
})

export type CollectionEmptyMessageProps = Omit<ComponentProps<'div'>, 'children'> & {
	/** What is missing, in the muted ink: "No projects yet." Inline content only (text,
	 * a link, emphasis): it renders inside a `<p>`, so a block element would end the
	 * paragraph early in server-rendered HTML. */
	message: ReactNode
	/** What to do about it, in the full ink after the message: "Create your first
	 * project." Inline content only, like `message`. */
	nextStep?: ReactNode
	/** Smaller type and padding, for a dialog or a panel inside a page. */
	compact?: boolean
	/**
	 * Make the message a polite live region (`role="status"`, the default). Turn it off
	 * where an announcement does not belong: a page that is empty when it loads, an
	 * empty row inside another live region, several empty collections on one page.
	 * An explicit `role` wins over this.
	 *
	 * Screen readers announce a live region reliably only when it exists before its
	 * content changes. When this component mounts at the moment a filter empties the
	 * collection, many will not read it out. If that announcement matters, keep a
	 * live region in the surface that stays mounted with and without results, render
	 * this inside it, and pass `announce={false}`.
	 */
	announce?: boolean
}

/**
 * Centered, label-driven feedback for an empty collection: a page of cards or rows,
 * or a list in a dialog (`compact`). One sentence of what is missing and, optionally,
 * one of what to do next.
 *
 * Which empty state to use:
 * - `CollectionEmptyMessage`: a whole collection (page, section, dialog list) has
 *   nothing to show, or a filter left nothing.
 * - `AssetSelectionEmpty`: inside an `AssetSelectionSurface`, where it matches that
 *   surface's title and description layout.
 * - `Table`'s `emptyMessage`: the single row in place of a table body.
 * - `PersistentPageShell`'s `emptySlot`: the shell's own empty page, which can hold
 *   a `CollectionEmptyMessage`.
 */
export function CollectionEmptyMessage({ message, nextStep, compact = false, announce = true, ...props }: CollectionEmptyMessageProps) {
	return (
		<CollectionEmptyMessageRoot role={announce ? 'status' : undefined} {...props} compact={compact}>
			<CollectionEmptyMessageText compact={compact}>
				{message}
				{nextStep ? (
					<>
						{' '}
						<span className="text-fg">{nextStep}</span>
					</>
				) : null}
			</CollectionEmptyMessageText>
		</CollectionEmptyMessageRoot>
	)
}
