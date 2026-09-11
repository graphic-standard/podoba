import { useState, type ReactNode } from 'react'
import { Button } from './button'
import { SettingsDialogSurface } from './settings-dialog-surface'
import { Select, SelectItem } from './select'
import { uic } from '../utils/uic'

export const MEDIA_SETTINGS_DISPLAY_MODES = ['media', 'gallery'] as const
export const MEDIA_SETTINGS_WIDTHS = ['text', 'wide', 'full'] as const
export const MEDIA_SETTINGS_LAYOUTS = ['carousel', 'grid'] as const
export type MediaSettingsValue = {
	displayMode: (typeof MEDIA_SETTINGS_DISPLAY_MODES)[number]
	mediaWidth: (typeof MEDIA_SETTINGS_WIDTHS)[number]
	galleryLayout: (typeof MEDIA_SETTINGS_LAYOUTS)[number]
}

export type MediaSettingsLabels = {
	title: ReactNode
	displayTitle: ReactNode
	displayHint: ReactNode
	displayMode: ReactNode
	media: ReactNode
	gallery: ReactNode
	widthTitle: ReactNode
	widthHint: ReactNode
	mediaWidth: ReactNode
	textWidth: ReactNode
	wide: ReactNode
	fullWidth: ReactNode
	layoutTitle: ReactNode
	layoutHint: ReactNode
	galleryLayout: ReactNode
	carousel: ReactNode
	grid: ReactNode
	cancel: ReactNode
	save: ReactNode
	close: string
}

export type MediaSettingsDialogProps = {
	isOpen: boolean
	onClose: () => void
	onSave: (value: MediaSettingsValue) => void
	value: MediaSettingsValue
	isDisabled?: boolean
	labels: MediaSettingsLabels
}

const Field = uic('section', { displayName: 'MediaSettingsField', baseClass: 'flex flex-col gap-0 [&>div]:mt-6' })
const FieldTitle = uic('h2', { displayName: 'MediaSettingsFieldTitle', baseClass: 'm-0 text-panel-heading font-medium text-fg' })
const Hint = uic('p', { displayName: 'MediaSettingsHint', baseClass: 'm-0 text-small leading-4.5 font-normal text-fg-workflow-muted' })

function MediaSettingsDialogInner({ value, labels, isDisabled, onClose, onSave }: Omit<MediaSettingsDialogProps, 'isOpen'>) {
	const [draft, setDraft] = useState(value)
	const update = <K extends keyof MediaSettingsValue>(key: K, next: MediaSettingsValue[K]) => setDraft(current => ({ ...current, [key]: next }))
	return (
		<SettingsDialogSurface variant="edit" isOpen onOpenChange={open => { if (!open) onClose() }} title={labels.title} closeLabel={labels.close}
			footer={<><Button variant="secondary" onPress={onClose}>{labels.cancel}</Button><Button onPress={() => { if (!isDisabled) onSave(draft) }} isDisabled={isDisabled}>{labels.save}</Button></>}
		>
							<Field>
								<FieldTitle>{labels.displayTitle}</FieldTitle><Hint>{labels.displayHint}</Hint>
								<Select label={labels.displayMode} placeholder="" selectedKey={draft.displayMode} onSelectionChange={key => update('displayMode', String(key) as MediaSettingsValue['displayMode'])} isDisabled={isDisabled}>
									<SelectItem id="media">{labels.media}</SelectItem><SelectItem id="gallery">{labels.gallery}</SelectItem>
								</Select>
							</Field>
							{draft.displayMode === 'media' ? <Field key="width">
								<FieldTitle>{labels.widthTitle}</FieldTitle><Hint>{labels.widthHint}</Hint>
								<Select label={labels.mediaWidth} placeholder="" selectedKey={draft.mediaWidth} onSelectionChange={key => update('mediaWidth', String(key) as MediaSettingsValue['mediaWidth'])} isDisabled={isDisabled}>
									<SelectItem id="text">{labels.textWidth}</SelectItem><SelectItem id="wide">{labels.wide}</SelectItem><SelectItem id="full">{labels.fullWidth}</SelectItem>
								</Select>
							</Field> : <Field key="layout">
								<FieldTitle>{labels.layoutTitle}</FieldTitle><Hint>{labels.layoutHint}</Hint>
								<Select label={labels.galleryLayout} placeholder="" selectedKey={draft.galleryLayout} onSelectionChange={key => update('galleryLayout', String(key) as MediaSettingsValue['galleryLayout'])} isDisabled={isDisabled}>
									<SelectItem id="carousel">{labels.carousel}</SelectItem><SelectItem id="grid">{labels.grid}</SelectItem>
								</Select>
							</Field>}
		</SettingsDialogSurface>
	)
}

export function MediaSettingsDialog({ isOpen, ...props }: MediaSettingsDialogProps) {
	if (!isOpen) return null
	return <MediaSettingsDialogInner {...props} />
}
