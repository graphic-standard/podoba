import { PreviewError } from './preview-error'
export const examples = {
	default: () => (
		<PreviewError title="Preview unavailable" description="Please try again." retryLabel="Retry" onRetry={() => {}} />
	),
	variants: () => <PreviewError title="Document unavailable" description="You do not have access to this document." />,
	states: () => (
		<PreviewError
			title="Preview unavailable"
			description="Please try again."
			retryLabel="Retry"
			onRetry={() => {}}
			isPending
		/>
	),
}
export const meta = {
	category: 'Composite',
	description: 'Compact load error with an optional retry; no retry for unavailable access.',
}
