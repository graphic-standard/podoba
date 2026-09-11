import { Table } from './table'
const columns = [{ key: 'name', header: 'Name' }, { key: 'city', header: 'City' }]
const data = [{ name: 'Annual report', city: 'Prague' }]
export const examples = {
	default: () => <Table columns={columns} data={data} aria-label="Projects" />,
	worksheet: () => <Table appearance="worksheet" columns={columns} data={data} aria-label="CSV preview" />,
	empty: () => <Table appearance="worksheet" columns={columns} data={[]} emptyMessage="No preview rows available." aria-label="Empty CSV" />,
}
export const meta = { category: 'Composite', description: 'Default data table and the source Manager worksheet appearance with monospace column labels.' }
