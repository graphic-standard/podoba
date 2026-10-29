import { IslandToolbar, IslandToolbarButton, IslandToolbarSeparator } from './island-toolbar'

export const examples = {
	default: () => (
		<IslandToolbar aria-label="Formatting">
			<IslandToolbarButton label="Bold" icon={<strong>B</strong>} />
			<IslandToolbarButton label="Italic" icon={<em>I</em>} />
		</IslandToolbar>
	),
	variants: () => (
		<IslandToolbar aria-label="Formatting">
			<IslandToolbarButton label="Bold" icon={<strong>B</strong>} />
			<IslandToolbarSeparator />
			<IslandToolbarButton label="Link" icon={<span>↗</span>} />
		</IslandToolbar>
	),
	states: () => (
		<IslandToolbar aria-label="Formatting">
			<IslandToolbarButton label="Bold" icon={<strong>B</strong>} aria-pressed />
			<IslandToolbarButton label="Italic" icon={<em>I</em>} isDisabled />
		</IslandToolbar>
	),
}
export const meta = {
	category: 'Composite',
	description: 'Studio formatting island with expanding accessible command labels.',
}
