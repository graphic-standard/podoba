import { CollectionEmptyMessage } from './collection-empty-message'

export const examples = {
 default: () => <CollectionEmptyMessage message="No projects yet." nextStep="Create your first project." />,
 compact: () => <CollectionEmptyMessage compact message="No files found." nextStep="Adjust your filters." />,
 withoutAction: () => <CollectionEmptyMessage message="No items are available." />,
}
export const meta = { category: 'Composite', description: 'Centered, label-driven empty collection feedback for pages and compact dialogs.' }
