// @app/ui — publish modal (issue 14).
//
// PRESENTATIONAL publish dialog built on the @app/ui <Dialog> (React Aria Modal
// — focus trap, Esc, aria-modal). Collects a destination + channel and, on
// confirm, the owning surface in apps/web creates a `publish` delivery job.
//
// VALIDATION: destination + channel are both required (non-blank, trimmed) —
// confirm stays DISABLED until both hold a value. The channel is a constrained
// choice (the app supplies the option list as `labels.channels`).
//
// APP-AGNOSTIC (hard rule #1): every string is a prop; the action is delegated
// via `onConfirm(payload)`; apps/web wires i18n + the REST mutation (`publish`
// kind) + invalidation.
//
// a11y: the destination input is label-associated; the channel select is a RAC
// Select (listbox ARIA); the server error is role="alert"; confirm shows a
// pending state and disables while in flight / invalid.

import { useState } from 'react'
import { Button } from '../button'
import { Dialog } from '../dialog'
import { Input } from '../input'
import { Select, SelectItem } from '../select'

/** One publish channel option (value + visible label), supplied by the app. */
export interface PublishChannelOption {
	/** Stable channel id stored on the job (e.g. "instagram", "linkedin"). */
	value: string
	/** Translated, human-readable channel name. */
	label: string
}

/** The publish payload the modal yields on confirm. */
export interface PublishPayload {
	/** Destination label (e.g. an account / page name) — non-blank. */
	destination: string
	/** Selected channel value. */
	channel: string
}

/** Strings the publish modal renders — supplied by the app (i18n). */
export interface PublishModalLabels {
	/** Dialog heading. */
	title: string
	/** Explanatory body copy under the title. */
	body: string
	/** Destination field label + placeholder. */
	destinationLabel: string
	destinationPlaceholder: string
	/** Channel select label + placeholder. */
	channelLabel: string
	channelPlaceholder: string
	/** Cancel button. */
	cancel: string
	/** Confirm (create publish job) button — idle state. */
	confirm: string
	/** Confirm button — pending state. */
	submitting: string
	/** The channel options to choose from. */
	channels: PublishChannelOption[]
}

export interface PublishModalProps {
	/** Controlled open state. */
	isOpen: boolean
	/** Notified on open/close (false on Esc / click-outside / cancel). */
	onOpenChange: (isOpen: boolean) => void
	/** Create the `publish` delivery job with the chosen destination + channel. */
	onConfirm: (payload: PublishPayload) => void
	/** Whether the confirm mutation is in flight (disables + shows pending). */
	isPending?: boolean
	/** Server / mutation error message to surface inline (role="alert"). */
	error?: string
	/** App-supplied i18n strings. */
	labels: PublishModalLabels
	/** Optional test id forwarded to the dialog. */
	'data-testid'?: string
}

/** Publish modal with a destination input + a channel choice. */
export function PublishModal({
	isOpen,
	onOpenChange,
	onConfirm,
	isPending = false,
	error,
	labels,
	'data-testid': testId,
}: PublishModalProps): React.ReactNode {
	const [destination, setDestination] = useState('')
	const [channel, setChannel] = useState<string>('')

	const reset = (): void => {
		setDestination('')
		setChannel('')
	}

	const canConfirm = !isPending && destination.trim().length > 0 && channel.trim().length > 0

	const handleOpenChange = (open: boolean): void => {
		if (!open) reset()
		onOpenChange(open)
	}

	const handleConfirm = (): void => {
		if (!canConfirm) return
		onConfirm({ destination: destination.trim(), channel })
	}

	return (
		<Dialog
			title={labels.title}
			data-testid={testId ?? 'delivery-publish-modal'}
			isOpen={isOpen}
			onOpenChange={handleOpenChange}
		>
			<div className="flex flex-col gap-3">
				<p className="text-small text-fg-muted">{labels.body}</p>

				<Input
					label={labels.destinationLabel}
					placeholder={labels.destinationPlaceholder}
					value={destination}
					onChange={setDestination}
					data-testid="delivery-publish-destination"
				/>
				<Select
					label={labels.channelLabel}
					placeholder={labels.channelPlaceholder}
					selectedKey={channel.length > 0 ? channel : null}
					onSelectionChange={(key) => setChannel(String(key))}
					data-testid="delivery-publish-channel"
				>
					{labels.channels.map((option) => (
						<SelectItem key={option.value} id={option.value}>
							{option.label}
						</SelectItem>
					))}
				</Select>

				{error ? (
					<p data-testid="delivery-publish-error" role="alert" className="text-small text-danger">
						{error}
					</p>
				) : null}

				<div className="mt-2 flex justify-end gap-2">
					<Button
						variant="secondary"
						size="sm"
						isDisabled={isPending}
						onPress={() => handleOpenChange(false)}
					>
						{labels.cancel}
					</Button>
					<Button
						data-testid="delivery-publish-confirm"
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
