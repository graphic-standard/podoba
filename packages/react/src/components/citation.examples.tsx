import { Citation } from './citation'
export const examples = {
	default: () => <Citation source="Brand manual · page 12">Keep the original proportions.</Citation>,
	variants: () => (
		<Citation variant="box" source="Brand manual · page 12">
			Keep the original proportions.
		</Citation>
	),
	states: () => <Citation>Keep the original proportions even when a source is unavailable.</Citation>,
}
export const meta = {
	category: 'Composite',
	description: 'Narrative citation with a left rule or optional inset tile.',
}
