import { useMemo, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from './icons'
export const TABLE_APPEARANCES = ['default', 'worksheet', 'team'] as const
export type TableAppearance = (typeof TABLE_APPEARANCES)[number]

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
	/** Worksheet matches Manager's plain GSTable; default preserves existing consumers. */
	appearance?: TableAppearance
	columns: TableColumn<Row>[]
	data: Row[]
	/** Stable per-row key. Defaults to the row index (fine for static lists). */
	getRowKey?: (row: Row, index: number) => string
	/** Additional semantic/event props for each rendered row. */
	getRowProps?: (row: Row) => HTMLAttributes<HTMLTableRowElement>
	columnTemplate?: string
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
	getRowProps,
	columnTemplate,
	enableSorting = false,
	onRowClick,
	emptyMessage = 'No rows.',
	className,
	appearance = 'default',
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
	const worksheet = appearance === 'worksheet'
	const team = appearance === 'team'
	const gridTemplate = columnTemplate ?? `repeat(${columns.length}, minmax(0, 1fr))`

	return (
		<div className={['w-full overflow-x-auto', className].filter(Boolean).join(' ')}>
			<table style={team ? { '--table-columns': gridTemplate } as CSSProperties : undefined} className={`w-full border-collapse text-small ${worksheet ? 'border-b border-border font-normal leading-4.5' : ''} ${team ? 'block border-b border-border font-normal leading-4.5' : ''}`} {...aria}>
				<thead className={team ? 'block' : undefined}>
					<tr className={`${worksheet ? '' : 'border-b border-border'} ${team ? 'grid grid-cols-[var(--table-columns)] gap-3 bg-surface-muted px-4 max-[1023px]:hidden' : ''}`}>
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
									className={`${ALIGN_CLASS[align]} ${worksheet ? 'border-0 px-3 py-4 align-middle font-mono text-small font-normal leading-4.5 tracking-normal text-fg normal-case bg-surface whitespace-nowrap' : team ? 'border-0 px-4 py-3 align-middle font-mono text-small font-normal leading-4.5 tracking-normal text-fg normal-case whitespace-nowrap' : 'px-4 py-3 text-label font-medium tracking-wide text-fg-muted uppercase'}`}
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
				<tbody className={team ? 'block' : undefined}>
					{sorted.length === 0 ? (
						<tr>
							<td colSpan={columns.length} className={worksheet ? 'border-y border-border px-6 py-4 text-small font-normal leading-4.5 text-fg' : 'px-4 py-10 text-center text-small text-fg-muted'}>
								{emptyMessage}
							</td>
						</tr>
					) : (
						sorted.map((row, index) => {
						const rowProps = getRowProps?.(row)
						return (
							<tr
								key={rowKey(row, index)}
								{...rowProps}
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
								className={`${worksheet ? 'min-h-15' : team ? 'grid grid-cols-[var(--table-columns)] gap-3 border-b border-border px-4 py-3 text-label font-normal leading-4.5 max-[1023px]:grid max-[1023px]:grid-cols-1 max-[1023px]:gap-2 max-[1023px]:p-4' : 'border-b border-border/60'} ${team ? 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring' : ''} outline-none ${
									interactive
										? 'cursor-pointer transition-colors hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring'
										: ''
								}${rowProps?.className ? ` ${rowProps.className}` : ''}`}
							>
								{columns.map((column) => {
									const align = column.align ?? 'left'
									return (
										<td key={column.key} className={`${ALIGN_CLASS[align]} ${worksheet ? 'border border-border first:border-l-0 last:border-r-0 px-6 py-4 text-small font-normal leading-4.5' : team ? 'px-0 py-0 align-middle text-small font-normal leading-4.5 max-[1023px]:block' : 'px-4 py-3'} align-middle text-fg`}>
											{column.render ? column.render(row) : String(defaultSortValue(column, row))}
										</td>
									)
								})}
							</tr>
						)
						})
					)}
				</tbody>
			</table>
		</div>
	)
}
