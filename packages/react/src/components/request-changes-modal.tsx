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
// the server error is role="alert"; confirm shows a pending state and is disabled
// while in flight or while the note is empty. The note is marked `isRequired`
// (→ aria-required), NOT aria-invalid-while-empty as the raw textarea used to be:
// an untouched required field is incomplete, not invalid, and RAC coupling
// `isInvalid` to the danger ring would alarm the field before anyone typed.

import { useLayoutEffect, useRef, useState } from 'react'
import { Button } from './button'
import { Dialog } from './dialog'
import { Textarea } from './textarea'

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
	// CONTROLLED textarea: the confirm button's disabled state depends on whether
	// the note is non-empty, so the value drives dependent UI (unlike approve).
	const [note, setNote] = useState('')
	const noteRootRef = useRef<HTMLDivElement>(null)
	const isEmpty = note.trim().length === 0
	const canConfirm = !isEmpty && !isPending

	useLayoutEffect(() => {
		if (!isOpen || isPending) return
		noteRootRef.current?.querySelector('textarea')?.focus()
		const frame = requestAnimationFrame(() => {
			noteRootRef.current?.querySelector('textarea')?.focus()
		})
		return () => cancelAnimationFrame(frame)
	}, [isOpen, isPending])

	const handleConfirm = (): void => {
		if (isPending) return
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
				if (isPending) return
				if (!open) setNote('')
				onOpenChange(open)
			}}
			isDismissable={!isPending}
			closeLabel={labels.cancel}
		>
			<div className="flex flex-col gap-3">
				<p className="text-small text-fg-muted">{labels.body}</p>
				<div ref={noteRootRef}>
					<Textarea
						autoFocus
						appearance="filled"
						label={labels.noteLabel}
						data-testid="request-changes-note"
						value={note}
						isDisabled={isPending}
						onChange={setNote}
						maxLength={10_000}
						rows={4}
						isRequired
						placeholder={labels.notePlaceholder}
					/>
				</div>
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
