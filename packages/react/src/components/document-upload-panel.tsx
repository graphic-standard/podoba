import type { DragEventHandler, ReactNode } from 'react'
import { uic } from '../utils/uic'
import { DialogActionButton } from './dialog-action-button'
import { Tile } from './tile'

const Surface = uic('div', {
	displayName: 'DocumentUploadSurface',
	baseClass: 'relative h-95 w-full',
})

/** Source upload tile: label at top, action centred in the WHOLE tile, helper at bottom.
 * File ownership, validation and persistence belong to the caller. The real button
 * provides the keyboard alternative to native file drag/drop.
 */
export function DocumentUploadPanel({
	title, actionLabel, helperText, isDragging = false, isDisabled = false,
	onAction, onDrop, onDragEnter, onDragOver, onDragLeave,
	...rest
}: {
	title: ReactNode
	actionLabel: string
	helperText?: string
	isDragging?: boolean
	isDisabled?: boolean
	onAction?: () => void
	onDrop?: DragEventHandler<HTMLDivElement>
	onDragEnter?: DragEventHandler<HTMLDivElement>
	onDragOver?: DragEventHandler<HTMLDivElement>
	onDragLeave?: DragEventHandler<HTMLDivElement>
	'data-testid'?: string
}) {
	return <Surface {...rest} onDrop={onDrop} onDragEnter={onDragEnter} onDragOver={onDragOver} onDragLeave={onDragLeave}>
		<Tile theme="light" className={isDragging && !isDisabled ? 'ring-2 ring-inset ring-fg-subtle' : undefined}
			eyebrow={<span className="relative z-10 mb-2 text-body font-medium leading-5">{title}</span>}
			footer={helperText ? <p className="relative z-10 m-0 whitespace-pre-line text-small font-normal text-fg-workflow-muted" style={{ lineHeight: 'normal' }}>
				{/* Original Tile's `.tile .tail *` wins over the upload helper classes:
				    BOTH lines inherit the regular muted supporting text. */}
				{helperText}
			</p> : undefined}
		/>
		<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
			<DialogActionButton type="button" isDisabled={isDisabled} onPress={onAction}
				className="pointer-events-auto h-14 w-48 min-w-48 py-0">
				{actionLabel}
			</DialogActionButton>
		</div>
	</Surface>
}
