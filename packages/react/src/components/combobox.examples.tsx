import { ComboBox, ComboBoxItem } from './combobox'
import type { FieldAppearance } from './field-appearance'

function Example({ appearance = 'outlined', disabled = false, invalid = false }: { appearance?: FieldAppearance; disabled?: boolean; invalid?: boolean }) {
	return <ComboBox appearance={appearance} label="Country" placeholder="Type to search" isDisabled={disabled}
		isInvalid={invalid} errorMessage="Choose a country." emptyState="No country matches" allowsEmptyCollection>
		<ComboBoxItem id="cz">Czechia</ComboBoxItem>
		<ComboBoxItem id="sk">Slovakia</ComboBoxItem>
		<ComboBoxItem id="pl">Poland</ComboBoxItem>
		<ComboBoxItem id="at">Austria</ComboBoxItem>
	</ComboBox>
}
export const examples = {
	default: () => <Example />,
	variants: () => <><Example /><Example appearance="filled" /></>,
	states: () => <><Example appearance="filled" disabled /><Example appearance="filled" invalid /></>,
}
export const meta = { category: 'Form', description: 'Filterable single-select in the outlined or the borderless 42 px filled skin, with a replaceable "No results" message for translated forms.' }
