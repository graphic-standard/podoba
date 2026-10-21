import { InlineAlert } from './inline-alert'

export const examples = {
	default: () => <InlineAlert>The output could not be downloaded.</InlineAlert>,
	status: () => <InlineAlert role="status">This file is already saved. No additional copy was created.</InlineAlert>,
	longMessage: () => <InlineAlert>The original file is already available. Open the existing document to continue checking its details.</InlineAlert>,
}
export const meta = { category: 'Feedback', description: 'Inline GS output warning with its original exclamation glyph. Consumer supplies the message and live-region role.' }
