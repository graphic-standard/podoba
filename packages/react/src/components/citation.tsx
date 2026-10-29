import type { ReactNode } from 'react'
import { Tile } from './tile'

/** Narrative rule citation; source actions remain separate from review/approval. */
export function Citation({
	children,
	source,
	variant = 'line',
}: {
	children: ReactNode
	source?: ReactNode
	variant?: 'line' | 'box'
}) {
	const content = (
		<figure className="m-0">
			<blockquote className="m-0 whitespace-pre-wrap text-body font-normal leading-relaxed text-fg">
				{children}
			</blockquote>
			{source ? <figcaption className="mt-4 text-label font-normal text-fg-muted">{source}</figcaption> : null}
		</figure>
	)
	return variant === 'box' ? (
		<Tile className="h-auto min-h-0">{content}</Tile>
	) : (
		<div className="border-s border-border ps-4">{content}</div>
	)
}
