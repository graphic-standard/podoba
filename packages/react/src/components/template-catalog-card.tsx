import type { CSSProperties, ReactNode } from 'react'
import { Button as AriaButton } from 'react-aria-components'
import { uic } from '../utils/uic'
import { Tile } from './tile'

export const TEMPLATE_CATALOG_SELECTIONS = ['available', 'selected'] as const
export type TemplateCatalogSelection = (typeof TEMPLATE_CATALOG_SELECTIONS)[number]

/** Legacy StatsCard label-1 value, distinct from the Tile heading ramp. */
export const CatalogMetricValue = uic('span', {
	displayName: 'CatalogMetricValue',
	baseClass: 'block w-full text-center text-display-large font-medium leading-(--line-height-display-large) tracking-wider',
})

export const CATALOG_METRIC_FOOTERS = ['present', 'missing'] as const
export type CatalogMetricFooter = (typeof CATALOG_METRIC_FOOTERS)[number]
const MetricContent = uic('div', {
	displayName: 'CatalogMetricContent',
	baseClass: 'flex min-h-0 w-full flex-1 flex-col items-center justify-center text-center',
	variants: { footer: { present: '', missing: 'pb-12' } },
})

/** Compact source statistics: preserve the centered content band without a tail. */
export function CatalogMetricCard({ title, value, footer, onPress, 'aria-label': ariaLabel }: {
	title: string; value: ReactNode; footer?: string; onPress?: () => void; 'aria-label'?: string
}) {
	return <Tile theme="light" eyebrow={title} footer={footer || undefined} onPress={onPress}
		aria-label={ariaLabel} className="h-52 min-h-52 max-h-52">
		<MetricContent data-slot="catalog-metric-content" footer={footer ? 'present' : 'missing'}>
			<CatalogMetricValue>{value}</CatalogMetricValue>
		</MetricContent>
	</Tile>
}

const SummaryCard = uic('article', { displayName: 'CatalogSummaryCard', baseClass: 'flex h-95 w-full min-w-0 flex-col gap-6 overflow-hidden rounded-lg bg-surface-card p-4 text-fg' })
export const CatalogSummaryGrid = uic('div', { displayName: 'CatalogSummaryGrid', baseClass: 'grid w-full min-w-0 grid-cols-1 gap-x-2 gap-y-4 overflow-x-hidden min-[768px]:grid-cols-3 min-[768px]:gap-x-3' })
const SummaryHead = uic('div', { displayName: 'CatalogSummaryHead', baseClass: 'flex w-full min-w-0 items-center justify-between gap-3' })
export const CatalogSummaryBadge = uic('span', { displayName: 'CatalogSummaryBadge', baseClass: 'ml-3 flex h-6 shrink-0 items-center rounded-2xl px-2.5 text-micro font-medium leading-5', style: { fontFeatureSettings: '"liga" off, "clig" off' }, variants: { color: { green: 'bg-brand-green text-fg-on-brand', grey: 'bg-surface-muted text-(--color-neutral-600)' } }, defaultVariants: { color: 'grey' } })
const SummaryTitle = uic('h2', { displayName: 'CatalogSummaryTitle', baseClass: 'm-0 min-w-0 truncate text-heading5 font-medium' })
const SummaryTail = uic('div', { displayName: 'CatalogSummaryTail', baseClass: 'mt-auto flex flex-col gap-1 text-small font-normal text-fg-workflow-muted' })
/** Source gs Tile image cover: caller artwork under a transparent → 30% → 50% black gradient. */
function CatalogCover({ preview }: { preview: ReactNode }) {
	return <>
		<div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden [&_canvas]:size-full [&_canvas]:object-cover [&_img]:size-full [&_img]:object-cover">{preview}</div>
		<div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-b from-black/0 via-black/30 to-black/50" />
	</>
}

/**
 * Display-only catalog tile. No synthetic imagery when a preview is absent. An optional
 * real `preview` covers the card with the source gradient and switches the ink to white.
 */
export function CatalogSummaryCard({ title, badge, description, details, preview }: { title: string; badge: ReactNode; description?: string; details: ReactNode; preview?: ReactNode }) {
	const covered = preview != null
	return <SummaryCard data-preview={covered || undefined} className={covered ? 'relative isolate' : undefined}>
		{covered ? <CatalogCover preview={preview} /> : null}
		<SummaryHead><SummaryTitle className={covered ? 'text-white' : undefined}>{title}</SummaryTitle><span className="shrink-0">{badge}</span></SummaryHead>
		<SummaryTail className={covered ? 'text-white/88' : undefined}>{description ? <p className="m-0">{description}</p> : null}<span>{details}</span></SummaryTail>
	</SummaryCard>
}

/**
 * Compact launcher card. Missing artwork is not replaced by synthetic imagery.
 * `preview` (optional, caller-rendered real artwork) fills the card as a cover layer
 * under the source gs Tile image gradient (transparent → 30% → 50% black), and the
 * title and tail switch to the source white / white 88% ink.
 */
export function CatalogLaunchCard({ title, description, details, action, preview }: { title: string; description?: string; details: ReactNode; action: ReactNode; preview?: ReactNode }) {
	const covered = preview != null
	return <SummaryCard data-testid="scenario-launch-card" data-preview={covered || undefined} className="relative isolate h-70 min-h-70 max-h-70 transition-colors duration-200 focus-within:ring-2 focus-within:ring-ring">
		{covered ? <CatalogCover preview={preview} /> : null}
		<SummaryHead><SummaryTitle asChild className={covered ? 'text-white' : undefined}><h3>{title}</h3></SummaryTitle></SummaryHead>
		<SummaryTail className={covered ? 'text-white/88' : undefined}>{description ? <p className="m-0">{description}</p> : null}<span>{details}</span></SummaryTail>
		{action}
	</SummaryCard>
}

const MetadataSection = uic('section', { displayName: 'CatalogMetadataSection', baseClass: 'm-0 w-full' })
/** Source metadata layout: full-width identity, paired attributes, wrapping IDs. */
export function CatalogMetadataSummary({ title, ariaLabel, items }: {
	title: string; ariaLabel: string; items: { label: string; value: ReactNode; fullWidth?: boolean }[]
}) {
	let column = 0
	return <MetadataSection aria-label={ariaLabel}>
		<h2 className="mb-3 mt-0 text-heading3 font-medium text-fg">{title}</h2>
		<dl className="m-0 grid w-full grid-cols-1 border-t border-border min-[641px]:grid-cols-2">
			{items.map(item => {
				const second = !item.fullWidth && column % 2 === 1
				column = item.fullWidth ? 0 : column + 1
				return <div key={item.label} className={`flex min-w-0 flex-col gap-1 border-b border-border py-3 ${item.fullWidth ? 'col-span-full' : ''} ${second ? 'min-[641px]:border-l min-[641px]:pl-3' : ''}`}>
					{/* #25: the term of a definition list is meaningful copy — AA `fg-muted`. */}
					<dt className="m-0 text-body font-normal text-fg-muted">{item.label}</dt>
					<dd className="m-0 text-body font-normal text-fg [overflow-wrap:anywhere]">{item.value}</dd>
				</div>
			})}
		</dl>
	</MetadataSection>
}

export const TEMPLATE_REFERENCE_VIEWS = ['preview_grid', 'compact_list'] as const
export type TemplateReferenceView = (typeof TEMPLATE_REFERENCE_VIEWS)[number]
export const TemplateReferenceGrid = uic('div', {
	displayName: 'TemplateReferenceGrid',
	baseClass: 'grid w-full grid-cols-1 gap-3',
	variants: { columns: { 1: 'grid-cols-1', 2: 'min-[761px]:grid-cols-2', 3: 'min-[761px]:grid-cols-3' } },
	defaultVariants: { columns: 1 },
})
export const TemplateReferenceList = uic('div', {
	displayName: 'TemplateReferenceList', baseClass: 'flex w-full flex-col gap-2',
})
const ReferenceButton = uic(AriaButton, {
	displayName: 'TemplateReferenceButton',
	baseClass: 'w-full cursor-pointer border-0 p-0 text-start outline-none disabled:cursor-default data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focus-visible]:ring-offset-2',
	variants: { view: {
		preview_grid: 'flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-surface-card',
		compact_list: 'grid min-h-14 grid-cols-[3rem_minmax(0,1fr)] items-center gap-3 border-b border-border bg-transparent last:border-b-0',
	} },
})
/** Read-only browsing surfaces: activation opens a preview, never selects it. */
export function TemplateReferenceItem({ title, meta, preview, view, isDisabled, onOpen, templateId }: {
	title: string; meta: string; preview: ReactNode; view: TemplateReferenceView
	isDisabled?: boolean; onOpen: () => void; templateId: string
}) {
	return <ReferenceButton type="button" view={view} isDisabled={isDisabled} onPress={onOpen} aria-label={title} data-template-id={templateId}>
		<span aria-hidden="true" className={view === 'compact_list' ? 'flex size-12 items-center justify-center overflow-hidden rounded-sm bg-surface-card [&>div]:w-full' : 'flex h-full w-full items-center justify-center [&>div]:w-full'}>{preview}</span>
		{view === 'compact_list' ? <span className="flex min-w-0 flex-col gap-1"><span className="truncate text-small font-medium text-fg">{title}</span><span className="truncate text-label font-medium text-fg-muted">{meta}</span></span> : null}
	</ReferenceButton>
}

export const TemplateCatalogGrid = uic('div', {
	displayName: 'TemplateCatalogGrid',
	baseClass: 'grid w-full min-w-0 grid-cols-1 items-stretch gap-2 p-0 md:grid-cols-2 md:gap-3 lg:grid-cols-3',
})

const Card = uic(AriaButton, {
	displayName: 'TemplateCatalogCardSurface',
	baseClass: 'group box-border flex h-(--template-catalog-height) min-w-0 w-full cursor-pointer flex-col gap-6 overflow-hidden rounded-lg border-0 p-4 text-start outline-none transition-colors duration-200 motion-reduce:transition-none hover:bg-brand-green hover:text-fg-on-brand data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focus-visible]:ring-offset-2',
	variants: {
		selection: {
			available: 'bg-surface-card text-fg',
			selected: 'bg-brand-green text-fg-on-brand',
		},
	},
	defaultVariants: { selection: 'available' },
})
const Title = uic('span', {
	displayName: 'TemplateCatalogCardTitle',
	baseClass: 'block min-h-5 min-w-0 shrink-0 text-body font-medium leading-5',
})
const Preview = uic('span', {
	displayName: 'TemplateCatalogCardPreview',
	baseClass: 'box-border flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden rounded-md bg-transparent p-3 [&>div]:w-full',
})

const geometry: CSSProperties & { '--template-catalog-height': string } = {
	'--template-catalog-height': 'clamp(calc(var(--spacing) * 64), 30vw, calc(var(--spacing) * 76))',
	letterSpacing: 0,
}

export const TemplateCatalogBrowseGrid = uic('div', {
	displayName: 'TemplateCatalogBrowseGrid',
	baseClass: 'grid w-full min-w-0 grid-cols-1 items-stretch gap-2 p-0 md:grid-cols-2 md:gap-3 lg:grid-cols-4',
})
const BrowseCard = uic('div', {
	displayName: 'TemplateCatalogBrowseSurface',
	baseClass: 'box-border flex h-(--template-catalog-height) min-w-0 w-full cursor-default flex-col gap-6 overflow-hidden rounded-lg border-0 bg-surface-card p-4 text-start text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
})
/** Legacy readOnly catalog: no activation, hover shadow or extra card CTA. */
export function TemplateCatalogBrowseCard({ title, preview, templateId, id, testId }: {
	title: string; preview: ReactNode; templateId: string; id?: string; testId?: string
}) {
	return <BrowseCard role="group" tabIndex={0} aria-label={title} id={id} data-catalog-template-id={templateId} data-testid={testId} style={geometry}>
		<Title>{title}</Title><Preview aria-hidden="true" className="pointer-events-none">{preview}</Preview>
	</BrowseCard>
}

/** Selection-only catalog tile. No badge, selected ring, nested action, or artwork
 * rounding is added. A locked assignment stays focusable and selected, just as in
 * the original catalog; aria-disabled and the press guard prevent its removal.
 * The caller owns selection and supplies a non-interactive, contain-fit preview.
 */
export function TemplateCatalogCard({ title, preview, isSelected = false, isSelectionLocked = false,
	onToggle, onOpen, templateId, testId,
}: {
	title: string
	preview: ReactNode
	isSelected?: boolean
	isSelectionLocked?: boolean
	onToggle?: () => void
	/** Browsing mode opens a preview, without announcing a toggle state. */
	onOpen?: () => void
	templateId?: string
	testId?: string
}) {
	return <Card type="button" selection={isSelected ? 'selected' : 'available'}
		aria-label={title} aria-pressed={onOpen ? undefined : isSelected} aria-disabled={isSelectionLocked}
		data-template-id={templateId} data-testid={testId} style={geometry}
		onPress={() => { if (!isSelectionLocked) { if (onOpen) onOpen(); else onToggle?.() } }}>
		<Title>{title}</Title>
		<Preview aria-hidden="true">{preview}</Preview>
	</Card>
}
