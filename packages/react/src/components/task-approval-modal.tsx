// @app/ui — task approval modal (issue 13).
//
// PRESENTATIONAL approve-confirmation dialog built on the @app/ui <Dialog>
// (React Aria Modal — focus trap, Esc, aria-modal). The note is OPTIONAL on
// approve; confirm is always enabled (a press with an empty note is valid).
//
// This component is APP-AGNOSTIC (hard rule #1: @app/ui never imports apps/web
// or calls API hooks). Every string is supplied via the `labels` prop and the
// confirm action is delegated through `onConfirm(note?)` — the owning surface
// in apps/web wires the i18n strings + the REST mutation + invalidation.
//
// a11y: the textarea is label-associated via htmlFor/id; the server error is
// role="alert"; confirm shows a pending state and disables while in flight.

import { useId, useRef } from 'react'
import { Button } from './button'
import { Dialog } from './dialog'

/** Strings the approval modal renders — supplied by the app (i18n), not hardcoded. */
export interface TaskApprovalModalLabels {
	/** Dialog heading. */
	title: string
	/** Explanatory body copy under the title. */
	body: string
	/** Label for the optional note textarea. */
	noteLabel: string
	/** Placeholder for the note textarea. */
	notePlaceholder: string
	/** Cancel button. */
	cancel: string
	/** Confirm (approve) button — idle state. */
	confirm: string
	/** Confirm button — pending state. */
	submitting: string
}

export interface TaskApprovalModalProps {
	/** Controlled open state. */
	isOpen: boolean
	/** Notified on open/close (false on Esc / click-outside / cancel). */
	onOpenChange: (isOpen: boolean) => void
	/** Run the approve command with the (trimmed, optional) note. */
	onConfirm: (note?: string) => void
	/** Whether the confirm mutation is in flight (disables + shows pending). */
	isPending?: boolean
	/** Server / mutation error message to surface inline (role="alert"). */
	error?: string
	/** App-supplied i18n strings. */
	labels: TaskApprovalModalLabels
	/** Optional test id forwarded to the dialog. */
	'data-testid'?: string
}

/** Approve-confirmation modal with an optional note. */
export function TaskApprovalModal({
	isOpen,
	onOpenChange,
	onConfirm,
	isPending = false,
	error,
	labels,
	'data-testid': testId,
}: TaskApprovalModalProps): React.ReactNode {
	const noteId = useId()
	// UNCONTROLLED textarea (read at submit via ref): the note has no dependent UI
	// on approve, so controlled state would only add a re-render per keystroke.
	const noteRef = useRef<HTMLTextAreaElement | null>(null)

	const handleConfirm = (): void => {
		const trimmed = (noteRef.current?.value ?? '').trim()
		onConfirm(trimmed.length > 0 ? trimmed : undefined)
	}

	return (
		<Dialog
			title={labels.title}
			data-testid={testId ?? 'task-approval-modal'}
			isOpen={isOpen}
			onOpenChange={onOpenChange}
		>
			<div className="flex flex-col gap-3">
				<p className="text-sm text-fg-muted">{labels.body}</p>
				<label htmlFor={noteId} className="text-sm font-medium text-fg">
					{labels.noteLabel}
				</label>
				<textarea
					id={noteId}
					data-testid="task-approval-note"
					ref={noteRef}
					maxLength={10_000}
					rows={3}
					placeholder={labels.notePlaceholder}
					className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg outline-none transition-colors placeholder:text-fg-muted focus-visible:ring-2 focus-visible:ring-ring"
				/>
				{error ? (
					<p data-testid="task-approval-error" role="alert" className="text-sm text-danger">
						{error}
					</p>
				) : null}
				<div className="mt-2 flex justify-end gap-2">
					<Button
						variant="secondary"
						size="sm"
						isDisabled={isPending}
						onPress={() => onOpenChange(false)}
					>
						{labels.cancel}
					</Button>
					<Button
						data-testid="task-approval-confirm"
						variant="primary"
						size="sm"
						isDisabled={isPending}
						isPending={isPending}
						onPress={handleConfirm}
					>
						{isPending ? labels.submitting : labels.confirm}
					</Button>
				</div>
			</div>
		</Dialog>
	)
}
