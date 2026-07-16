import { useMemo, useState, type ReactNode } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from './icons'

/**
 * Table — the design-system data table (port of gs-platform's `GSTable`). A light,
 * presentational grid: a header row of (optionally sortable) column labels over a
 * body of rows. Rows can be clickable (whole-row press → `onRowClick`, keyboard
 * accessible). Sorting is CLIENT-SIDE and OPTIONAL: enable it with `enableSorting`
 * and mark the sortable columns; clicking a sortable header cycles asc → desc.
 *
 * Presentational only (hard rule #3): no data fetching, no domain coupling. The
 * caller supplies `columns` (how to render + sort each cell) and `data` (the rows).
 * Styling = Tailwind + design-token CSS vars, matching the rest of podoba.
 */
export type TableAlign = 'left' | 'right' | 'center'

export type TableColumn<Row> = {
	/** Stable column id (also the default sort key). */
	key: string
	/** Header label. */
	header: ReactNode
	/** Cell renderer. Defaults to `String(row[key])` when omitted. */
	render?: (row: Row) => ReactNode
	/** Whether this column participates in sorting (needs `enableSorting` on the table). */
	sortable?: boolean
	/**
	 * Value used to sort this column (string / number). Defaults to the raw
	 * `row[key]` when the row is an object, else the stringified render output.
	 */
	sortValue?: (row: Row) => string | number
	/** Horizontal alignment of the header + cells (default `left`). */
	align?: TableAlign
	/** Optional fixed width (CSS length, e.g. `'12rem'` or `'30%'`). */
	width?: string
}

export type TableProps<Row> = {
	columns: TableColumn<Row>[]
	data: Row[]
	/** Stable per-row key. Defaults to the row index (fine for static lists). */
	getRowKey?: (row: Row, index: number) => string
	/** Enable client-side sorting on `sortable` columns. */
	enableSorting?: boolean
	/** Whole-row press handler — renders rows as interactive (hover + keyboard). */
	onRowClick?: (row: Row) => void
	/** Message shown in place of the body when `data` is empty. */
	emptyMessage?: ReactNode
	/** Accessible name for the table. */
	'aria-label'?: string
	className?: string
}

const ALIGN_CLASS: Record<TableAlign, string> = {
	left: 'text-left',
	right: 'text-right',
	center: 'text-center',
}

function defaultSortValue<Row>(column: TableColumn<Row>, row: Row): string | number {
	if (column.sortValue) return column.sortValue(row)
	if (row && typeof row === 'object' && column.key in row) {
		const raw = (row as Record<string, unknown>)[column.key]
		if (typeof raw === 'number' || typeof raw === 'string') return raw
	}
	return ''
}

export function Table<Row>({
	columns,
	data,
	getRowKey,
	enableSorting = false,
	onRowClick,
	emptyMessage = 'No rows.',
	className,
	...aria
}: TableProps<Row>) {
	const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null)

	const toggleSort = (key: string) => {
		setSort((prev) => {
			if (prev?.key !== key) return { key, dir: 'asc' }
			return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
		})
	}

	const sorted = useMemo(() => {
		if (!enableSorting || !sort) return data
		const column = columns.find((c) => c.key === sort.key)
		if (!column) return data
		const dir = sort.dir === 'asc' ? 1 : -1
		// Copy before sort — never mutate the caller's array.
		return [...data].sort((a, b) => {
			const av = defaultSortValue(column, a)
			const bv = defaultSortValue(column, b)
			if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
			return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir
		})
	}, [data, columns, enableSorting, sort])

	const rowKey = getRowKey ?? ((_row: Row, index: number) => String(index))
	const interactive = Boolean(onRowClick)

	return (
		<div className={['w-full overflow-x-auto', className].filter(Boolean).join(' ')}>
			<table className="w-full border-collapse text-small" {...aria}>
				<thead>
					<tr className="border-b border-border">
						{columns.map((column) => {
							const align = column.align ?? 'left'
							const canSort = enableSorting && column.sortable
							const active = sort?.key === column.key
							return (
								<th
									key={column.key}
									scope="col"
									style={column.width ? { width: column.width } : undefined}
									aria-sort={
										canSort ? (active ? (sort?.dir === 'asc' ? 'ascending' : 'descending') : 'none') : undefined
									}
									className={`${ALIGN_CLASS[align]} px-4 py-3 text-label font-medium tracking-wide text-fg-muted uppercase`}
								>
									{canSort ? (
										<button
											type="button"
											onClick={() => toggleSort(column.key)}
											className={`inline-flex items-center gap-1 outline-none transition-colors hover:text-fg focus-visible:text-fg ${
												align === 'right' ? 'flex-row-reverse' : ''
											} ${active ? 'text-fg' : ''}`}
										>
											{column.header}
											{active ? (
												sort?.dir === 'asc' ? (
													<ChevronUpIcon className="h-3.5 w-3.5" />
												) : (
													<ChevronDownIcon className="h-3.5 w-3.5" />
												)
											) : null}
										</button>
									) : (
										column.header
									)}
								</th>
							)
						})}
					</tr>
				</thead>
				<tbody>
					{sorted.length === 0 ? (
						<tr>
							<td colSpan={columns.length} className="px-4 py-10 text-center text-small text-fg-muted">
								{emptyMessage}
							</td>
						</tr>
					) : (
						sorted.map((row, index) => (
							<tr
								key={rowKey(row, index)}
								{...(interactive
									? {
											tabIndex: 0,
											role: 'button',
											onClick: () => onRowClick?.(row),
											onKeyDown: (event: React.KeyboardEvent) => {
												if (event.key === 'Enter' || event.key === ' ') {
													event.preventDefault()
													onRowClick?.(row)
												}
											},
										}
									: {})}
								className={`border-b border-border/60 outline-none ${
									interactive
										? 'cursor-pointer transition-colors hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring'
										: ''
								}`}
							>
								{columns.map((column) => {
									const align = column.align ?? 'left'
									return (
										<td key={column.key} className={`${ALIGN_CLASS[align]} px-4 py-3 align-middle text-fg`}>
											{column.render ? column.render(row) : String(defaultSortValue(column, row))}
										</td>
									)
								})}
							</tr>
						))
					)}
				</tbody>
			</table>
		</div>
	)
}
