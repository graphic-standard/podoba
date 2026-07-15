// @app/ui — delivery download modal (issue 14).
//
// PRESENTATIONAL download-confirmation dialog built on the @app/ui <Dialog>
// (React Aria Modal — focus trap, Esc, aria-modal). The user picks a format
// (PNG / PDF), confirms, and a `download` delivery job is created. While the
// job's artifact is generating the modal shows a progress note; once the
// artifact is ready the modal surfaces a download link to the artifact URL.
//
// APP-AGNOSTIC (hard rule #1: @app/ui never imports apps/web or calls API
// hooks). Every string comes through `labels`; the action is delegated via
// `onConfirm(format)`; the job status / artifact URL are passed in by the
// owning surface in apps/web, which wires the i18n strings + the REST mutation
// (`useDeliveryJobMutations().create`) + invalidation.
//
// a11y: the format radiogroup is label-associated; the progress note is
// role="status"; the server error is role="alert"; confirm shows a pending
// state and disables while in flight.

import { useState } from 'react'
import {
	Label,
	Radio,
	RadioGroup,
	type Key,
} from 'react-aria-components'
import { Button } from '../button'
import { Dialog } from '../dialog'

/** The two download formats a `download` job can produce. */
export const DOWNLOAD_FORMATS = ['png', 'pdf'] as const
export type DownloadFormat = (typeof DOWNLOAD_FORMATS)[number]

/** Strings the download modal renders — supplied by the app (i18n), not hardcoded. */
export interface DownloadModalLabels {
	/** Dialog heading. */
	title: string
	/** Explanatory body copy under the title. */
	body: string
	/** Label for the format radiogroup. */
	formatLabel: string
	/** Label for the PNG option. */
	formatPng: string
	/** Label for the PDF option. */
	formatPdf: string
	/** Cancel button. */
	cancel: string
	/** Confirm (create download job) button — idle state. */
	confirm: string
	/** Confirm button — pending state. */
	submitting: string
	/** Progress note while the artifact is generating. */
	preparing: string
	/** Download-ready action label (links to the artifact). */
	download: string
	/** Note shown once the artifact is ready. */
	ready: string
}

export interface DownloadModalProps {
	/** Controlled open state. */
	isOpen: boolean
	/** Notified on open/close (false on Esc / click-outside / cancel). */
	onOpenChange: (isOpen: boolean) => void
	/** Create the `download` delivery job for the chosen format. */
	onConfirm: (format: DownloadFormat) => void
	/** Whether the confirm mutation is in flight (disables + shows pending). */
	isPending?: boolean
	/** Server / mutation error message to surface inline (role="alert"). */
	error?: string
	/**
	 * Once the job is created and its artifact is ready, the URL to download.
	 * While null/undefined the modal shows the create form (or the preparing
	 * note when `isPreparing`).
	 */
	artifactUrl?: string | null
	/** Whether a created job's artifact is still generating (shows the progress note). */
	isPreparing?: boolean
	/** App-supplied i18n strings. */
	labels: DownloadModalLabels
	/** Optional test id forwarded to the dialog. */
	'data-testid'?: string
}

/** Download modal with a PNG/PDF format choice and a ready-artifact download link. */
export function DownloadModal({
	isOpen,
	onOpenChange,
	onConfirm,
	isPending = false,
	error,
	artifactUrl,
	isPreparing = false,
	labels,
	'data-testid': testId,
}: DownloadModalProps): React.ReactNode {
	const [format, setFormat] = useState<DownloadFormat>('png')

	const handleConfirm = (): void => {
		onConfirm(format)
	}

	const hasArtifact = artifactUrl != null && artifactUrl.length > 0

	return (
		<Dialog
			title={labels.title}
			data-testid={testId ?? 'delivery-download-modal'}
			isOpen={isOpen}
			onOpenChange={onOpenChange}
		>
			<div className="flex flex-col gap-3">
				<p className="text-small text-fg-muted">{labels.body}</p>

				{hasArtifact ? (
					<>
						<p data-testid="delivery-download-ready" role="status" className="text-small text-fg">
							{labels.ready}
						</p>
						<div className="mt-2 flex justify-end gap-2">
							<Button variant="secondary" size="sm" onPress={() => onOpenChange(false)}>
								{labels.cancel}
							</Button>
							{/* React Aria <Button> is a real <button>; a download is a navigation,
							    so we use a styled anchor (the only anchor in these modals). */}
							<a
								data-testid="delivery-download-link"
								href={artifactUrl ?? undefined}
								download
								className="inline-flex h-8 items-center justify-center gap-2 rounded-md bg-brand-primary px-3 text-small font-medium text-fg-inverted no-underline outline-none transition-colors hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							>
								{labels.download}
							</a>
						</div>
					</>
				) : isPreparing ? (
					<>
						<p data-testid="delivery-download-preparing" role="status" className="text-small text-fg-muted">
							{labels.preparing}
						</p>
						<div className="mt-2 flex justify-end gap-2">
							<Button variant="secondary" size="sm" onPress={() => onOpenChange(false)}>
								{labels.cancel}
							</Button>
						</div>
					</>
				) : (
					<>
						<RadioGroup
							aria-label={labels.formatLabel}
							value={format}
							onChange={(value: string) => setFormat(value as DownloadFormat)}
							className="flex flex-col gap-2"
						>
							<Label className="text-small font-medium text-fg">{labels.formatLabel}</Label>
							<div className="flex gap-2">
								<DownloadFormatOption value="png" label={labels.formatPng} />
								<DownloadFormatOption value="pdf" label={labels.formatPdf} />
							</div>
						</RadioGroup>

						{error ? (
							<p data-testid="delivery-download-error" role="alert" className="text-small text-danger">
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
								data-testid="delivery-download-confirm"
								variant="primary"
								size="sm"
								isDisabled={isPending}
								isPending={isPending}
								onPress={handleConfirm}
							>
								{isPending ? labels.submitting : labels.confirm}
							</Button>
						</div>
					</>
				)}
			</div>
		</Dialog>
	)
}

/** One radio chip in the download-format group. */
function DownloadFormatOption({ value, label }: { value: Key; label: string }): React.ReactNode {
	return (
		<Radio
			value={String(value)}
			className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-small text-fg outline-none transition-colors data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[selected]:border-brand-primary data-[selected]:font-medium"
		>
			{label}
		</Radio>
	)
}
