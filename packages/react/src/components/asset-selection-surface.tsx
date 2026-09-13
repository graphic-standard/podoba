import { useEffect, useId, useRef, useState, type ReactNode, type RefObject, type MouseEventHandler } from 'react'
import { Button } from './button'
import { Button as AriaButton } from 'react-aria-components'
import { ModalDialog, ModalOverlay, ModalSurface } from './dialog'
import { DisplayHeading } from './text'
import { uic } from '../utils/uic'
import { assetMasonryColumns, assetMasonryPositions } from './asset-masonry-grid'

const Body = uic('div', {
	displayName: 'AssetSelectionBody',
	baseClass: 'min-h-0 flex-1 overflow-y-auto',
})

const BrowsableAsset = uic('div', {
	displayName: 'BrowsableAsset',
	baseClass: 'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
})

type AssetMenuEvent = Pick<React.MouseEvent, 'preventDefault' | 'stopPropagation' | 'clientX' | 'clientY'> & {
	currentTarget?: EventTarget | null
}

export interface AssetSelectionSurfaceProps {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	isPending?: boolean
	closeLabel: string
	title: ReactNode
	filters?: ReactNode
	children: ReactNode
	footer: ReactNode
	error?: ReactNode
	overlays?: ReactNode
	bodyRef?: RefObject<HTMLDivElement | null>
	onContextMenuCapture?: MouseEventHandler<HTMLDivElement>
}

/** Linked-assets/storage envelope. Domain state and attachment stay in the app. */
export function AssetSelectionSurface({
	isOpen, onOpenChange, isPending = false, closeLabel, title, filters,
	children, footer, error, overlays, bodyRef, onContextMenuCapture,
}: AssetSelectionSurfaceProps) {
	const titleId = useId()
	const [compact, setCompact] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches)
	useEffect(() => {
		const media = window.matchMedia('(max-width: 900px)')
		const change = () => setCompact(media.matches)
		change()
		media.addEventListener('change', change)
		return () => media.removeEventListener('change', change)
	}, [])
	const close = () => { if (!isPending) onOpenChange(false) }
	return (
		<ModalOverlay className="p-0" isOpen={isOpen} onOpenChange={open => { if (!isPending) onOpenChange(open) }} isDismissable={!isPending} isKeyboardDismissDisabled={isPending}>
			<ModalSurface className={`flex max-h-324 max-w-432 flex-col overflow-hidden p-0 ${compact ? 'h-23/25 w-24/25' : 'h-9/10 w-9/10'}`}>
				<ModalDialog aria-labelledby={titleId} style={{ letterSpacing: 0 }} className={`relative flex min-h-0 flex-1 flex-col gap-8 outline-none ${compact ? 'px-5 py-6' : 'px-6 py-10'}`} onContextMenuCapture={onContextMenuCapture} onContextMenu={event => event.stopPropagation()}>
					<header className="flex shrink-0 flex-col gap-3">
						<DisplayHeading id={titleId} className="mb-4 pb-0.5" style={{ maxWidth: '28ch', letterSpacing: 0 }}>{title}</DisplayHeading>
						<Button variant="ghost" aria-label={closeLabel} isDisabled={isPending} onPress={close} className="absolute end-4 top-3.5 h-8 w-8 rounded-md p-0 text-fg-subtle">
							<svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" /></svg>
						</Button>
						{filters ? <div className="max-w-full pt-1">{filters}</div> : null}
					</header>
					<Body ref={bodyRef} style={{ scrollbarGutter: 'stable' }}>{children}</Body>
					{error ? <div role="alert" className="shrink-0 rounded-md border border-danger bg-danger/10 px-4 py-3 text-small text-danger">{error}</div> : null}
					<footer className="flex shrink-0 justify-end gap-2 pt-3 [&>button]:text-body [&>button]:leading-5 [&>button]:font-medium">{footer}</footer>
					{overlays}
				</ModalDialog>
			</ModalSurface>
		</ModalOverlay>
	)
}

export function AssetSelectionEmpty({ title, description, variant = 'selection' }: { title: string; description?: string; variant?: 'selection' | 'library' }) {
	if (variant === 'library') return <div role="status" className="px-8 py-16 text-center text-fg-muted">
		<p className="my-2">{title}</p>
		{description ? <p className="my-2 text-small">{description}</p> : null}
	</div>
	return <div role="status" className="flex min-h-96 flex-col items-center justify-center text-center text-fg-muted">
		<p className="m-0 text-panel-heading font-medium text-fg">{title}</p>
		{description ? <p className="mt-1 text-small" style={{ maxWidth: '32ch' }}>{description}</p> : null}
	</div>
}

/** Library preview: source accent selection and hover-only curated tags. */
export function AssetLibraryPreview({ label, selected, aspectRatio, tags, onPress, children }: {
	label: string; selected: boolean; aspectRatio: number; tags: string[]
	onPress: () => void; children: ReactNode
}) {
	return <AriaButton aria-label={label} aria-pressed={selected} onPress={onPress}
		style={{ aspectRatio }}
		className={`group relative block min-h-[150px] max-h-[800px] w-full overflow-hidden rounded-none border p-0 transition-transform duration-200 ease-[ease] hover:-translate-y-0.5 hover:shadow-xs hover:border-[#aba89c] active:translate-y-0 focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-2 motion-reduce:transition-none ${selected ? 'border-accent-blue bg-accent-blue/10' : 'border-border bg-surface-card'}`}>
		{children}
		{tags.length ? <span data-testid="asset-card-overlay" className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-1 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 transition-opacity duration-250 ease-[ease] group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
			{tags.slice(0, 3).map(tag => <span key={tag} className="ms-3 inline-flex h-6 items-center rounded-full bg-surface-muted px-2.5 text-label font-medium leading-5 text-(--color-neutral-600)">{tag}</span>)}
			{tags.length > 3 ? <span className="text-label font-medium text-white/90">+{tags.length - 3}</span> : null}
		</span> : null}
	</AriaButton>
}

export function AssetSelectionFilters({ items, onChange, disabled = false, autoFocus = false }: {
	items: { id: string; label: string; selected: boolean }[]
	onChange: (id: string) => void
	disabled?: boolean; autoFocus?: boolean
}) {
	return <div role="group" className="mb-4 flex min-h-9 w-full flex-wrap content-start items-center gap-2 lg:w-2/3">
		{items.map((item, index) => <Button key={item.id} autoFocus={autoFocus && index === 0} variant="ghost" isDisabled={disabled} aria-pressed={item.selected}
			onPress={() => onChange(item.id)} className={`h-7 rounded-sm px-nav-x py-1.5 text-compact font-normal ${item.selected ? 'bg-surface-muted text-fg' : 'text-fg-muted'}`}>{item.label}</Button>)}
	</div>
}

export interface AssetSelectionGridItem {
	id: string
	label: string
	tags: string[]
	width?: number
	height?: number
	preview: ReactNode
}

/** Source masonry geometry: responsive columns, shortest-column placement, 12px gaps. */
export function AssetSelectionGrid({ items, selectedId, onSelect, onContextMenu }: {
	items: AssetSelectionGridItem[]
	selectedId: string | null
	onSelect?: (id: string) => void
	onContextMenu: (id: string, event: AssetMenuEvent) => void
}) {
	const container = useRef<HTMLDivElement>(null)
	const [width, setWidth] = useState(0)
	useEffect(() => {
		const element = container.current
		if (!element) return
		const measure = () => setWidth(element.clientWidth)
		measure()
		const observer = new ResizeObserver(measure)
		observer.observe(element)
		return () => observer.disconnect()
	}, [])
	// Shared with AssetMasonryGrid rather than restated: the two had already drifted.
	// Only the HEIGHT rule is local — this grid gets explicit width/height per item
	// (square fallback when either is missing), the other derives from aspectRatio.
	const columns = assetMasonryColumns(width)
	const columnWidth = columns.width
	const heights = items.map(item =>
		item.width && item.height
			? Math.min(800, Math.max(150, columnWidth * item.height / item.width))
			: columnWidth,
	)
	const layout = assetMasonryPositions(heights, columns.count, columns.gap)
	const positioned = items.map((item, index) => ({
		item,
		top: layout.positions[index]?.top ?? 0,
		left: (layout.positions[index]?.column ?? 0) * (columnWidth + columns.gap),
		height: heights[index] ?? columnWidth,
	}))
	return <div ref={container} className="relative w-full" style={{ height: layout.height }}>
		{positioned.map(({ item, top, left, height }) => {
			const className = `group relative block h-full w-full overflow-hidden rounded-lg border bg-surface-card p-0 transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transition-none ${onSelect ? 'hover:shadow-xs hover:border-border-muted' : ''} ${selectedId === item.id ? 'border-accent-blue' : 'border-border'}`
			const contents = <>{item.preview}
				{item.tags.length ? <span className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-1 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 transition-opacity duration-250 ease-[ease] group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
					{item.tags.slice(0, 3).map(tag => <span key={tag} className="ms-3 inline-flex h-6 items-center rounded-full bg-surface-muted px-2.5 text-label font-medium leading-5 text-(--color-neutral-600)">{tag}</span>)}
					{item.tags.length > 3 ? <span className="text-label font-medium text-white/90">+{item.tags.length - 3}</span> : null}
				</span> : null}
			</>
			return <div key={item.id} data-cloud-asset-id={item.id}
			onContextMenu={event => onContextMenu(item.id, event)} className="absolute" style={{ top, insetInlineStart: left, width: columnWidth, height }}>
			<AssetCardKeyboard onContextMenu={event => onContextMenu(item.id, event)}>
				{onSelect ? <Button variant="ghost" aria-label={item.label} aria-pressed={selectedId === item.id}
					onPress={() => onSelect(item.id)} className={className}>{contents}</Button>
					: <BrowsableAsset role="img" aria-label={item.label} tabIndex={0} aria-haspopup="menu" className={className}>{contents}</BrowsableAsset>}
			</AssetCardKeyboard>
		</div>})}
	</div>
}

/** Browsing is not selection. Keep keyboard access to the same context actions. */
function AssetCardKeyboard({ children, onContextMenu }: { children: ReactNode; onContextMenu: (event: AssetMenuEvent) => void }) {
	return <div className="h-full w-full" onKeyDown={event => { if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
					const rect = event.currentTarget.getBoundingClientRect()
					event.preventDefault()
					event.stopPropagation()
					onContextMenu({ preventDefault: () => event.preventDefault(), stopPropagation: () => event.stopPropagation(), clientX: rect.left + 16, clientY: rect.top + 16, currentTarget: event.currentTarget })
				} }}>{children}</div>
}
