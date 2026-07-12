import type { ReactElement } from 'react'
import {
	Button as RACButton,
	Text,
	UNSTABLE_Toast as RACToast,
	UNSTABLE_ToastContent as RACToastContent,
	UNSTABLE_ToastQueue as RACToastQueue,
	UNSTABLE_ToastRegion as RACToastRegion,
	type ToastOptions,
} from 'react-aria-components'

/**
 * Toast — transient notification, ported 1:1 from gs-platform's `Toast` designer
 * component (`packages/ui/src/components/ui/Toast.{tsx,module.scss}`).
 *
 * RAC version note: `react-aria-components@1.18` ships the (still UNSTABLE) Toast
 * API — `UNSTABLE_ToastQueue` + `UNSTABLE_ToastRegion`/`Toast`/`ToastContent`. We
 * build on it (rather than rolling a custom queue) so we inherit RAC's a11y for
 * free: a single off-screen `aria-live` announcer, keyboard focus management
 * (F6 / arrow nav into the region), hover/focus auto-pause of the dismiss timer,
 * and a focusable close control (`<Button slot="close">`).
 *
 * gs SCSS → our tokens (Tailwind + `@app/tokens` CSS vars, no SCSS — hard rule #3):
 *   - `--color-background-secondary` (#f7f6f2) → `bg-surface-card`
 *   - `1px solid --color-border`     (#eceae1) → `border border-border`
 *   - `--radius-lg` (8px)                      → `rounded-lg`
 *   - `--shadow-lg`                            → `shadow-lg`
 *   - `--spacing-4` (16px) padding            → `p-md`
 *   - `--spacing-2` (8px) gap between toasts  → `gap-sm`
 *   - title  heading-5 / weight-medium / text-primary  → `text-heading5 font-medium text-fg`
 *   - desc   base / text-secondary                     → `text-body text-fg-muted`
 *   - close  24px / radius-md / text-tertiary→primary  → `h-6 w-6 rounded-md text-fg-subtle hover:text-fg`
 *   - viewport `--z-index-tooltip` (1070), width 390px → `z-[1070] w-[390px]`
 * Entrance: gs `slideIn` 300ms cubic-bezier(.16,1,.3,1) translateX(100%)→0 — kept
 * via an injected `@keyframes gsToastSlideIn` (one-shot on mount; RAC toasts have
 * no `data-entering` hook, so we animate on render rather than via a state attr).
 *
 * Variant is our additive extension (gs's base toast is neutral): `success` /
 * `error` tint a leading status dot; `default` shows none. The card stays neutral.
 */

export type ToastVariant = 'default' | 'success' | 'error'

/** The payload carried by each queued toast. */
export interface ToastContent {
	/** Primary line — required. Announced to screen readers via RAC's live region. */
	title: string
	/** Optional secondary line, rendered muted under the title. */
	description?: string
	/** Visual status accent (leading dot). Default = neutral. */
	variant?: ToastVariant
}

// Module-level queue: the single source of truth. Mount exactly one <ToastRegion>
// (typically at the app root); call `toast.add(...)` from anywhere. `maxVisibleToasts`
// caps the stack — overflow is queued and shown as visible slots free up.
export const toastQueue = new RACToastQueue<ToastContent>({ maxVisibleToasts: 5 })

const DEFAULT_TIMEOUT = 5000

/**
 * Imperative toast API. `add` returns the toast key (pass to `toastQueue.close`).
 * `success` / `error` are thin convenience wrappers that preset the variant.
 */
export const toast = {
	add(content: ToastContent, options?: ToastOptions): string {
		return toastQueue.add(content, { timeout: DEFAULT_TIMEOUT, ...options })
	},
	success(title: string, description?: string, options?: ToastOptions): string {
		return toastQueue.add(
			{ title, description, variant: 'success' },
			{ timeout: DEFAULT_TIMEOUT, ...options },
		)
	},
	error(title: string, description?: string, options?: ToastOptions): string {
		return toastQueue.add(
			{ title, description, variant: 'error' },
			{ timeout: DEFAULT_TIMEOUT, ...options },
		)
	},
}

/** Hook form for components that prefer a hook over the module singleton. */
export const useToast = () => toast

const DOT_CLASS: Record<ToastVariant, string | null> = {
	default: null,
	success: 'bg-success',
	error: 'bg-danger',
}

const CloseIcon = () => (
	<svg
		width="14"
		height="14"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		aria-hidden="true"
	>
		<path d="M6 6l12 12M18 6 6 18" />
	</svg>
)

export interface ToastRegionProps {
	/** Accessible label for the toast landmark region. Defaults to "Notifications". */
	'aria-label'?: string
	/** Accessible label for each toast's close control. Defaults to "Close". */
	closeLabel?: string
}

/**
 * ToastRegion — the fixed bottom-right viewport that renders the live queue.
 * Mount once near the app root. Subscribes to `toastQueue` and renders each toast.
 */
export const ToastRegion = ({
	'aria-label': ariaLabel = 'Notifications',
	closeLabel = 'Close',
}: ToastRegionProps): ReactElement => (
	<>
		{/* Injected once: the gs `slideIn` keyframe. Scoped name avoids collisions; a
		    duplicate identical @keyframes (if two regions mount) is harmless. */}
		<style>{KEYFRAMES}</style>
		<RACToastRegion
			queue={toastQueue}
			aria-label={ariaLabel}
			className="fixed bottom-0 right-0 z-[1070] m-0 flex w-[390px] max-w-[100vw] list-none flex-col gap-sm p-md outline-none"
		>
			{({ toast: t }) => {
				const variant = t.content.variant ?? 'default'
				const dot = DOT_CLASS[variant]
				return (
					<RACToast
						toast={t}
						style={{
							animation: 'gsToastSlideIn 300ms cubic-bezier(0.16, 1, 0.3, 1)',
							willChange: 'transform, opacity',
						}}
						className="relative flex items-start gap-sm rounded-lg border border-border bg-surface-card p-md shadow-lg outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring"
					>
						{dot ? (
							<span
								aria-hidden="true"
								className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`}
							/>
						) : null}
						<RACToastContent className="flex min-w-0 flex-1 flex-col gap-1">
							<Text slot="title" className="text-heading5 font-medium text-fg">
								{t.content.title}
							</Text>
							{t.content.description ? (
								<Text slot="description" className="text-body text-fg-muted">
									{t.content.description}
								</Text>
							) : null}
						</RACToastContent>
						<RACButton
							slot="close"
							aria-label={closeLabel}
							className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-fg-subtle outline-none transition-colors hover:bg-surface-muted hover:text-fg data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring"
						>
							<CloseIcon />
						</RACButton>
					</RACToast>
				)
			}}
		</RACToastRegion>
	</>
)

// gs `slideIn`: translateX(100% + viewport padding) → 0, opacity in.
const KEYFRAMES = `@keyframes gsToastSlideIn {
	from { transform: translateX(calc(100% + 16px)); opacity: 0; }
	to { transform: translateX(0); opacity: 1; }
}`
