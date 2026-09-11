import { useState } from 'react'

import { MediaSettingsDialog, type MediaSettingsLabels, type MediaSettingsValue } from './media-settings-dialog'

const labels: MediaSettingsLabels = {
	title: 'Media settings', displayTitle: 'Display', displayHint: 'Choose how this reference appears.', displayMode: 'Display mode', media: 'Media', gallery: 'Gallery', widthTitle: 'Width', widthHint: 'Choose the content width.', mediaWidth: 'Media width', textWidth: 'Text', wide: 'Wide', fullWidth: 'Full width', layoutTitle: 'Layout', layoutHint: 'Choose the gallery layout.', galleryLayout: 'Gallery layout', carousel: 'Carousel', grid: 'Grid', cancel: 'Cancel', save: 'Save', close: 'Close',
}
const initial: MediaSettingsValue = { displayMode: 'media', mediaWidth: 'text', galleryLayout: 'grid' }

function Example({ value = initial }: { value?: MediaSettingsValue }) {
	const [open, setOpen] = useState(true)
	const [current, setCurrent] = useState(value)
	return <MediaSettingsDialog isOpen={open} onClose={() => setOpen(false)} onSave={next => { setCurrent(next); setOpen(false) }} value={current} labels={labels} />
}

export const examples = {
	default: () => <Example />,
	gallery: () => <Example value={{ ...initial, displayMode: 'gallery' }} />,
	disabled: () => <MediaSettingsDialog isOpen onClose={() => undefined} onSave={() => undefined} value={initial} labels={labels} isDisabled />,
}
export const meta = { category: 'Composite', description: 'Media presentation settings with discardable draft and conditional fields.' }
