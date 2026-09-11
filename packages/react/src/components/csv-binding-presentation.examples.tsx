import { CsvActionButton, CsvMappingSelect, CsvPreviewTable } from './csv-binding-presentation'
import { SelectItem } from './select'

const headers = ['Headline', 'City']
const rows = [{ Headline: 'Annual report', City: 'Prague' }]
const choice = <CsvMappingSelect label="Headline" placeholder="Not bound" defaultSelectedKey="headline">
	<SelectItem id="headline">Headline (headline)</SelectItem>
</CsvMappingSelect>
export const examples = {
	default: () => <CsvPreviewTable headers={headers} rows={rows} label="CSV preview" emptyMessage="No preview rows available." />,
	mapping: () => <CsvPreviewTable headers={headers} rows={rows} mapping={[choice, 'Not bound']} label="CSV mapping" emptyMessage="No columns available for mapping." />,
	states: () => <><CsvActionButton>Review Mapping</CsvActionButton><CsvActionButton isDisabled>Bind CSV</CsvActionButton></>,
}
export const meta = { category: 'Form', description: 'Source CSV worksheet, hidden-label mapping select and footer action typography; preview rows do not sort or hover.' }
