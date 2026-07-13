import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from 'react'
import { createPortal } from 'react-dom'
import { clsx } from 'clsx'

/**
 * FocusFields + FocusField — immersive "full-screen" field editing.
 *
 * Ported from gs-platform's FormWithPreview overlay pattern. Wrap a form in
 * `<FocusFields>`; each `<FocusField>` renders as a compact card (icon · label ·
 * value preview). Clicking one enters focus mode: the rest of the form blurs and
 * dims, and the field's editor (`children`) takes over the form area at a large
 * size. Esc or a click on the backdrop closes it.
 *
 * Generic by design — `children` is any editor (an input, textarea, select…). The
 * card owns the label, so pass a *label-less* control as children. Text controls
 * are auto-enlarged and stripped to a bare headline look in the overlay.
 */

type FocusCtx = {
	activeId: string | null
	activate: (id: string) => void
	close: () => void
	host: HTMLElement | null
}

const FocusFieldsContext = createContext<FocusCtx | null>(null)

function useFocusFields(): FocusCtx {
	const ctx = useContext(FocusFieldsContext)
	if (!ctx) throw new Error('<FocusField> must be rendered inside <FocusFields>')
	return ctx
}

export function FocusFields({ children, className }: { children: ReactNode; className?: string }) {
	const [activeId, setActiveId] = useState<string | null>(null)
	const [host, setHost] = useState<HTMLDivElement | null>(null)
	const close = useCallback(() => setActiveId(null), [])
	const activate = useCallback((id: string) => setActiveId(id), [])

	useEffect(() => {
		if (!activeId) return
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') close()
		}
		document.addEventListener('keydown', onKey)
		return () => document.removeEventListener('keydown', onKey)
	}, [activeId, close])

	const ctx = useMemo<FocusCtx>(() => ({ activeId, activate, close, host }), [activeId, activate, close, host])

	return (
		<FocusFieldsContext.Provider value={ctx}>
			<div className={clsx('relative', className)}>
				<div
					className={clsx(
						'transition-[filter,opacity] duration-200',
						activeId && 'pointer-events-none select-none opacity-40 blur-[3px]',
					)}
					aria-hidden={activeId ? true : undefined}
				>
					{children}
				</div>
				{activeId ? (
					// Backdrop over the form; the portalled editor sits at the top and
					// stops propagation so only clicks outside it close focus mode.
					<div className="absolute inset-0 z-20 overflow-auto" onClick={close}>
						<div ref={setHost} className="p-1" onClick={(e) => e.stopPropagation()} />
					</div>
				) : null}
			</div>
		</FocusFieldsContext.Provider>
	)
}

// In the overlay, enlarge and de-chrome text controls into a bare headline editor.
const OVERLAY_EDITOR =
	'[&_input]:w-full [&_input]:border-0 [&_input]:bg-transparent [&_input]:p-0 [&_input]:text-3xl [&_input]:font-medium [&_input]:text-fg [&_input]:outline-none [&_input]:shadow-none [&_input]:ring-0 [&_input]:placeholder:text-fg-subtle ' +
	'[&_textarea]:min-h-40 [&_textarea]:w-full [&_textarea]:resize-none [&_textarea]:border-0 [&_textarea]:bg-transparent [&_textarea]:p-0 [&_textarea]:text-3xl [&_textarea]:font-medium [&_textarea]:text-fg [&_textarea]:outline-none [&_textarea]:placeholder:text-fg-subtle'

function IconBadge({ icon }: { icon: ReactNode }) {
	return (
		<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-muted text-sm font-medium text-fg">
			{icon}
		</div>
	)
}

export type FocusFieldProps = {
	/** Field label (shown on the card and above the overlay editor). */
	label: ReactNode
	/** Optional leading icon (e.g. a "T" for text). */
	icon?: ReactNode
	/** Current value shown on the collapsed card. */
	preview?: ReactNode
	/** Shown on the card when there's no value. */
	placeholder?: ReactNode
	/** The editor, shown large in the overlay when focused. Pass a label-less control. */
	children: ReactNode
	className?: string
}

export function FocusField({ label, icon, preview, placeholder, children, className }: FocusFieldProps) {
	const ctx = useFocusFields()
	const id = useId()
	const active = ctx.activeId === id
	const contentRef = useRef<HTMLDivElement>(null)

	// Move focus into the editor once it's mounted (the portal host appears a
	// render after activation, so wait for ctx.host before focusing).
	useEffect(() => {
		if (!active || !ctx.host) return
		const el = contentRef.current?.querySelector<HTMLElement>('input, textarea, [contenteditable="true"]')
		el?.focus()
	}, [active, ctx.host])

	const hasValue = preview !== undefined && preview !== null && preview !== ''

	return (
		<>
			<div
				role="button"
				tabIndex={0}
				aria-label={typeof label === 'string' ? label : undefined}
				onClick={() => ctx.activate(id)}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault()
						ctx.activate(id)
					}
				}}
				className={clsx(
					'flex w-full cursor-text items-start gap-3 rounded-lg p-3 text-left outline-none transition-colors',
					'hover:bg-surface-card focus-visible:ring-2 focus-visible:ring-ring',
					className,
				)}
			>
				{icon ? <IconBadge icon={icon} /> : null}
				<div className="min-w-0 flex-1">
					<div className="text-sm text-fg-muted">{label}</div>
					<div className="mt-1 truncate text-base text-fg">
						{hasValue ? preview : <span className="text-fg-subtle">{placeholder}</span>}
					</div>
				</div>
			</div>
			{active && ctx.host
				? createPortal(
						// Solid white panel so the large text sits on white, not the blurred form.
						<div ref={contentRef} className="w-full rounded-xl bg-surface p-6 shadow-lg">
							<div className="mb-4 flex items-start justify-between gap-3">
								<div className="flex items-center gap-3">
									{icon ? <IconBadge icon={icon} /> : null}
									<div className="text-sm text-fg-muted">{label}</div>
								</div>
								<button
									type="button"
									onClick={ctx.close}
									aria-label="Close"
									className="-mr-1 -mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-fg-subtle outline-none transition-colors hover:bg-surface-muted hover:text-fg focus-visible:ring-2 focus-visible:ring-ring"
								>
									<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
										<path d="M6 6l12 12M18 6 6 18" />
									</svg>
								</button>
							</div>
							<div className={OVERLAY_EDITOR}>{children}</div>
						</div>,
						ctx.host,
					)
				: null}
		</>
	)
}
