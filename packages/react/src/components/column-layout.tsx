import type { CSSProperties, ReactNode } from 'react'
import { uic } from '../utils/uic'

export const ColumnLayout = uic('div', { displayName: 'ColumnLayout', baseClass: 'grid min-w-0 gap-y-4' })
const Row = uic('div', {
	displayName: 'ColumnLayoutRow',
	baseClass: 'relative grid min-w-0 grid-cols-1 items-start gap-y-4 md:grid-cols-(--layout-columns)',
})
/** The 38 px handle gutter is included once, not added to a second column gap.
 * Weights apply to CONTENT widths after all gutters have been removed.
 */
export function ColumnLayoutRow({
	weights,
	children,
	...props
}: React.ComponentProps<typeof Row> & { weights: readonly number[]; children: ReactNode }) {
	const total = weights.reduce((sum, value) => sum + value, 0)
	const gutter = 'calc(var(--spacing) * 9.5)'
	const columns = weights
		.map((weight) => `minmax(0,calc(${gutter} + (100% - ${weights.length} * ${gutter}) * ${weight} / ${total}))`)
		.join(' ')
	return (
		<Row {...props} style={{ ...props.style, '--layout-columns': columns } as CSSProperties}>
			{children}
		</Row>
	)
}
export const ColumnLayoutColumn = uic('div', {
	displayName: 'ColumnLayoutColumn',
	baseClass: 'grid min-w-0 content-start gap-y-4 ps-9.5',
})
export const ColumnLayoutEmpty = uic('div', {
	displayName: 'ColumnLayoutEmpty',
	baseClass:
		'grid min-h-30 place-content-center gap-2 rounded-lg border border-dashed border-border p-2 text-center text-label text-fg-muted',
})
