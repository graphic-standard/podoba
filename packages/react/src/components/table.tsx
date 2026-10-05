import { useMemo, useState, type CSSProperties, type HTMLAttributes, type ReactNode, type ThHTMLAttributes } from 'react'
import { uic } from '../utils/uic'

/**
 * Table: the design-system data table, in the look of gs-platform's task GSTable. A
 * flat surface, mono header labels in the muted ink (optionally led by a
 * `TableHeaderIcon`), horizontal rules between rows, vertical rules between body
 * cells, 16px cell padding and rows as tall as their content.
 *
 * Two ways in:
 * - `<Table columns data />` for a plain data grid: the caller supplies how each
 *   column renders and sorts, the table owns the sort state and the row press.
 * - The parts (`TableScroll`, `TableRoot`, `TableHead`, `TableBody`, `TableRow`,
 *   `TableHeaderCell`, `TableSortHeader`, `TableCell`, `TableEmptyRow`) for a table
 *   whose structure the column API cannot express (row headers, colgroups, skeleton
 *   rows, sorting owned by the caller). Both render the same markup and classes.
 *
 * Presentational only: no data fetching, no domain coupling.
 */
export type TableAlign = 'left' | 'right' | 'center'
export type TableSortDirection = 'asc' | 'desc'
export type TableSortState<Key extends string = string> = { key: Key; dir: TableSortDirection }

const align = {
	left: 'text-left',
	right: 'text-right',
	center: 'text-center',
}

/** Horizontal scroll container on the table surface; wide tables scroll, never squash. */
export const TableScroll = uic('div', { displayName: 'TableScroll', baseClass: 'w-full min-w-0 overflow-x-auto bg-surface' })

export const TableRoot = uic('table', {
	displayName: 'TableRoot',
	baseClass: 'w-full border-collapse border-b border-border-muted text-left text-small leading-4.5 text-fg',
})

export const TableHead = uic('thead', { displayName: 'TableHead', baseClass: 'border-b border-border-muted' })

export const TableBody = uic('tbody', { displayName: 'TableBody' })

/** A body row. `interactive` adds the pointer, hover fill and inset focus ring of a pressable row. */
export const TableRow = uic('tr', {
	displayName: 'TableRow',
	baseClass: 'border-b border-border-muted outline-none last:border-b-0',
	variants: {
		interactive: {
			true: 'cursor-pointer transition-colors duration-150 ease-in-out hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none',
		},
	},
})

/** A column header cell: mono label in the muted ink. A row's own header is `TableRowHeader`. */
export const TableHeaderCell = uic('th', {
	displayName: 'TableHeaderCell',
	baseClass: 'p-4 align-middle font-mono text-small leading-4.5 font-normal tracking-normal text-fg-muted',
	variants: { align },
	defaultVariants: { align: 'left' },
	defaultProps: { scope: 'col' },
})

/**
 * Icon + label row inside a header cell that does not sort. `align-top` keeps its text
 * on the same line as a plain-text header next to it; a baseline-aligned inline-flex
 * box sits a pixel or two lower.
 */
export const TableHeaderLabel = uic('span', { displayName: 'TableHeaderLabel', baseClass: 'inline-flex items-center gap-2 whitespace-nowrap align-top' })

const cellClass = 'border-l border-border-muted p-4 align-middle text-small leading-4.5 font-normal text-fg first:border-l-0'

export const TableCell = uic('td', {
	displayName: 'TableCell',
	baseClass: cellClass,
	variants: { align },
	defaultVariants: { align: 'left' },
})

/** The cell that names its row (`<th scope="row">`): semantically a header, visually a body cell. */
export const TableRowHeader = uic('th', {
	displayName: 'TableRowHeader',
	baseClass: cellClass,
	variants: { align },
	defaultVariants: { align: 'left' },
	defaultProps: { scope: 'row' },
})

/** The single full-width row shown in place of the body when there is nothing to list. */
export function TableEmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
	return (
		<tr>
			<td colSpan={colSpan} className="p-4 text-small leading-4.5 text-fg-muted">{children}</td>
		</tr>
	)
}

export type TableSortHeaderProps = Omit<ThHTMLAttributes<HTMLTableCellElement>, 'children' | 'align'> & {
	label: ReactNode
	/** Leading glyph, usually a `TableHeaderIcon`. */
	icon?: ReactNode
	/** Direction when this column is the active sort, else `null`. */
	direction: TableSortDirection | null
	onSort: () => void
	align?: TableAlign
}

/**
 * A sortable header: the label is the button's accessible name, the arrow is
 * decorative and `aria-sort` on the `<th>` announces the direction. No idle sort
 * glyph; only the active direction shows.
 */
export function TableSortHeader({ label, icon, direction, onSort, align: alignment = 'left', ...rest }: TableSortHeaderProps) {
	return (
		<TableHeaderCell
			align={alignment}
			aria-sort={direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none'}
			{...rest}
		>
			<button
				type="button"
				onClick={onSort}
				className={`inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-sm align-top font-mono font-normal tracking-normal outline-none hover:text-fg focus-visible:ring-2 focus-visible:ring-ring ${alignment === 'right' ? 'flex-row-reverse' : ''}`}
			>
				{icon}
				{label}
				{direction ? <span aria-hidden="true" className="text-fg">{direction === 'asc' ? '↑' : '↓'}</span> : null}
			</button>
		</TableHeaderCell>
	)
}

/** The sort cycle every table shares: unsorted, ascending, descending, unsorted. */
export function nextTableSort<Key extends string>(previous: TableSortState<Key> | null, key: Key): TableSortState<Key> | null {
	if (previous?.key !== key) return { key, dir: 'asc' }
	if (previous.dir === 'asc') return { key, dir: 'desc' }
	return null
}

export type TableColumn<Row> = {
	/** Stable column id (also the default sort key). */
	key: string
	/** Header label. */
	header: ReactNode
	/** Leading header glyph, usually a `TableHeaderIcon`. */
	icon?: ReactNode
	/** Cell renderer. Defaults to `String(row[key])` when omitted. */
	render?: (row: Row) => ReactNode
	/** Whether this column participates in sorting (needs `enableSorting` on the table). */
	sortable?: boolean
	/**
	 * Value used to sort this column (string / number). Defaults to the raw
	 * `row[key]` when the row is an object.
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
	/** Additional semantic/event props for each rendered row. */
	getRowProps?: (row: Row) => HTMLAttributes<HTMLTableRowElement> & Record<`data-${string}`, string | undefined>
	/** Enable client-side sorting on `sortable` columns. */
	enableSorting?: boolean
	/** Whole-row press handler: renders rows as interactive (hover + keyboard). */
	onRowClick?: (row: Row) => void
	/** Message shown in place of the body when `data` is empty. */
	emptyMessage?: ReactNode
	/** Accessible name for the table. */
	'aria-label'?: string
	/** Classes for the scroll container. */
	className?: string
	/** Classes for the `<table>` itself, e.g. `min-w-*` or `table-fixed`. */
	tableClassName?: string
	'data-testid'?: string
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
	enableSorting = false,
	onRowClick,
	emptyMessage = 'No rows.',
	className,
	tableClassName,
	'data-testid': testId,
	...aria
}: TableProps<Row>) {
	const [sort, setSort] = useState<TableSortState | null>(null)

	const sorted = useMemo(() => {
		if (!enableSorting || !sort) return data
		const column = columns.find((c) => c.key === sort.key)
		if (!column) return data
		const dir = sort.dir === 'asc' ? 1 : -1
		// Copy before sort: never mutate the caller's array.
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
		<TableScroll className={className}>
			<TableRoot className={tableClassName} data-testid={testId} {...aria}>
				<TableHead>
					<tr>
						{columns.map((column) => {
							const alignment = column.align ?? 'left'
							const style: CSSProperties | undefined = column.width ? { width: column.width } : undefined
							if (enableSorting && column.sortable) {
								return (
									<TableSortHeader
										key={column.key}
										style={style}
										align={alignment}
										label={column.header}
										icon={column.icon}
										direction={sort?.key === column.key ? sort.dir : null}
										onSort={() => setSort((previous) => nextTableSort(previous, column.key))}
									/>
								)
							}
							return (
								<TableHeaderCell key={column.key} style={style} align={alignment}>
									{column.icon ? <TableHeaderLabel>{column.icon}{column.header}</TableHeaderLabel> : column.header}
								</TableHeaderCell>
							)
						})}
					</tr>
				</TableHead>
				<TableBody>
					{sorted.length === 0 ? (
						<TableEmptyRow colSpan={columns.length}>{emptyMessage}</TableEmptyRow>
					) : (
						sorted.map((row, index) => {
							const rowProps = getRowProps?.(row)
							return (
								<TableRow
									key={rowKey(row, index)}
									{...rowProps}
									interactive={interactive}
									{...(interactive
										? {
												// A pressable row is one control; callers name it via `getRowProps` (`aria-label`).
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
								>
									{columns.map((column) => (
										<TableCell key={column.key} align={column.align ?? 'left'}>
											{column.render ? column.render(row) : String(defaultSortValue(column, row))}
										</TableCell>
									))}
								</TableRow>
							)
						})
					)}
				</TableBody>
			</TableRoot>
		</TableScroll>
	)
}
