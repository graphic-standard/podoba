import { createContext, useContext, useEffect, useId, useState, type ComponentProps, type CSSProperties, type ReactNode, type RefObject } from 'react'
import { Button } from './button'
import { Button as AriaButton, Disclosure as AriaDisclosure, DisclosurePanel as AriaDisclosurePanel } from 'react-aria-components'
import { ModalDialog, ModalOverlay, ModalSurface } from './dialog'
import { DisplayHeading, Heading } from './text'
import { uic } from '../utils/uic'

export const SETTINGS_DIALOG_VARIANTS = ['create', 'edit', 'catalog', 'csv', 'basic'] as const
export type SettingsDialogVariant = (typeof SETTINGS_DIALOG_VARIANTS)[number]

const LayoutContext = createContext({ variant: 'edit' as SettingsDialogVariant, compact: false })
const Panel = uic(ModalSurface, { displayName: 'SettingsDialogPanel', baseClass: 'box-border flex flex-col overflow-hidden p-0' })
const Layout = uic(ModalDialog, { displayName: 'SettingsDialogLayout', baseClass: 'relative flex min-h-0 flex-1 flex-col outline-none' })
const Container = uic('div', { displayName: 'SettingsDialogContainer', baseClass: 'box-border mx-auto w-full' })
const ScrollBody = uic('div', { displayName: 'SettingsDialogScrollBody', baseClass: 'min-h-0 flex-1 overflow-y-auto' })
const Body = uic('div', { displayName: 'SettingsDialogBody', baseClass: 'flex w-full flex-col' })
const Group = uic('div', { displayName: 'SettingsDialogGroup', baseClass: 'flex min-w-0 flex-col' })
const Columns = uic('div', { displayName: 'SettingsDialogColumns', baseClass: 'grid' })

/** Label-driven settings/catalog envelope. State, requests and selections belong to callers.
 * Widths use the viewport-sized, unpadded overlay; rem caps use the shared spacing scale.
 * Create and edit deliberately have different geometry, including below the 900px breakpoint.
 */
export function SettingsDialogSurface({ variant, isOpen, onOpenChange, isPending = false,
	label, title, closeLabel, children, footer, filters, bodyRef, bodyTestId, description, describedBy, isWide = false, headerBottomPadding = false,
}: {
	variant: SettingsDialogVariant
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	isPending?: boolean
	label?: string
	title: ReactNode
	description?: ReactNode
	/** IDs of caller-owned concise descriptions, e.g. a dynamic calendar hint. */
	describedBy?: string
	/** CSV switches from an upload frame to a wide data preview without remounting. */
	isWide?: boolean
	/** Adds the source Basic Information title-to-body separation without changing other basic dialogs. */
	headerBottomPadding?: boolean
	closeLabel: string
	children: ReactNode
	footer: ReactNode
	filters?: ReactNode
	bodyRef?: RefObject<HTMLDivElement | null>
	bodyTestId?: string
}) {
	const titleId = useId()
	const descriptionId = useId()
	const [compact, setCompact] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches)
	useEffect(() => {
		const media = window.matchMedia('(max-width: 900px)')
		const change = () => setCompact(media.matches)
		change()
		media.addEventListener('change', change)
		return () => media.removeEventListener('change', change)
	}, [])
	const create = variant === 'create'
	const catalog = variant === 'catalog'
	const csv = variant === 'csv'
	const basic = variant === 'basic'
	const containerClass = csv && isWide ? compact ? 'px-5' : 'px-6' : catalog ? '' : compact
		? create ? 'px-(--settings-dialog-gutter-inline)' : 'px-5'
		: create ? 'max-w-200 px-(--settings-dialog-gutter-inline)' : 'max-w-192 px-6'
	// Source uses spacing8 × .6 (spacing6 × .6 on narrow screens). Tailwind's
	// numeric spacing utilities do not emit .8/.6 steps, so derive a named value
	// from the shared spacing token rather than silently emitting no padding.
	const layoutStyle: CSSProperties & { '--settings-dialog-gutter-inline': string } = {
		letterSpacing: 0,
		'--settings-dialog-gutter-inline': compact ? 'calc(var(--spacing) * 3.6)' : 'calc(var(--spacing) * 4.8)',
	}
	const panelClass = compact
		? catalog || (csv && isWide) ? 'h-23/25 w-24/25' : 'h-23/25 w-47/50'
		: catalog ? 'h-9/10 max-h-324 w-9/10 max-w-432'
		: csv && isWide ? 'h-9/10 max-h-264 w-9/10 max-w-432'
		: create ? 'h-9/10 max-h-288 w-1/2 max-w-288' : 'h-9/10 max-h-264 w-9/10 max-w-204'
	const layoutClass = catalog ? compact ? 'gap-3 p-4' : 'gap-4 p-6'
		: csv || basic ? compact ? 'gap-8 py-6' : 'gap-10 py-10'
		: create ? compact ? 'gap-4 py-7.5' : 'gap-5 py-10'
		: compact ? 'py-6' : 'py-10'
	const bodyClass = catalog ? '' : basic ? 'gap-8' : create ? compact ? 'gap-4' : 'gap-5' : compact ? 'gap-8' : 'gap-10'
	return <LayoutContext.Provider value={{ variant, compact }}>
		<ModalOverlay className="p-0" isOpen={isOpen} onOpenChange={open => { if (!isPending) onOpenChange(open) }} isDismissable={!isPending} isKeyboardDismissDisabled={isPending}>
			<Panel className={panelClass} data-settings-variant={variant} data-settings-compact={compact}>
				<Layout aria-label={label} aria-labelledby={label ? undefined : titleId} aria-describedby={[description ? descriptionId : undefined, describedBy].filter(Boolean).join(' ') || undefined} className={layoutClass} style={layoutStyle}>
					<Button variant="ghost" aria-label={closeLabel} isDisabled={isPending} onPress={() => onOpenChange(false)} className="absolute end-4 top-3.5 z-10 h-8 w-8 rounded-md p-0 text-fg-subtle">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
					</Button>
					<header className={catalog ? 'flex shrink-0 flex-col gap-2' : basic ? headerBottomPadding ? 'shrink-0 pb-4' : 'shrink-0' : create || csv ? 'shrink-0 pb-4' : 'shrink-0 pb-10 max-md:pb-8'}>
						<Container className={containerClass}>
							{catalog ? <Heading id={titleId} level="1" className="m-0 mb-4 max-w-5/6 whitespace-pre-line" style={{ letterSpacing: 0 }}>{title}</Heading>
								: <DisplayHeading id={titleId} className={`m-0 whitespace-pre-line pb-0.5 text-fg-subtle ${create ? 'mb-4 max-w-5/6' : ''}`} style={{ letterSpacing: 0, ...(basic ? { maxWidth: '18ch' } : csv && isWide ? { maxWidth: '34ch' } : {}) }}>{title}</DisplayHeading>}
							{description ? <p id={descriptionId} className="mb-0 mt-3 text-small font-normal text-fg-workflow-muted" style={{ maxWidth: '48ch' }}>{description}</p> : null}
						</Container>
						{filters ? <div className="w-full max-w-80">{filters}</div> : null}
					</header>
					<ScrollBody style={{ scrollbarGutter: 'stable' }}>
						<Container className={containerClass}>
							<Body ref={bodyRef} className={bodyClass} data-testid={bodyTestId}>{children}</Body>
						</Container>
					</ScrollBody>
					<footer className={catalog ? 'shrink-0 border-t border-border bg-surface pt-3' : create ? 'shrink-0 border-t border-border bg-surface pt-4' : 'shrink-0 border-t border-border bg-surface pt-5'}>
						<Container className={containerClass}>
							<div className={`flex justify-end ${csv || basic ? 'items-center gap-1' : variant === 'edit' ? 'gap-3' : 'gap-2'}`}>{footer}</div>
						</Container>
					</footer>
				</Layout>
			</Panel>
		</ModalOverlay>
	</LayoutContext.Provider>
}

/** Multi-step form/catalog envelope. Switching width preserves mounted drafts. */
export const WizardForm = uic('form', { displayName: 'WizardForm', baseClass: 'flex flex-col gap-8' })
const BriefText = uic('p', { displayName: 'WizardBriefText', baseClass: 'm-0 min-h-32 rounded-lg bg-surface-card p-4 text-small text-fg-workflow-muted' })
export function WizardBrief({ label, children }: { label: ReactNode; children: ReactNode }) {
	const id = useId()
	return <Group className="gap-2" role="group" aria-labelledby={id}><SettingsDialogLabel id={id}>{label}</SettingsDialogLabel><BriefText>{children}</BriefText></Group>
}

export function WizardFormDialog({ isOpen, onOpenChange, isPending = false, isExpanded = false, title, closeLabel, children, footer }: {
	isOpen: boolean; onOpenChange: (open: boolean) => void; isPending?: boolean; isExpanded?: boolean
	title: ReactNode; closeLabel: string; children: ReactNode; footer: ReactNode
}) {
	const titleId = useId()
	return <ModalOverlay className="p-0" isOpen={isOpen} onOpenChange={open => { if (!isPending) onOpenChange(open) }} isDismissable={!isPending} isKeyboardDismissDisabled={isPending}>
		<Panel data-wizard-expanded={isExpanded} className={`h-23/25 max-h-23/25 w-24/25 max-w-24/25 min-[901px]:h-9/10 min-[901px]:max-h-288 min-[901px]:w-9/10 ${isExpanded ? 'min-[901px]:max-w-432' : 'min-[901px]:max-w-204'}`}>
			<Layout aria-labelledby={titleId} className="gap-8 py-6 min-[901px]:gap-10 min-[901px]:py-10">
				<Button variant="ghost" aria-label={closeLabel} isDisabled={isPending} onPress={() => onOpenChange(false)} className="absolute end-4 top-3.5 z-10 h-8 w-8 rounded-md p-0 text-fg-subtle">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
				</Button>
				<header className="shrink-0"><Container className="max-w-384 px-5 min-[901px]:px-6"><DisplayHeading id={titleId} className="m-0 whitespace-pre-line pb-0.5 text-fg-subtle" style={{ letterSpacing: 0 }}>{title}</DisplayHeading></Container></header>
				<ScrollBody style={{ scrollbarGutter: 'stable' }}><Container className="max-w-384 px-5 min-[901px]:px-6"><Body className="gap-8">{children}</Body></Container></ScrollBody>
				<footer className="shrink-0 border-t border-border bg-surface pt-5"><Container className="max-w-384 px-5 min-[901px]:px-6"><div className="flex flex-wrap justify-end gap-2">{footer}</div></Container></footer>
			</Layout>
		</Panel>
	</ModalOverlay>
}

export function SettingsDialogIdentity({ children }: { children: ReactNode }) {
	const { variant } = useContext(LayoutContext)
	return <Group className={variant === 'create' ? 'gap-4 border-b border-border pb-3' : 'gap-8'}>{children}</Group>
}
export function SettingsDialogDescription({ children }: { children: ReactNode }) {
	const { variant } = useContext(LayoutContext)
	return <Group className={variant === 'create' ? 'mt-2' : variant === 'basic' ? 'gap-1' : undefined}>{children}</Group>
}
export function SettingsDialogColumns({ children, metadata = false }: { children: ReactNode; metadata?: boolean }) {
	const { variant, compact } = useContext(LayoutContext)
	if (metadata) return <Columns className={`${compact ? 'grid-cols-1' : 'grid-cols-3'} gap-3`}>{children}</Columns>
	return <Columns className={`${compact ? 'grid-cols-1' : 'grid-cols-2'} ${variant === 'create' ? compact ? 'gap-3' : 'gap-4' : 'gap-8'}`}>{children}</Columns>
}
export function SettingsDialogGroup({ children }: { children: ReactNode }) {
	const { variant } = useContext(LayoutContext)
	return <Group className={variant === 'create' ? 'gap-3 border-b border-border pb-3' : undefined}>{children}</Group>
}

/** Two-column production metadata grid from the split settings family.
 * Independent of SettingsDialogSurface's 900px breakpoint; this source uses1100px.
 */
export function SettingsDialogProductionColumns({ children }: { children: ReactNode }) {
	const [compact, setCompact] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 1100px)').matches)
	useEffect(() => {
		const media = window.matchMedia('(max-width: 1100px)')
		const change = () => setCompact(media.matches)
		change()
		media.addEventListener('change', change)
		return () => media.removeEventListener('change', change)
	}, [])
	return <Columns data-settings-production-columns className={`${compact ? 'grid-cols-1' : 'grid-cols-2'} min-w-0 gap-4`}>{children}</Columns>
}
export function SettingsDialogControl({ children }: { children: ReactNode }) {
	const { variant } = useContext(LayoutContext)
	return <Group className={variant === 'edit' ? 'mt-6' : undefined}>{children}</Group>
}
export const SettingsDialogLabel = uic('p', { displayName: 'SettingsDialogLabel', baseClass: 'm-0 text-panel-heading font-medium text-fg' })
export const SettingsDialogEmphasis = uic('span', { displayName: 'SettingsDialogEmphasis', baseClass: 'text-fg' })
const Hint = uic('p', { displayName: 'SettingsDialogHint', baseClass: 'm-0 text-small font-normal text-fg-workflow-muted' })
export function SettingsDialogHint({ style, ...props }: ComponentProps<typeof Hint>) {
	const { variant } = useContext(LayoutContext)
	return <Hint {...props} style={{ ...(variant === 'basic' ? { maxWidth: '48ch' } : {}), ...style }} />
}
export const SettingsDialogAction = uic(Button, { displayName: 'SettingsDialogAction', baseClass: 'h-11.5 rounded-full px-6 text-base font-medium leading-5', style: { letterSpacing: 0 } })

const ProductionLayout = uic(ModalDialog, { displayName: 'ProductionSettingsLayout', baseClass: 'relative grid h-full min-h-0 w-full overflow-hidden outline-none' })
const ProductionHeader = uic('header', { displayName: 'ProductionSettingsHeader', baseClass: 'flex shrink-0 flex-col items-start gap-4 px-8 pb-6 pt-8' })
const ProductionTitle = uic('h1', { displayName: 'ProductionSettingsTitle', baseClass: 'm-0 max-w-132 text-display-large font-medium text-fg-muted', style: { letterSpacing: '-0.02em' } })
const ProductionDescription = uic('p', { displayName: 'ProductionSettingsDescription', baseClass: 'm-0 max-w-132 text-body font-normal text-fg' })
const ProductionFields = uic('div', { displayName: 'ProductionSettingsFields', baseClass: 'flex min-h-0 flex-col gap-6 px-8 pb-8' })
const ProductionFooter = uic('footer', { displayName: 'ProductionSettingsFooter', baseClass: 'relative z-10 flex shrink-0 flex-wrap items-center gap-2 bg-surface px-8 pb-8 pt-4' })
const ProductionPreview = uic('aside', { displayName: 'ProductionSettingsPreview', baseClass: 'relative grid min-h-0 min-w-0 place-items-center overflow-hidden p-10', style: { background: 'radial-gradient(circle at 50% 42%, color-mix(in srgb, var(--color-surface) 8%, transparent) 0, transparent 42%), color-mix(in srgb, var(--color-fg) 84%, var(--color-surface))' } })
const ProductionArtwork = uic('div', { displayName: 'ProductionSettingsArtwork', baseClass: 'min-h-0 min-w-0 overflow-hidden', style: { width: '80%', height: '80%' } })
export const ProductionSettingsAction = uic(Button, { displayName: 'ProductionSettingsAction', baseClass: 'min-h-10 rounded-full px-6 text-body font-medium' })

/** Wide production settings, not the content editor's independently tuned split. */
export function ProductionSettingsDialog({ isOpen, onOpenChange, prefix, title, description, closeLabel, children, preview, footer, testId = 'production-settings' }: {
	isOpen: boolean; onOpenChange: (open: boolean) => void; prefix: ReactNode; title: ReactNode; description: ReactNode; closeLabel: string
	children: ReactNode; preview: ReactNode; footer: ReactNode; testId?: string
}) {
	const titleId = useId(), descriptionId = useId()
	const query = '(max-width: 1100px), (orientation: portrait)'
	const [compact, setCompact] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
	useEffect(() => {
		const media = window.matchMedia(query), change = () => setCompact(media.matches)
		change(); media.addEventListener('change', change)
		return () => media.removeEventListener('change', change)
	}, [])
	return <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange} isDismissable className="p-0">
		<Panel style={{ width: compact ? '96vw' : 'min(90vw, 110rem)', maxWidth: compact ? '96vw' : 'min(90vw, 110rem)', height: compact ? '92vh' : 'min(82vh, 63.125rem)', maxHeight: compact ? '92vh' : 'min(82vh, 63.125rem)' }}>
			<ProductionLayout aria-labelledby={titleId} aria-describedby={descriptionId} data-testid={testId} data-production-compact={compact} style={{ gridTemplateColumns: compact ? 'minmax(0,1fr)' : 'minmax(calc(var(--spacing) * 90),2fr) minmax(0,4fr)', gridTemplateRows: compact ? 'minmax(18rem,44%) minmax(0,1fr)' : 'minmax(0,1fr)' }}>
				<section className={`flex min-h-0 min-w-0 flex-col bg-surface ${compact ? 'row-start-2 overflow-y-auto' : 'overflow-hidden'}`} aria-labelledby={titleId}>
					<ProductionHeader><ProductionTitle id={titleId}>{prefix}{' '}<span className="text-fg">{title}</span></ProductionTitle><ProductionDescription id={descriptionId}>{description}</ProductionDescription></ProductionHeader>
					<ProductionFields data-testid={`${testId}-form`} className={compact ? 'shrink-0' : 'flex-1 overflow-y-auto'} style={{ scrollbarGutter: 'stable' }}>{children}</ProductionFields>
					<ProductionFooter>{footer}</ProductionFooter>
				</section>
				<ProductionPreview className={compact ? 'col-start-1 row-start-1' : undefined} data-testid={`${testId}-preview`}><ProductionArtwork data-testid={`${testId}-artwork`}>{preview}</ProductionArtwork></ProductionPreview>
				<Button variant="ghost" aria-label={closeLabel} onPress={() => onOpenChange(false)} className="absolute right-4 top-4 z-20 h-8 w-8 rounded-md p-0 text-white/60 hover:bg-transparent hover:text-white"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></Button>
			</ProductionLayout>
		</Panel>
	</ModalOverlay>
}

const DisclosureRoot = uic(AriaDisclosure, { displayName: 'SettingsDisclosureRoot', baseClass: 'group/settings-disclosure flex min-w-0 flex-col gap-3' })
const DisclosureTrigger = uic(AriaButton, { displayName: 'SettingsDisclosureTrigger', baseClass: 'flex w-full cursor-pointer items-start justify-between gap-3 bg-transparent p-0 text-left outline-none data-[focus-visible]:outline-2 data-[focus-visible]:outline-ring data-[focus-visible]:outline-offset-2' })
const DisclosureCopy = uic('span', { displayName: 'SettingsDisclosureCopy', baseClass: 'flex min-w-0 flex-col gap-1' })
const DisclosureTitle = uic('strong', { displayName: 'SettingsDisclosureTitle', baseClass: 'text-body font-medium leading-normal text-fg' })
const DisclosureHint = uic('span', { displayName: 'SettingsDisclosureHint', baseClass: 'text-body font-normal leading-normal text-fg-workflow-muted' })
const DisclosureBody = uic(AriaDisclosurePanel, { displayName: 'SettingsDisclosureBody', baseClass: 'flex min-w-0 flex-col gap-5 pt-3' })

/** Source outputTaskDropdownPanel: labelled, initially expanded settings group. */
export function SettingsDialogDisclosure({ title, description, children, defaultExpanded = true }: {
	title: ReactNode; description?: ReactNode; children: ReactNode; defaultExpanded?: boolean
}) {
	return <DisclosureRoot defaultExpanded={defaultExpanded}>
		<DisclosureTrigger slot="trigger">
			<DisclosureCopy><DisclosureTitle>{title}</DisclosureTitle>{description ? <DisclosureHint>{description}</DisclosureHint> : null}</DisclosureCopy>
			<svg aria-hidden="true" width="15" height="15" viewBox="0 0 15 15" fill="none" className="mt-1 shrink-0 text-fg-workflow-muted transition-transform duration-150 group-data-[expanded]/settings-disclosure:rotate-180 motion-reduce:transition-none"><path d="m3.5 5.5 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
		</DisclosureTrigger>
		<DisclosureBody>{children}</DisclosureBody>
	</DisclosureRoot>
}
