import { useState } from 'react'
import { CatalogMetricCard } from './template-catalog-card'
import { CatalogLaunchCard, CatalogSummaryBadge, CatalogSummaryGrid, CatalogSummaryCard, TemplateCatalogBrowseCard, TemplateCatalogBrowseGrid } from './template-catalog-card'
import { TemplateCatalogCard, TemplateCatalogGrid, TemplateReferenceGrid, TemplateReferenceList, TemplateReferenceItem, CatalogMetadataSummary } from './template-catalog-card'

function Example({ selected = false, locked = false, title = 'Annual report' }: { selected?: boolean; locked?: boolean; title?: string }) {
	const [value, setValue] = useState(selected)
	return <TemplateCatalogCard title={title} isSelected={value} isSelectionLocked={locked}
		onToggle={() => setValue(!value)} preview={<span className="flex h-full aspect-3/4 items-center justify-center bg-surface text-fg">Aa</span>} />
}

export const examples = {
	metrics: () => <CatalogSummaryGrid>{['0', '205', '—'].map(value => <CatalogMetricCard key={value} title="Templates" value={value} footer={value === '0' ? undefined : 'Catalog'} />)}</CatalogSummaryGrid>,
	launch: () => <CatalogLaunchCard title="Annual report" description="Prepare the yearly report." details="2 sections · 3 outputs" action={<button type="button" aria-label="Start Annual report" className="absolute inset-0 rounded-lg focus-visible:ring-2 focus-visible:ring-ring" />} />,
	launchWithoutBrief: () => <CatalogLaunchCard title="Annual report" details="2 sections · 3 outputs" action={<button type="button" disabled aria-label="Start Annual report" className="absolute inset-0 rounded-lg" />} />,
	summary: () => <CatalogSummaryGrid>{['Campaign', 'Annual report', 'Social launch'].map(title => <CatalogSummaryCard key={title} title={title} badge={<CatalogSummaryBadge color="green">active</CatalogSummaryBadge>} description="Reusable production scenario" details="2 sections · 4 outputs" />)}</CatalogSummaryGrid>,
	readOnly: () => <TemplateCatalogBrowseGrid><TemplateCatalogBrowseCard title="Annual report" templateId="annual" preview={<span>Aa</span>} /><TemplateCatalogBrowseCard title="A long template title that wraps onto multiple lines" templateId="long" preview={<span>Aa</span>} /></TemplateCatalogBrowseGrid>,
	metadata: () => <CatalogMetadataSummary title="Summary" ariaLabel="Template summary" items={[{ label: 'Name', value: 'Annual report', fullWidth: true }, { label: 'Type', value: 'Print' }, { label: 'Format', value: 'A4' }, { label: 'Reference ID', value: 'long-reference-123456789012345678901234567890', fullWidth: true }]} />,
	browsing: () => <TemplateReferenceGrid columns={2}><TemplateReferenceItem title="Annual report" meta="Template" templateId="report" view="preview_grid" onOpen={() => undefined} preview={<span>Aa</span>} /><TemplateReferenceItem title="Unavailable" meta="Template" templateId="missing" view="preview_grid" isDisabled onOpen={() => undefined} preview={<span>Un</span>} /></TemplateReferenceGrid>,
	list: () => <TemplateReferenceList><TemplateReferenceItem title="Annual report" meta="Template" templateId="report" view="compact_list" onOpen={() => undefined} preview={<span>Aa</span>} /><TemplateReferenceItem title="Unavailable" meta="Template" templateId="missing" view="compact_list" isDisabled onOpen={() => undefined} preview={<span>Un</span>} /></TemplateReferenceList>,
	default: () => <TemplateCatalogGrid><Example /></TemplateCatalogGrid>,
	variants: () => <TemplateCatalogGrid><Example /><Example selected /></TemplateCatalogGrid>,
	states: () => <TemplateCatalogGrid><Example selected locked /><Example title="A long template title that wraps instead of disappearing behind an ellipsis" /></TemplateCatalogGrid>,
}
export const meta = { category: 'Composite', description: 'Selection tiles with a contained preview, keyboard focus and locked assignments. Hover and selection share the original green fill.' }
