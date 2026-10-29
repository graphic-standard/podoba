import type { ReactNode } from 'react'
import { IconButton } from './icon-button'
import { Disclosure, DisclosurePanel } from './disclosure'
import { uic } from '../utils/uic'

const Surface = uic('section', {
	displayName: 'PreviewMetadataCard',
	baseClass: 'min-w-0 overflow-hidden rounded-lg border border-border bg-surface',
})
/** A preview stays visible while its metadata may collapse independently. */
export function PreviewMetadataCard({
	title,
	preview,
	children,
	collapsible = false,
	toggleLabel,
	previewClassName = 'h-60',
	actions,
}: {
	title: ReactNode
	preview: ReactNode
	children: ReactNode
	collapsible?: boolean
	toggleLabel?: string
	previewClassName?: string
	actions?: ReactNode
}) {
	const heading = (
		<div className="flex min-w-0 items-center justify-between gap-3">
			<h3 className="m-0 min-w-0 text-panel-heading font-medium text-fg">{title}</h3>
			{actions}
			{collapsible ? (
				<IconButton slot="trigger" className="h-9 w-9 shrink-0 p-0" label={toggleLabel ?? ''}>
					<svg
						aria-hidden="true"
						viewBox="0 0 24 24"
						className="size-4 group-data-[expanded]/preview-metadata:rotate-180"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
					>
						<path d="m6 9 6 6 6-6" />
					</svg>
				</IconButton>
			) : null}
		</div>
	)
	return (
		<Surface>
			<div
				className={`relative flex min-w-0 items-center justify-center overflow-hidden bg-surface-muted p-5 ${previewClassName}`}
			>
				{preview}
			</div>
			{collapsible ? (
				<Disclosure className="group/preview-metadata p-5">
					{heading}
					<DisclosurePanel className="mt-3">{children}</DisclosurePanel>
				</Disclosure>
			) : (
				<div className="p-5">
					{heading}
					<div className="mt-4">{children}</div>
				</div>
			)}
		</Surface>
	)
}
export function PropertyTable({
	rows,
	label,
}: {
	rows: readonly { label: ReactNode; value: ReactNode }[]
	label: string
}) {
	return (
		<table aria-label={label} className="w-full border-collapse text-label font-normal text-fg">
			<tbody>
				{rows.map((row, index) => (
					<tr key={index} className="border-b border-border last:border-b-0">
						<th scope="row" className="w-1/2 py-3 pe-3 text-start font-normal text-fg-muted">
							{row.label}
						</th>
						<td className="border-s border-border py-3 ps-3 text-start font-normal">{row.value}</td>
					</tr>
				))}
			</tbody>
		</table>
	)
}
export function ColorSwatch({ color, label }: { color: string; label: string }) {
	const hex = color.replace('#', ''),
		full = hex.length === 3 ? [...hex].map((value) => value + value).join('') : hex
	const rgb = /^[a-f\d]{6}$/i.test(full)
		? [0, 2, 4].map((index) => parseInt(full.slice(index, index + 2), 16) / 255)
		: [0, 0, 0]
	const luminance = rgb.reduce(
		(sum, value, index) =>
			sum +
			(0.2126 * (index === 0 ? 1 : 0) + 0.7152 * (index === 1 ? 1 : 0) + 0.0722 * (index === 2 ? 1 : 0)) *
				(value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4),
		0,
	)
	return (
		<span
			role="img"
			aria-label={label}
			className={`block size-5 shrink-0 rounded-full ${luminance > 0.8 ? 'border border-border' : ''}`}
			style={{ backgroundColor: color }}
		/>
	)
}
