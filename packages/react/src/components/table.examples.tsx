import { useState } from 'react'
import {
	nextTableSort,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeaderCell,
	TableRoot,
	TableRow,
	TableRowHeader,
	TableScroll,
	TableSortHeader,
	type TableSortState,
} from './table'
import { TableHeaderIcon } from './table-header-icon'

type Task = { task: string; assignee: string; status: string; due: string }
const data: Task[] = [
	{ task: 'Annual report cover', assignee: 'Eva Novak', status: 'In review', due: 'Oct 09, 2026' },
	{ task: 'Spring campaign banners', assignee: 'Petr Dvorak', status: 'To do', due: 'Oct 21, 2026' },
]
const columns = [
	{ key: 'task', header: 'Task', icon: <TableHeaderIcon kind="check" />, sortable: true, width: '40%' },
	{ key: 'assignee', header: 'Assignee', icon: <TableHeaderIcon kind="user" />, sortable: true },
	{ key: 'status', header: 'Status', icon: <TableHeaderIcon kind="check" />, sortable: true },
	{ key: 'due', header: 'Due Date', icon: <TableHeaderIcon kind="calendar" /> },
]

function Composed() {
	const [sort, setSort] = useState<TableSortState<'name'> | null>(null)
	return (
		<TableScroll>
			<TableRoot aria-label="Roles">
				<TableHead>
					<tr>
						<TableSortHeader label="Role" direction={sort?.key === 'name' ? sort.dir : null} onSort={() => setSort((previous) => nextTableSort(previous, 'name'))} />
						<TableHeaderCell align="right">Members</TableHeaderCell>
					</tr>
				</TableHead>
				<TableBody>
					<TableRow>
						<TableRowHeader>Editor</TableRowHeader>
						<TableCell align="right">4</TableCell>
					</TableRow>
				</TableBody>
			</TableRoot>
		</TableScroll>
	)
}

export const examples = {
	default: () => <Table columns={columns} data={data} aria-label="Tasks" />,
	sortable: () => <Table columns={columns} data={data} enableSorting onRowClick={() => {}} aria-label="Tasks" />,
	plain: () => <Table columns={[{ key: 'task', header: 'Task' }, { key: 'due', header: 'Due Date' }]} data={data} aria-label="Tasks" />,
	empty: () => <Table columns={columns} data={[]} emptyMessage="No tasks yet." aria-label="Tasks" />,
	composed: () => <Composed />,
}
export const meta = { category: 'Composite', description: 'The task-table look: mono header labels with optional glyphs, row and cell rules, sortable headers, pressable rows, and the parts for custom structures.' }
