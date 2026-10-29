import { Button } from './button'

export function PreviewError({
	title,
	description,
	retryLabel,
	onRetry,
	isPending = false,
}: {
	title: string
	description: string
	retryLabel?: string
	onRetry?: () => void
	isPending?: boolean
}) {
	return (
		<div className="flex max-w-72 flex-col items-start py-3">
			<h3 className="m-0 text-small font-medium text-fg">{title}</h3>
			<p role="alert" className="mb-0 mt-2 text-label font-normal text-danger">
				{description}
			</p>
			{onRetry && retryLabel ? (
				<Button variant="secondary" size="sm" className="mt-5 self-start" onPress={onRetry} isPending={isPending}>
					{retryLabel}
				</Button>
			) : null}
		</div>
	)
}
