// @app/ui — send-to-print modal (issue 14).
//
// PRESENTATIONAL print-order dialog built on the @app/ui <Dialog> (React Aria
// Modal — focus trap, Esc, aria-modal). Collects the print spec (size,
// material, quantity, delivery address) and, on confirm, the owning surface in
// apps/web creates a `print` delivery job.
//
// VALIDATION mirrors the smart-document `print_specs` + `delivery_output`
// block rules (docs/GOVERNANCE/tasks-delivery.md / the issue-06 validator):
//   * size      — non-blank (trimmed),
//   * material  — non-blank (trimmed),
//   * quantity  — a finite integer strictly > 0,
//   * address   — non-blank (trimmed, the delivery_output address field).
// Confirm stays DISABLED until every field is valid; per-field errors are shown
// inline (the quantity input carries aria-invalid + a role="alert" message).
//
// APP-AGNOSTIC (hard rule #1): every string is a prop; the action is delegated
// via `onConfirm(spec)`; apps/web wires i18n + the REST mutation + invalidation.
//
// a11y: every field is label-associated (Input / RAC TextField); the quantity
// field is aria-invalid when invalid; the server error is role="alert"; confirm
// shows a pending state and disables while in flight / invalid.

import { useMemo, useState } from 'react'
import { Button } from '../button'
import { Dialog } from '../dialog'
import { Input } from '../input'

/** The validated print spec the modal yields on confirm. */
export interface PrintSpec {
	/** Print size (e.g. "A2", "1000×700mm") — non-blank. */
	size: string
	/** Material / stock (e.g. "Matte 250g") — non-blank. */
	material: string
	/** Quantity — a finite integer > 0. */
	quantity: number
	/** Delivery address — non-blank. */
	address: string
}

/** Strings the send-to-print modal renders — supplied by the app (i18n). */
export interface SendToPrintModalLabels {
	/** Dialog heading. */
	title: string
	/** Explanatory body copy under the title. */
	body: string
	/** Size field label + placeholder. */
	sizeLabel: string
	sizePlaceholder: string
	/** Material field label + placeholder. */
	materialLabel: string
	materialPlaceholder: string
	/** Quantity field label + placeholder. */
	quantityLabel: string
	quantityPlaceholder: string
	/** Inline error shown when the quantity is not a finite integer > 0. */
	quantityError: string
	/** Address field label + placeholder. */
	addressLabel: string
	addressPlaceholder: string
	/** Cancel button. */
	cancel: string
	/** Confirm (create print job) button — idle state. */
	confirm: string
	/** Confirm button — pending state. */
	submitting: string
}

export interface SendToPrintModalProps {
	/** Controlled open state. */
	isOpen: boolean
	/** Notified on open/close (false on Esc / click-outside / cancel). */
	onOpenChange: (isOpen: boolean) => void
	/** Create the `print` delivery job with the validated spec. */
	onConfirm: (spec: PrintSpec) => void
	/** Whether the confirm mutation is in flight (disables + shows pending). */
	isPending?: boolean
	/** Server / mutation error message to surface inline (role="alert"). */
	error?: string
	/** App-supplied i18n strings. */
	labels: SendToPrintModalLabels
	/** Optional test id forwarded to the dialog. */
	'data-testid'?: string
}

/** Parse a raw quantity string into a finite integer > 0, or null when invalid. */
function parseQuantity(raw: string): number | null {
	const trimmed = raw.trim()
	if (trimmed.length === 0) return null
	const value = Number(trimmed)
	if (!Number.isFinite(value) || !Number.isInteger(value) || value <= 0) return null
	return value
}

/** Send-to-print modal with validated size / material / quantity / address. */
export function SendToPrintModal({
	isOpen,
	onOpenChange,
	onConfirm,
	isPending = false,
	error,
	labels,
	'data-testid': testId,
}: SendToPrintModalProps): React.ReactNode {
	const [size, setSize] = useState('')
	const [material, setMaterial] = useState('')
	const [quantityRaw, setQuantityRaw] = useState('')
	const [address, setAddress] = useState('')

	const quantity = useMemo(() => parseQuantity(quantityRaw), [quantityRaw])
	// Surface the quantity error only once the user has typed something invalid
	// (not on the initial blank state — that would scream before any input).
	const quantityInvalid = quantityRaw.trim().length > 0 && quantity === null

	const reset = (): void => {
		setSize('')
		setMaterial('')
		setQuantityRaw('')
		setAddress('')
	}

	const canConfirm =
		!isPending &&
		size.trim().length > 0 &&
		material.trim().length > 0 &&
		quantity !== null &&
		address.trim().length > 0

	const handleOpenChange = (open: boolean): void => {
		if (!open) reset()
		onOpenChange(open)
	}

	const handleConfirm = (): void => {
		if (!canConfirm || quantity === null) return
		onConfirm({
			size: size.trim(),
			material: material.trim(),
			quantity,
			address: address.trim(),
		})
	}

	return (
		<Dialog
			title={labels.title}
			data-testid={testId ?? 'delivery-print-modal'}
			isOpen={isOpen}
			onOpenChange={handleOpenChange}
		>
			<div className="flex flex-col gap-3">
				<p className="text-small text-fg-muted">{labels.body}</p>

				<Input
					label={labels.sizeLabel}
					placeholder={labels.sizePlaceholder}
					value={size}
					onChange={setSize}
					data-testid="delivery-print-size"
				/>
				<Input
					label={labels.materialLabel}
					placeholder={labels.materialPlaceholder}
					value={material}
					onChange={setMaterial}
					data-testid="delivery-print-material"
				/>
				<Input
					label={labels.quantityLabel}
					placeholder={labels.quantityPlaceholder}
					value={quantityRaw}
					onChange={setQuantityRaw}
					type="number"
					inputMode="numeric"
					isInvalid={quantityInvalid}
					errorMessage={quantityInvalid ? labels.quantityError : undefined}
					data-testid="delivery-print-quantity"
				/>
				<Input
					label={labels.addressLabel}
					placeholder={labels.addressPlaceholder}
					value={address}
					onChange={setAddress}
					data-testid="delivery-print-address"
				/>

				{error ? (
					<p data-testid="delivery-print-error" role="alert" className="text-small text-danger">
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
						data-testid="delivery-print-confirm"
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
