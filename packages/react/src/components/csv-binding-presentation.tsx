import { useEffect, useState, type ReactNode } from 'react'
import { uic } from '../utils/uic'
import { Table } from './table'
import { Select, type SelectProps } from './select'
import { DialogActionButton } from './dialog-action-button'

const PreviewScroll = uic('div', { displayName: 'CsvPreviewScroll', baseClass: 'w-full min-w-0 overflow-x-auto' })

/** CSV preview has one header per original column; a mapping row precedes data. */
export function CsvPreviewTable({ headers, rows, mapping, label, emptyMessage, ...rest }: {
	headers: string[]
	rows: Readonly<Record<string, string>>[]
	mapping?: ReactNode[]
	label: string
	emptyMessage: string
	'data-testid'?: string
}) {
	const [compact, setCompact] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches)
	useEffect(() => {
		const media = window.matchMedia('(max-width: 900px)')
		const update = () => setCompact(media.matches)
		update()
		media.addEventListener('change', update)
		return () => media.removeEventListener('change', update)
	}, [])
	const data: ReactNode[][] = rows.map(row => headers.map(header => row[header] ?? ''))
	if (mapping) data.unshift(mapping)
	return <PreviewScroll {...rest}>
		<Table<ReactNode[]> appearance="worksheet" className={compact ? 'min-w-168' : 'min-w-256'}
			aria-label={label} emptyMessage={emptyMessage} data={data}
			columns={headers.map((header, index) => ({ key: String(index), header, render: row => row[index] }))} />
	</PreviewScroll>
}

export function CsvMappingSelect<T extends object>(props: SelectProps<T>) {
	return <Select {...props} appearance="filled" isLabelHidden rootClassName="w-full min-w-48" />
}

/** Original UI Button md (16/20 medium, 12x24 padding), without global button changes. */
export const CsvActionButton = DialogActionButton
