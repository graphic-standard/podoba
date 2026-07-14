import { type ClipboardEvent as ReactClipboardEvent, type ReactNode, useEffect, useRef } from 'react'
import { clsx } from 'clsx'
import { useInFocusOverlay } from './focus-context'

/**
 * RichTextEditor — a dependency-free contentEditable WYSIWYG that emits an HTML
 * string (round-trips with any `set:html` / `dangerouslySetInnerHTML` renderer,
 * so no value migration and no bundled ProseMirror). Ported from pramen's
 * cms-editor `RichText`; TipTap is the upgrade path if tables/embeds are needed.
 *
 * The `prose prose-sm` body relies on the @tailwindcss/typography plugin, which
 * @podoba/tailwind's preset already registers.
 *
 * SECURITY: `scrubHtml` here is cosmetic paste/load cleaning, NOT an XSS boundary
 * — an editor can POST any HTML straight to a server. Sanitise rich-text values
 * on the SERVER on write. This just keeps obviously-unwanted markup out of the DOM.
 */

const RT_TOOLS: Array<{ label: string; title: string; run: (exec: (c: string, a?: string) => void) => void }> = [
	{ label: 'B', title: 'Bold', run: (x) => x('bold') },
	{ label: 'I', title: 'Italic', run: (x) => x('italic') },
	{ label: 'H2', title: 'Heading', run: (x) => x('formatBlock', 'H2') },
	{ label: 'H3', title: 'Subheading', run: (x) => x('formatBlock', 'H3') },
	{ label: '¶', title: 'Paragraph', run: (x) => x('formatBlock', 'P') },
	{ label: '• List', title: 'Bulleted list', run: (x) => x('insertUnorderedList') },
	{ label: '1. List', title: 'Numbered list', run: (x) => x('insertOrderedList') },
	{
		label: 'Link',
		title: 'Add link',
		run: (x) => {
			const raw = window.prompt('Link URL (https://, mailto:, /path)', 'https://')
			if (!raw) return
			const url = safeLinkUrl(raw)
			if (!url) {
				window.alert('Only http(s), mailto, tel, or relative (/, #) links are allowed.')
				return
			}
			x('createLink', url)
		},
	},
	{ label: 'Unlink', title: 'Remove link', run: (x) => x('unlink') },
	{ label: 'Clear', title: 'Clear formatting', run: (x) => x('removeFormat') },
]

/** Allow-list for a link href: http(s), mailto, tel, or a relative/anchor path.
 * The prefix allow-list inherently rejects `javascript:`/`data:`/`vbscript:`. */
function safeLinkUrl(raw: string): string | null {
	const url = raw.trim()
	return /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(url) ? url : null
}

/** Cosmetic scrub (NOT a security boundary — sanitise on the server). */
function scrubHtml(html: string): string {
	return html
		.replace(/<\s*(script|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
		.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
		.replace(/(href|src)\s*=\s*("javascript:[^"]*"|'javascript:[^']*')/gi, '$1="#"')
}

export type RichTextEditorProps = {
	/** Current HTML value (controlled). */
	value: string
	/** Fired with the scrubbed HTML on every edit. */
	onChange: (html: string) => void
	label?: ReactNode
	description?: ReactNode
	errorMessage?: string
	/** Placeholder shown while the body is empty. */
	placeholder?: string
	/** Minimum body height in px (default 180). */
	minHeight?: number
	isInvalid?: boolean
	className?: string
}

export function RichTextEditor({
	value,
	onChange,
	label,
	description,
	errorMessage,
	placeholder = 'Write…',
	minHeight = 180,
	isInvalid,
	className,
}: RichTextEditorProps) {
	const ref = useRef<HTMLDivElement>(null)
	const last = useRef<string>('')
	// In a focus overlay, give the body more room to write in.
	const inFocus = useInFocusOverlay()
	const bodyMinHeight = inFocus ? Math.max(minHeight, 360) : minHeight

	// Sync only EXTERNAL value changes into the DOM — never on our own keystrokes,
	// or the caret would jump to the start on every character.
	useEffect(() => {
		const el = ref.current
		if (el && value !== last.current) {
			el.innerHTML = scrubHtml(value || '')
			last.current = value || ''
		}
	}, [value])

	const emit = () => {
		const html = scrubHtml(ref.current?.innerHTML ?? '')
		last.current = html
		onChange(html)
	}
	const exec = (command: string, arg?: string) => {
		ref.current?.focus()
		document.execCommand(command, false, arg)
		emit()
	}
	// Paste as plain text — avoids importing Word/Docs style-junk into the HTML.
	const onPaste = (e: ReactClipboardEvent<HTMLDivElement>) => {
		e.preventDefault()
		document.execCommand('insertText', false, e.clipboardData.getData('text/plain'))
	}

	return (
		<div className={clsx('flex flex-col gap-2', className)}>
			{label ? <span className="text-heading5 font-medium text-fg">{label}</span> : null}
			<div
				className={clsx(
					'overflow-hidden rounded-lg border bg-surface transition-colors',
					'focus-within:ring-2 focus-within:ring-ring',
					isInvalid
						? 'border-danger focus-within:border-danger focus-within:ring-danger'
						: 'border-border focus-within:border-brand-green',
				)}
			>
				<div className="flex flex-wrap gap-0.5 border-b border-border bg-surface-muted px-2 py-1.5">
					{RT_TOOLS.map((t) => (
						// preventDefault on mousedown keeps the editor selection while the button is clicked.
						<button
							key={t.label}
							type="button"
							title={t.title}
							onMouseDown={(e) => e.preventDefault()}
							onClick={() => t.run(exec)}
							className="rounded border-0 bg-transparent px-2.5 py-0.5 text-xs text-fg-muted transition-colors hover:bg-surface hover:text-fg"
						>
							{t.label}
						</button>
					))}
				</div>
				<div
					ref={ref}
					className="prose prose-sm max-w-none px-4 py-3.5 text-sm leading-relaxed text-fg outline-none empty:before:text-fg-subtle empty:before:content-[attr(data-placeholder)]"
					style={{ minHeight: bodyMinHeight }}
					contentEditable
					suppressContentEditableWarning
					data-placeholder={placeholder}
					onInput={emit}
					onBlur={emit}
					onPaste={onPaste}
				/>
			</div>
			{description ? <span className="text-xs text-fg-muted">{description}</span> : null}
			{isInvalid && errorMessage ? <span className="text-xs text-danger">{errorMessage}</span> : null}
		</div>
	)
}
