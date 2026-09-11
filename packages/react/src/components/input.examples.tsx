import { Input } from './input'

export const examples = {
	default: () => <Input label="Project name" placeholder="Annual report" />,
	variants: () => <><Input label="Outlined" /><Input appearance="filled" label="Filled" placeholder="Annual report" /></>,
	states: () => <><Input appearance="filled" label="Disabled" defaultValue="Saved content" isDisabled /><Input appearance="filled" label="Invalid" isInvalid errorMessage="Check the value." /></>,
}
export const meta = { category: 'Form', description: 'Labelled input with outlined and Manager-style filled appearances, disabled/error states and keyboard focus.' }
