// @app/ui — request-changes modal (issue 13).
//
// PRESENTATIONAL "request changes" dialog built on the @app/ui <Dialog>
// (React Aria Modal — focus trap, Esc, aria-modal). The note is REQUIRED:
// confirm stays DISABLED until the textarea holds a non-empty (trimmed) value,
// mirroring the server contract (`request_changes` 422s on an empty note).
//
// APP-AGNOSTIC (hard rule #1): every string is a prop and the action is
// delegated via `onConfirm(note)`. The owning surface in apps/web wires the
// i18n strings + the REST mutation + invalidation, and surfaces the auto-created
// follow-up `changes` task returned by the command.
//
// a11y: the textarea is label-associated (htmlFor/id), marked `required` +
// `aria-invalid` while empty; the server error is role="alert"; confirm shows a
// pending state and is disabled while in flight or while the note is empty.

import { useId, useState } from 'react'
import { Button } from './button'
import { Dialog } from './dialog'

/** Strings the request-changes modal renders — supplied by the app (i18n). */
export interface RequestChangesModalLabels {
	/** Dialog heading. */
	title: string
	/** Explanatory body copy under the title. */
	body: string
	/** Label for the required note textarea. */
	noteLabel: string
	/** Placeholder for the note textarea. */
	notePlaceholder: string
	/** Cancel button. */
	cancel: string
	/** Confirm (request changes) button — idle state. */
	confirm: string
	/** Confirm button — pending state. */
	submitting: string
}

export interface RequestChangesModalProps {
	/** Controlled open state. */
	isOpen: boolean
	/** Notified on open/close (false on Esc / click-outside / cancel). */
	onOpenChange: (isOpen: boolean) => void
	/** Run the request_changes command with the (required, trimmed) note. */
	onConfirm: (note: string) => void
	/** Whether the confirm mutation is in flight (disables + shows pending). */
	isPending?: boolean
	/** Server / mutation error message to surface inline (role="alert"). */
	error?: string
	/** App-supplied i18n strings. */
	labels: RequestChangesModalLabels
	/** Optional test id forwarded to the dialog. */
	'data-testid'?: string
}

/** Request-changes modal with a REQUIRED note (confirm disabled until non-empty). */
export function RequestChangesModal({
	isOpen,
	onOpenChange,
	onConfirm,
	isPending = false,
	error,
	labels,
	'data-testid': testId,
}: RequestChangesModalProps): React.ReactNode {
	const noteId = useId()
	// CONTROLLED textarea: the confirm button's disabled state depends on whether
	// the note is non-empty, so the value drives dependent UI (unlike approve).
	const [note, setNote] = useState('')
	const isEmpty = note.trim().length === 0
	const canConfirm = !isEmpty && !isPending

	const handleConfirm = (): void => {
		const trimmed = note.trim()
		if (trimmed.length === 0) return
		onConfirm(trimmed)
	}

	return (
		<Dialog
			title={labels.title}
			data-testid={testId ?? 'request-changes-modal'}
			isOpen={isOpen}
			onOpenChange={(open) => {
				if (!open) setNote('')
				onOpenChange(open)
			}}
		>
			<div className="flex flex-col gap-3">
				<p className="text-small text-fg-muted">{labels.body}</p>
				<label htmlFor={noteId} className="text-small font-medium text-fg">
					{labels.noteLabel}
				</label>
				<textarea
					id={noteId}
					data-testid="request-changes-note"
					value={note}
					onChange={(event) => setNote(event.target.value)}
					maxLength={10_000}
					rows={4}
					required
					aria-invalid={isEmpty ? true : undefined}
					placeholder={labels.notePlaceholder}
					className="w-full rounded-md border border-border bg-surface px-3 py-2 text-small text-fg outline-none transition-colors placeholder:text-fg-muted focus-visible:ring-2 focus-visible:ring-ring"
				/>
				{error ? (
					<p data-testid="request-changes-error" role="alert" className="text-small text-danger">
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
						data-testid="request-changes-confirm"
						variant="primary"
						size="sm"
						isDisabled={!canConfirm}
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
