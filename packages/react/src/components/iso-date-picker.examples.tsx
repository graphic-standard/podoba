import { useState } from 'react'
import { IsoDatePicker, type IsoDateGranularity } from './iso-date-picker'

function Example({ granularity, initial }: { granularity: IsoDateGranularity; initial: string }) {
	const [value, setValue] = useState<string | null>(initial)
	return (
		<div className="flex w-72 flex-col gap-2">
			<IsoDatePicker label={granularity === 'day' ? 'Date' : 'Date and time'} granularity={granularity} value={value} onChange={setValue} />
			<code className="text-small text-fg-muted" data-testid={`iso-value-${granularity}`}>
				{JSON.stringify(value)}
			</code>
		</div>
	)
}

export const examples = {
	date: () => <Example granularity="day" initial="2026-03-01" />,
	dateTime: () => <Example granularity="minute" initial="2026-03-01T09:30" />,
	invalid: () => <Example granularity="day" initial="not a date" />,
}
export const meta = {
	category: 'Form',
	description: 'DatePicker over an ISO string (YYYY-MM-DD, or YYYY-MM-DDTHH:mm with granularity minute) for forms whose data is JSON. An invalid stored value shows an empty, editable field.',
}
