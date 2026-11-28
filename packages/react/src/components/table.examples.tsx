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
					<TableRow onPress={() => {}} aria-label="Open Editor">
						<TableRowHeader>Editor</TableRowHeader>
						<TableCell align="right">4</TableCell>
					</TableRow>
					<TableRow>
						<TableRowHeader>Viewer</TableRowHeader>
						<TableCell align="right">12</TableCell>
					</TableRow>
				</TableBody>
			</TableRoot>
		</TableScroll>
	)
}

/** A link in a cell keeps its own click (new tab with Cmd/Ctrl); the rest of the row
 * opens it; right-click, a long press or Shift+F10 opens the row's actions. */
function WithRowActions() {
	const [last, setLast] = useState('nothing yet')
	return (
		<div className="flex flex-col gap-3">
			<Table
				aria-label="Tasks"
				data={data}
				getRowKey={(row) => row.task}
				getRowProps={(row) => ({ 'aria-label': row.task })}
				onRowClick={(row) => setLast(`row: ${row.task}`)}
				rowActionsLabel="Task actions"
				rowActions={(row) => [
					{ id: 'task', items: [{ id: 'rename', label: 'Rename', onSelect: () => setLast(`rename: ${row.task}`) }, { id: 'duplicate', label: 'Duplicate', onSelect: () => setLast(`duplicate: ${row.task}`) }] },
					{ id: 'danger', items: [{ id: 'archive', label: 'Archive', destructive: true, onSelect: () => setLast(`archive: ${row.task}`) }] },
				]}
				columns={[
					{ key: 'task', header: 'Task', render: (row) => <a className="underline" href={`#${encodeURIComponent(row.task)}`} onClick={(event) => { event.preventDefault(); setLast(`link: ${row.task}`) }}>{row.task}</a> },
					{ key: 'assignee', header: 'Assignee' },
					{ key: 'status', header: 'Status' },
				]}
			/>
			<p className="text-small text-fg-muted" data-testid="table-last-action">Last: {last}</p>
		</div>
	)
}

export const examples = {
	default: () => <Table columns={columns} data={data} aria-label="Tasks" />,
	sortable: () => <Table columns={columns} data={data} enableSorting onRowClick={() => {}} aria-label="Tasks" />,
	plain: () => <Table columns={[{ key: 'task', header: 'Task' }, { key: 'due', header: 'Due Date' }]} data={data} aria-label="Tasks" />,
	empty: () => <Table columns={columns} data={[]} emptyMessage="No tasks yet." aria-label="Tasks" />,
	composed: () => <Composed />,
	rowActions: () => <WithRowActions />,
}
export const meta = { category: 'Composite', description: 'The task-table look: mono header labels with optional glyphs, row and cell rules, sortable headers, pressable rows with their own controls in cells, a context menu per row, and the parts for custom structures.' }
