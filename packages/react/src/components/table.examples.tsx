import { Table } from './table'
const columns = [{ key: 'name', header: 'Name' }, { key: 'city', header: 'City' }]
const data = [{ name: 'Annual report', city: 'Prague' }]
const tasks = [{ name: 'Review the spring campaign', city: 'Prague' }, { name: 'Approve the venue banner', city: 'Brno' }]
export const examples = {
	default: () => <Table columns={columns} data={data} aria-label="Projects" />,
	worksheet: () => <Table appearance="worksheet" columns={columns} data={data} aria-label="CSV preview" />,
	task: () => <Table appearance="task" columns={columns} data={tasks} aria-label="Tasks" />,
	empty: () => <Table appearance="worksheet" columns={columns} data={[]} emptyMessage="No preview rows available." aria-label="Empty CSV" />,
}
export const meta = { category: 'Composite', description: 'Default data table, the source Manager worksheet appearance with monospace column labels, and the TaskTable surface that stacks rows as cards on phones.' }
