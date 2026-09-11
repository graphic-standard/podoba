import { DocumentUploadPanel } from './document-upload-panel'

const copy = { title: 'CSV file', actionLabel: 'Select CSV', helperText: 'No CSV file selected yet.\nSelect the CSV file for content mapping.' }
export const examples = {
	default: () => <DocumentUploadPanel {...copy} />,
	dragging: () => <DocumentUploadPanel {...copy} isDragging />,
	disabled: () => <DocumentUploadPanel {...copy} isDisabled />,
}
export const meta = {
	category: 'Form',
	description: 'Upload tile with a centred keyboard-accessible action and a native drop surface. Focus/hover use the shared React Aria button; caller owns file validation.',
}
