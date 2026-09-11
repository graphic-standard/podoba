import { useState } from 'react'
import { Button } from './button'
import { Input } from './input'
import { WizardForm, WizardBrief, WizardFormDialog, ProductionSettingsDialog, ProductionSettingsAction, SettingsDialogDisclosure, SettingsDialogProductionColumns } from './settings-dialog-surface'
import { DialogActionButton } from './dialog-action-button'
import { SettingsDialogSurface, SettingsDialogIdentity, SettingsDialogAction, SettingsDialogEmphasis, SettingsDialogDescription, SettingsDialogLabel, SettingsDialogHint, type SettingsDialogVariant } from './settings-dialog-surface'

function Example({ variant = 'create', pending = false, error = false, wide = false }: { variant?: SettingsDialogVariant; pending?: boolean; error?: boolean; wide?: boolean }) {
	const [open, setOpen] = useState(false)
	const Action = variant === 'basic' ? DialogActionButton : SettingsDialogAction
	return <>
		<Button onPress={() => setOpen(true)}>Open {variant} dialog{pending ? ' (pending)' : error ? ' (error)' : ''}</Button>
		<SettingsDialogSurface variant={variant} isOpen={open} onOpenChange={setOpen} isPending={pending}
			isWide={wide} description={variant === 'csv' ? 'Review the column-to-field mapping before importing.' : undefined}
			label="Settings example" closeLabel="Close settings"
			title={variant === 'basic' ? <><SettingsDialogEmphasis>{'Set the project name\nand describe '}</SettingsDialogEmphasis>the brief.</> : variant === 'catalog' ? <>Choose an output template<br />to add to this section.</> : <>Create <span className="text-fg">a new section</span> for your <span className="text-fg">production workspace</span>.</>}
			footer={<><Action variant="secondary" isDisabled={pending} onPress={() => setOpen(false)}>Cancel</Action><Action isPending={pending} isDisabled={pending}>Save</Action></>}
		>
			{variant === 'basic' ? <SettingsDialogDescription><SettingsDialogLabel>Basic information</SettingsDialogLabel><SettingsDialogHint>Keep the project name clear and add a short brief so the team understands what this work is about.</SettingsDialogHint></SettingsDialogDescription> : null}
			<SettingsDialogIdentity><Input appearance="filled" label="Section name" defaultValue="Spring campaign" isDisabled={pending} /></SettingsDialogIdentity>
			{error ? <p role="alert" className="text-small text-danger">The changes could not be saved. Please try again.</p> : null}
		</SettingsDialogSurface>
	</>
}
function ProductionExample() {
	const [open, setOpen] = useState(false)
	return <><Button onPress={() => setOpen(true)}>Open production settings</Button><ProductionSettingsDialog isOpen={open} onOpenChange={setOpen} prefix="Template settings" title="Poster" description="Configure production details." closeLabel="Close settings" preview={<span>Artwork preview</span>} footer={<><ProductionSettingsAction variant="secondary" onPress={() => setOpen(false)}>Close</ProductionSettingsAction><ProductionSettingsAction isDisabled>Save</ProductionSettingsAction></>}><SettingsDialogDisclosure title="General"><Input label="Name" appearance="filled" defaultValue="Poster" /></SettingsDialogDisclosure></ProductionSettingsDialog></>
}
function WizardExample({ expanded = false, pending = false }: { expanded?: boolean; pending?: boolean }) {
	const [open, setOpen] = useState(false)
	return <><Button onPress={() => setOpen(true)}>Open wizard {expanded ? 'catalog' : 'form'}{pending ? ' pending' : ''}</Button><WizardFormDialog isOpen={open} onOpenChange={setOpen} isExpanded={expanded} isPending={pending} closeLabel="Close wizard" title={<>Create a <SettingsDialogEmphasis>new preset</SettingsDialogEmphasis><br />and define its details.</>} footer={<><Button variant="secondary" isDisabled={pending} onPress={() => setOpen(false)}>Cancel</Button><Button isPending={pending} isDisabled={pending}>Next</Button></>}><WizardForm><Input label="Name" appearance="filled" isDisabled={pending} defaultValue="Campaign" /><WizardBrief label="Scenario brief">Prepare the selected templates and shared content.</WizardBrief></WizardForm></WizardFormDialog></>
}
export const examples = {
	wizard: () => <WizardExample />,
	wizardSizes: () => <><WizardExample /><WizardExample expanded /></>,
	wizardPending: () => <WizardExample pending />,
	production: () => <ProductionExample />,
	default: () => <Example />,
	productionColumns: () => <SettingsDialogProductionColumns><Input label="Material" appearance="filled" /><Input label="Surface finish" appearance="filled" /></SettingsDialogProductionColumns>,
	disclosures: () => <><SettingsDialogDisclosure title="Settings" description="Campaign templates"><Input label="Name" appearance="filled" defaultValue="Poster" /></SettingsDialogDisclosure><SettingsDialogDisclosure title="Print" description="Available for Print templates" defaultExpanded={false}><Input label="Material" appearance="filled" isDisabled /></SettingsDialogDisclosure></>,
	variants: () => <><Example variant="create" /><Example variant="edit" /><Example variant="catalog" /><Example variant="csv" /><Example variant="csv" wide /><Example variant="basic" /></>,
	states: () => <><Example pending /><Example error /><Example variant="basic" pending /><Example variant="basic" error /></>,
}
export const meta = { category: 'Layout', description: 'Responsive settings and catalog frames with fixed headings/actions and a scrolling form body.' }
