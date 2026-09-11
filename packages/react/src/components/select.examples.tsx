import { Select, SelectItem } from './select'
import type { FieldAppearance } from './field-appearance'

function Example({ appearance = 'outlined', disabled = false, invalid = false }: { appearance?: FieldAppearance; disabled?: boolean; invalid?: boolean }) {
	return <Select appearance={appearance} label="Content behavior" placeholder="Choose behavior" isDisabled={disabled}
		isInvalid={invalid} errorMessage="Choose a behavior." defaultSelectedKey={invalid ? undefined : 'shared'}>
		<SelectItem id="shared">Shared across outputs</SelectItem>
		<SelectItem id="separate">Edited separately per output</SelectItem>
		<SelectItem id="unavailable" isDisabled>Unavailable behavior</SelectItem>
	</Select>
}
export const examples = {
	default: () => <Example />,
	variants: () => <><Example /><Example appearance="filled" /></>,
	states: () => <><Example appearance="filled" disabled /><Example appearance="filled" invalid /></>,
}
export const meta = { category: 'Form', description: 'Outlined and Manager-style filled selects with keyboard/typeahead navigation. Filled options retain a keyboard outline and larger narrow-screen hit targets for accessibility.' }
