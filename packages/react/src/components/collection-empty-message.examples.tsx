import { CollectionEmptyMessage } from './collection-empty-message'

export const examples = {
	default: () => <CollectionEmptyMessage message="No projects yet." nextStep="Create your first project." />,
	compact: () => <CollectionEmptyMessage compact message="No files found." nextStep="Adjust your filters." />,
	withoutAction: () => <CollectionEmptyMessage message="No items are available." />,
	staticPage: () => <CollectionEmptyMessage announce={false} message="No pages yet." nextStep="Create your first page." />,
}
export const meta = {
	category: 'Composite',
	description:
		'Centered empty-collection message for a page, section or dialog list. Inside an asset selection surface use AssetSelectionEmpty; for an empty table body use Table emptyMessage.',
}
