import { ColumnLayout, ColumnLayoutRow, ColumnLayoutColumn, ColumnLayoutEmpty } from './column-layout'
export const examples = {
	default: () => (
		<ColumnLayout>
			<ColumnLayoutRow weights={[1, 1]}>
				<ColumnLayoutColumn>Main content</ColumnLayoutColumn>
				<ColumnLayoutColumn>Supporting content</ColumnLayoutColumn>
			</ColumnLayoutRow>
		</ColumnLayout>
	),
	variants: () => (
		<ColumnLayout>
			<ColumnLayoutRow weights={[2, 1]}>
				<ColumnLayoutColumn>Wide content</ColumnLayoutColumn>
				<ColumnLayoutColumn>Supporting content</ColumnLayoutColumn>
			</ColumnLayoutRow>
		</ColumnLayout>
	),
	states: () => (
		<ColumnLayout>
			<ColumnLayoutRow weights={[1, 1, 1]}>
				<ColumnLayoutColumn>Content</ColumnLayoutColumn>
				<ColumnLayoutColumn>
					<ColumnLayoutEmpty>Empty column</ColumnLayoutEmpty>
				</ColumnLayoutColumn>
				<ColumnLayoutColumn>Content</ColumnLayoutColumn>
			</ColumnLayoutRow>
		</ColumnLayout>
	),
}
export const meta = {
	category: 'Layout',
	description: 'Responsive weighted columns with a consistent block handle gutter.',
}
