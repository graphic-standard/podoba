import { Textarea } from './textarea'

export const examples = {
	default: () => <Textarea label="Project name" placeholder="Annual report" />,
	variants: () => <><Textarea label="Outlined" /><Textarea appearance="filled" label="Filled" placeholder="Annual report" /></>,
	states: () => <><Textarea appearance="filled" label="Disabled" defaultValue="Saved content" isDisabled /><Textarea appearance="filled" label="Invalid" isInvalid errorMessage="Check the value." /></>,
}
export const meta = { category: 'Form', description: 'Labelled textarea with outlined and Manager-style filled appearances, disabled/error states and keyboard focus.' }
