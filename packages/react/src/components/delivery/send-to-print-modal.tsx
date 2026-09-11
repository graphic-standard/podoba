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

import { useId, useMemo, useState } from 'react'
import { Button } from '../button'
import { ModalDialog, ModalOverlay, ModalSurface } from '../dialog'
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
	/** Company / recipient. */
	company?: string
	/** Street address. */
	street?: string
	/** City. */
	city?: string
	/** ZIP / postcode. */
	zip?: string
	/** Contact person. */
	contactName?: string
	/** Contact phone. */
	phone?: string
	/** Optional print-production note. */
	note?: string
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
	materialDefault?: string
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
	/** Optional old-Manager section label. */
	sectionLabel?: string
	outputName?: string
	outputDescription?: string
	/** Optional no-material message. */
	noMaterialConfigured?: string
	companyLabel?: string
	companyPlaceholder?: string
	streetLabel?: string
	streetPlaceholder?: string
	cityLabel?: string
	cityPlaceholder?: string
	zipLabel?: string
	zipPlaceholder?: string
	contactNameLabel?: string
	contactNamePlaceholder?: string
	phoneLabel?: string
	phonePlaceholder?: string
	noteLabel?: string
	notePlaceholder?: string
	priceEyebrow?: string
	priceIdle?: string
	closeLabel?: string
}

export interface PrintMaterialOption {
	id: string
	label: string
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
	/** Output title shown in the old Manager print-order summary card. */
	outputName?: string
	/** Output dimension / format line shown in the old Manager print-order summary card. */
	outputDescription?: string
	/** Available print materials. Empty means the old Manager disabled the order action. */
	materialOptions?: PrintMaterialOption[]
	/** Initial quantity. Old Manager opens print with a production-like quantity instead of blank. */
	initialQuantity?: number
	/** Modal family. Dashboard Workspace print orders use the old wider source panel. */
	surfaceVariant?: 'standard' | 'dashboard'
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

function capitalizeFirstAddressLetter(value: string): string {
	const index = value.search(/\p{L}/u)
	if (index < 0) return value
	return `${value.slice(0, index)}${value.charAt(index).toUpperCase()}${value.slice(index + 1)}`
}

/** Send-to-print modal with validated size / material / quantity / address. */
export function SendToPrintModal({
	isOpen,
	onOpenChange,
	onConfirm,
	isPending = false,
	error,
	labels,
	outputName,
	outputDescription,
	materialOptions = [],
	initialQuantity = 500,
	surfaceVariant = 'standard',
	'data-testid': testId,
}: SendToPrintModalProps): React.ReactNode {
	const titleId = useId()
	const descriptionId = useId()
	// `materialOptions` is normally fetched, so it is [] on mount. Seeding useState
	// from it captures that empty first render forever; deriving the fallback each
	// render selects the first option as soon as the list arrives. '' means
	// "untouched", not "nothing selected".
	const [materialId, setMaterialId] = useState('')
	const [sizeRaw, setSizeRaw] = useState('')
	const [quantityRaw, setQuantityRaw] = useState(String(initialQuantity))
	const [company, setCompany] = useState('')
	const [street, setStreet] = useState('')
	const [city, setCity] = useState('')
	const [zip, setZip] = useState('')
	const [contactName, setContactName] = useState('')
	const [phone, setPhone] = useState('')
	const [note, setNote] = useState('')

	const quantity = useMemo(() => parseQuantity(quantityRaw), [quantityRaw])
	const effectiveMaterialId = materialId || (materialOptions[0]?.id ?? '')
	const selectedMaterial = useMemo(
		() => materialOptions.find((option) => option.id === effectiveMaterialId) ?? null,
		[effectiveMaterialId, materialOptions],
	)
	// `size` is the caller's output description when it supplies one, and a collected
	// field otherwise — the documented `print_specs` rule is that it is non-blank, and
	// `outputDescription` is optional, so it cannot be the only source.
	const derivedSize = outputDescription?.trim() ?? ''
	const size = derivedSize || sizeRaw.trim()
	// Surface the quantity error only once the user has typed something invalid
	// (not on the initial blank state — that would scream before any input).
	const quantityInvalid = quantityRaw.trim().length > 0 && quantity === null

	const reset = (): void => {
		setMaterialId('')
		setSizeRaw('')
		setQuantityRaw(String(initialQuantity))
		setCompany('')
		setStreet('')
		setCity('')
		setZip('')
		setContactName('')
		setPhone('')
		setNote('')
	}

	const canConfirm =
		!isPending &&
		size.length > 0 &&
		quantity !== null &&
		selectedMaterial !== null &&
		company.trim().length > 0 &&
		street.trim().length > 0 &&
		city.trim().length > 0 &&
		zip.trim().length > 0 &&
		contactName.trim().length > 0 &&
		phone.trim().length > 0

	const handleOpenChange = (open: boolean): void => {
		if (!open) reset()
		onOpenChange(open)
	}

	const handleConfirm = (): void => {
		if (!canConfirm || quantity === null || selectedMaterial === null) return
		const address = [company, street, `${zip} ${city}`, contactName, phone]
			.map((part) => part.trim())
			.filter(Boolean)
			.join(', ')
		onConfirm({
			size,
			material: selectedMaterial.label.trim(),
			quantity,
			address,
			company: company.trim(),
			street: street.trim(),
			city: city.trim(),
			zip: zip.trim(),
			contactName: contactName.trim(),
			phone: phone.trim(),
			note: note.trim(),
		})
	}

	const surfaceClassName = surfaceVariant === 'dashboard'
		? 'box-border flex h-[min(90vh,72rem)] max-h-[min(90vh,72rem)] w-[min(50vw,72rem)] max-w-[min(50vw,72rem)] flex-col overflow-hidden p-0 max-[900px]:h-[90vh] max-[900px]:w-[92vw] max-[900px]:max-w-[92vw]'
		: 'box-border flex h-[min(90vh,72rem)] max-h-[min(90vh,72rem)] w-[min(90vw,51rem)] max-w-[min(90vw,51rem)] flex-col overflow-hidden p-0 max-[900px]:h-[90vh] max-[900px]:w-[92vw] max-[900px]:max-w-[92vw]'

	return (
		<ModalOverlay
			isOpen={isOpen}
			onOpenChange={handleOpenChange}
			isDismissable
		>
			<ModalSurface className={surfaceClassName}>
				<ModalDialog
					aria-labelledby={titleId}
					aria-describedby={descriptionId}
					data-testid={testId ?? 'delivery-print-modal'}
					className="flex min-h-0 flex-1 flex-col outline-none"
				>
					{({ close }) => (
						<form
							className="flex min-h-0 flex-1 flex-col gap-6 py-10"
							onSubmit={(event) => {
								event.preventDefault()
								handleConfirm()
							}}
							noValidate
						>
							<div className="mx-auto box-border w-full max-w-[50rem] px-5">
								<div className="flex items-start justify-between gap-4">
									<h2 id={titleId} className="m-0 max-w-[19ch] text-heading1 font-medium leading-[1.02] tracking-tight text-fg">
										{labels.title}
									</h2>
									<button
										type="button"
										onClick={close}
										aria-label={labels.closeLabel ?? 'Close'}
										className="-mr-1 -mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-fg-subtle outline-none transition-colors hover:bg-surface-muted hover:text-fg focus-visible:ring-2 focus-visible:ring-ring"
									>
										<svg
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											aria-hidden="true"
										>
											<path d="M6 6l12 12M18 6 6 18" />
										</svg>
									</button>
								</div>
							</div>

							<div className="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
								<div className="mx-auto box-border flex w-full max-w-[50rem] flex-col gap-6 px-5">
									<div className="flex flex-col gap-1">
										<p className="m-0 text-body font-medium text-fg">
											{labels.sectionLabel ?? labels.title}
										</p>
										<p id={descriptionId} className="m-0 max-w-[48ch] text-body font-normal text-fg">
											{labels.body}
										</p>
									</div>

									<div className="flex flex-col gap-1 rounded-md bg-surface-card p-3 text-caption leading-4 text-fg-muted">
										<span>{outputName?.trim() || labels.outputName || labels.sizeLabel}</span>
										{outputDescription?.trim() || labels.outputDescription || labels.sizePlaceholder ? (
											<strong className="font-medium text-fg">
												{outputDescription?.trim() || labels.outputDescription || labels.sizePlaceholder}
											</strong>
										) : null}
									</div>

									<div className="grid gap-3">
										{derivedSize ? null : (
											<Input
												label={labels.sizeLabel}
												placeholder={labels.sizePlaceholder}
												value={sizeRaw}
												onChange={setSizeRaw}
												data-testid="delivery-print-size"
											/>
										)}

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

										{materialOptions.length > 1 ? (
											<label className="grid gap-1.5 text-small font-medium text-fg">
												<span>{labels.materialLabel}</span>
												<select
													value={effectiveMaterialId}
													onChange={(event) => setMaterialId(event.currentTarget.value)}
													data-testid="delivery-print-material"
													className="h-12 rounded-md border border-border bg-surface px-3 text-body font-normal text-fg outline-none transition-colors hover:border-border-muted focus:border-fg focus:ring-2 focus:ring-ring"
												>
													{materialOptions.map((option) => (
														<option key={option.id} value={option.id}>
															{option.label}
														</option>
													))}
												</select>
											</label>
										) : selectedMaterial ? (
											<div
												data-testid="delivery-print-material"
												className="flex flex-col gap-1 rounded-md bg-surface-card p-3 text-caption leading-4 text-fg-muted"
											>
												<span>{labels.materialLabel}</span>
												<strong className="font-medium text-fg">{selectedMaterial.label}</strong>
											</div>
										) : (
											<p
												role="note"
												data-testid="delivery-print-material"
												className="m-0 rounded-md bg-surface-card p-3 text-caption leading-4 text-fg-muted"
											>
												{labels.noMaterialConfigured ?? labels.materialPlaceholder}
											</p>
										)}

										<Input
											label={labels.companyLabel ?? labels.addressLabel}
											placeholder={labels.companyPlaceholder ?? labels.addressPlaceholder}
											value={company}
											onChange={setCompany}
											data-testid="delivery-print-company"
										/>
										<Input
											label={labels.streetLabel ?? labels.addressLabel}
											placeholder={labels.streetPlaceholder ?? labels.addressPlaceholder}
											value={street}
											onChange={(value) => setStreet(capitalizeFirstAddressLetter(value))}
											data-testid="delivery-print-street"
										/>
										<div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
											<Input
												label={labels.cityLabel ?? labels.addressLabel}
												placeholder={labels.cityPlaceholder ?? labels.addressPlaceholder}
												value={city}
												onChange={setCity}
												data-testid="delivery-print-city"
											/>
											<Input
												label={labels.zipLabel ?? labels.addressLabel}
												placeholder={labels.zipPlaceholder ?? labels.addressPlaceholder}
												value={zip}
												onChange={setZip}
												data-testid="delivery-print-zip"
											/>
										</div>
										<div className="grid gap-4 sm:grid-cols-2">
											<Input
												label={labels.contactNameLabel ?? labels.addressLabel}
												placeholder={labels.contactNamePlaceholder ?? labels.addressPlaceholder}
												value={contactName}
												onChange={setContactName}
												data-testid="delivery-print-contact"
											/>
											<Input
												label={labels.phoneLabel ?? labels.addressLabel}
												placeholder={labels.phonePlaceholder ?? labels.addressPlaceholder}
												value={phone}
												onChange={setPhone}
												type="tel"
												data-testid="delivery-print-phone"
											/>
										</div>
										<Input
											label={labels.noteLabel ?? labels.addressLabel}
											placeholder={labels.notePlaceholder ?? labels.addressPlaceholder}
											value={note}
											onChange={setNote}
											data-testid="delivery-print-note"
										/>
									</div>

									{error ? (
										<p data-testid="delivery-print-error" role="alert" className="m-0 text-small text-danger">
											{error}
										</p>
									) : null}
								</div>
							</div>

							<div className="sticky bottom-0 mt-0 w-full border-border border-t bg-surface pt-4">
								<div className="mx-auto box-border flex w-full max-w-[50rem] items-center justify-between gap-4 px-5">
									<div className="flex min-w-0 flex-col gap-1 text-small text-fg-muted">
										{/* No fallback: borrowing `sizeLabel` / `materialPlaceholder` put
										    "Size" and "e.g. Matte 250g" in a money slot for every consumer
										    that had not adopted the new label set. */}
										{labels.priceEyebrow ? <span>{labels.priceEyebrow}</span> : null}
										{labels.priceIdle ? <span className="truncate">{labels.priceIdle}</span> : null}
									</div>
									<div className="flex shrink-0 justify-end gap-2">
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
							</div>
						</form>
					)}
				</ModalDialog>
			</ModalSurface>
		</ModalOverlay>
	)
}
