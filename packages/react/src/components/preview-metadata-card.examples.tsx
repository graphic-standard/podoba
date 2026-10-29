import { PreviewMetadataCard, PropertyTable, ColorSwatch } from './preview-metadata-card'
const metadata = (
	<PropertyTable
		label="Typography details"
		rows={[
			{ label: 'Family', value: 'System' },
			{ label: 'Role', value: 'Heading' },
		]}
	/>
)
export const examples = {
	default: () => (
		<PreviewMetadataCard title="Heading" preview="A clear idea">
			{metadata}
		</PreviewMetadataCard>
	),
	variants: () => (
		<PreviewMetadataCard title="Heading" preview="A clear idea" collapsible toggleLabel="Show typography details">
			{metadata}
		</PreviewMetadataCard>
	),
	states: () => (
		<div className="flex gap-4">
			<ColorSwatch color="#ffffff" label="White" />
			<ColorSwatch color="#242423" label="Black" />
		</div>
	),
}
export const meta = {
	category: 'Composite',
	description: 'Preview panel with compact, optionally collapsed property table.',
}
