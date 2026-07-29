import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { clsx } from 'clsx'

/**
 * BlockEditor — a Notion-style block/rich-text editor for podoba, on Tiptap 3
 * (ProseMirror). Opt-in subpath (`@podoba/react/editor`) so the base library stays
 * free of the ProseMirror weight — importing this is what pulls Tiptap into a bundle.
 *
 * Serialises to an **HTML string** (controlled `value` / `onChange(html)`), so it is a
 * drop-in upgrade for any `set:html` / `dangerouslySetInnerHTML` renderer with no value
 * migration. SECURITY: like any editor, it can emit arbitrary HTML — sanitise on the
 * SERVER on write; the `value`/`onChange` contract here is presentation only.
 *
 * Notion features: `/` slash menu (self-contained — insert paragraph/heading/list/
 * to-do/quote/code/divider), an inline bubble toolbar (bold/italic/strike/highlight/
 * code/link), and StarterKit's markdown input rules. Styling rides `@tailwindcss/
 * typography` (`prose`), which @podoba/tailwind already registers, plus design tokens
 * so it flips under `[data-theme="dark"]`.
 */
export type BlockEditorProps = {
	/** Controlled HTML value. */
	value: string
	/** Called with the editor's HTML on every change. */
	onChange: (html: string) => void
	/** Empty-document placeholder (also the `/`-hint). */
	placeholder?: string
	/** Optional visible label rendered above the editor. */
	label?: ReactNode
	/** Set false for a read-only render. */
	editable?: boolean
	/** Min height of the editable surface (default 200px). */
	minHeight?: number | string
	/** Class on the outer container. */
	className?: string
	'aria-label'?: string
}

type SlashCommand = {
	title: string
	hint: string
	keywords: string[]
	run: (editor: Editor) => void
}

// The `/` block palette. Kept generic (no domain blocks) — a CMS/app composes richer
// block types around this at the document level; this is the text-block vocabulary.
const SLASH_COMMANDS: readonly SlashCommand[] = [
	{ title: 'Text', hint: 'Plain paragraph', keywords: ['text', 'paragraph', 'body', 'p'], run: (e) => e.chain().focus().setParagraph().run() },
	{ title: 'Heading 1', hint: 'Big section heading', keywords: ['h1', 'heading', 'title'], run: (e) => e.chain().focus().toggleHeading({ level: 1 }).run() },
	{ title: 'Heading 2', hint: 'Medium heading', keywords: ['h2', 'subheading'], run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run() },
	{ title: 'Heading 3', hint: 'Small heading', keywords: ['h3'], run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run() },
	{ title: 'Bulleted list', hint: 'Unordered list', keywords: ['bullet', 'unordered', 'ul', 'list'], run: (e) => e.chain().focus().toggleBulletList().run() },
	{ title: 'Numbered list', hint: 'Ordered list', keywords: ['numbered', 'ordered', 'ol', 'list'], run: (e) => e.chain().focus().toggleOrderedList().run() },
	{ title: 'To-do list', hint: 'Checklist', keywords: ['todo', 'task', 'checkbox', 'check'], run: (e) => e.chain().focus().toggleTaskList().run() },
	{ title: 'Quote', hint: 'Block quote', keywords: ['quote', 'blockquote', 'citation'], run: (e) => e.chain().focus().toggleBlockquote().run() },
	{ title: 'Code', hint: 'Code block', keywords: ['code', 'snippet', 'pre'], run: (e) => e.chain().focus().toggleCodeBlock().run() },
	{ title: 'Divider', hint: 'Horizontal rule', keywords: ['divider', 'rule', 'hr', 'separator'], run: (e) => e.chain().focus().setHorizontalRule().run() },
]

type SlashState = { from: number; query: string; x: number; y: number; index: number }

function safeLinkUrl(raw: string): string | null {
	const url = raw.trim()
	return /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(url) ? url : null
}

const btn =
	'inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-small text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg data-[active=true]:bg-surface-muted data-[active=true]:text-fg'

export function BlockEditor({ value, onChange, placeholder = "Write, or press '/' for blocks…", label, editable = true, minHeight = 200, className, ...aria }: BlockEditorProps) {
	const onChangeRef = useRef(onChange)
	onChangeRef.current = onChange
	const lastEmitted = useRef<string>(value)
	const [slash, setSlash] = useState<SlashState | null>(null)
	const slashRef = useRef<SlashState | null>(null)
	slashRef.current = slash

	const editor = useEditor({
		editable,
		extensions: [
			StarterKit.configure({ heading: { levels: [1, 2, 3] }, link: { openOnClick: false, autolink: true } }),
			Highlight,
			TaskList,
			TaskItem.configure({ nested: true }),
			Placeholder.configure({ placeholder }),
		],
		content: value || '',
		editorProps: {
			attributes: {
				class: clsx(
					'prose prose-sm max-w-none px-4 py-3 text-fg outline-none',
					'prose-headings:text-fg prose-p:text-fg prose-strong:text-fg prose-a:text-accent-strong',
					'prose-code:text-fg prose-blockquote:text-fg-muted prose-li:text-fg',
				),
				style: `min-height:${typeof minHeight === 'number' ? `${minHeight}px` : minHeight}`,
			},
			// Primary `/` trigger — fires on the actual character insert (covers every input
			// method, incl. IME and synthetic input). `from` is the position of the `/`.
			handleTextInput(view, from, _to, text) {
				if (text !== '/' || slashRef.current) return false
				const coords = view.coordsAtPos(from)
				setSlash({ from, query: '', x: coords.left, y: coords.bottom + 6, index: 0 })
				return false // let the `/` type; onUpdate tracks it as the query prefix
			},
			handleKeyDown(view, event) {
				const s = slashRef.current
				// Fallback `/` trigger for layouts/IME paths that skip handleTextInput.
				if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey && !s) {
					const from = view.state.selection.from
					const coords = view.coordsAtPos(from)
					requestAnimationFrame(() => setSlash({ from, query: '', x: coords.left, y: coords.bottom + 6, index: 0 }))
					return false
				}
				if (!s) return false
				// Palette navigation.
				const list = filterCommands(s.query)
				if (event.key === 'Escape') {
					setSlash(null)
					return true
				}
				if (event.key === 'ArrowDown') {
					setSlash({ ...s, index: (s.index + 1) % Math.max(list.length, 1) })
					return true
				}
				if (event.key === 'ArrowUp') {
					setSlash({ ...s, index: (s.index - 1 + Math.max(list.length, 1)) % Math.max(list.length, 1) })
					return true
				}
				if (event.key === 'Enter') {
					const cmd = list[s.index]
					if (cmd) runSlash(cmd)
					return true
				}
				return false
			},
		},
		onUpdate({ editor }) {
			const html = editor.getHTML()
			lastEmitted.current = html
			onChangeRef.current(html)
			// Track the `/query` the caret is typing after an open palette.
			const s = slashRef.current
			if (s) {
				const to = editor.state.selection.from
				if (to < s.from) return setSlash(null)
				const text = editor.state.doc.textBetween(s.from, to, '\n', '\n')
				if (!text.startsWith('/')) return setSlash(null)
				setSlash({ ...s, query: text.slice(1), index: 0 })
			}
		},
	})

	// Push EXTERNAL value changes into the editor (switching records, resets) without
	// clobbering the caret on our own keystrokes.
	useEffect(() => {
		if (!editor) return
		if (value !== lastEmitted.current && value !== editor.getHTML()) {
			editor.commands.setContent(value || '', { emitUpdate: false })
			lastEmitted.current = value
		}
	}, [value, editor])

	useEffect(() => {
		if (editor) editor.setEditable(editable)
	}, [editable, editor])

	const runSlash = (cmd: SlashCommand) => {
		const s = slashRef.current
		if (!editor || !s) return
		const to = editor.state.selection.from
		// Delete the `/query` text, then run the block command.
		editor.chain().focus().deleteRange({ from: s.from, to }).run()
		cmd.run(editor)
		setSlash(null)
	}

	const filtered = useMemo(() => filterCommands(slash?.query ?? ''), [slash?.query])

	return (
		<div className={clsx('flex w-full flex-col gap-2', className)}>
			{label ? <span className="text-small font-medium text-fg">{label}</span> : null}
			<div className="relative rounded-lg border border-border bg-surface focus-within:border-brand-green">
				{editor ? (
					<BubbleMenu editor={editor} className="flex items-center gap-0.5 rounded-lg border border-border bg-surface-card p-1 shadow-md">
						<button type="button" className={btn} data-active={editor.isActive('bold')} onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
							<b>B</b>
						</button>
						<button type="button" className={btn} data-active={editor.isActive('italic')} onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
							<i>i</i>
						</button>
						<button type="button" className={btn} data-active={editor.isActive('strike')} onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
							<s>S</s>
						</button>
						<button type="button" className={btn} data-active={editor.isActive('highlight')} onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleHighlight().run()} title="Highlight">
							H
						</button>
						<button type="button" className={btn} data-active={editor.isActive('code')} onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleCode().run()} title="Inline code">
							{'</>'}
						</button>
						<button
							type="button"
							className={btn}
							data-active={editor.isActive('link')}
							onMouseDown={(e) => e.preventDefault()}
							onClick={() => {
								const prev = editor.getAttributes('link').href as string | undefined
								const raw = window.prompt('Link URL (https://, mailto:, /path)', prev ?? 'https://')
								if (raw === null) return
								if (raw === '') return void editor.chain().focus().unsetLink().run()
								const url = safeLinkUrl(raw)
								if (!url) return window.alert('Only http(s), mailto, tel, or relative (/, #) links are allowed.')
								editor.chain().focus().setLink({ href: url }).run()
							}}
							title="Link"
						>
							🔗
						</button>
					</BubbleMenu>
				) : null}

				<EditorContent editor={editor} aria-label={aria['aria-label']} />

				{slash && filtered.length > 0 ? (
					<div className="fixed z-50 max-h-72 w-64 overflow-auto rounded-lg border border-border bg-surface-card p-1 shadow-md" style={{ left: slash.x, top: slash.y }} role="listbox">
						{filtered.map((cmd, i) => (
							<button
								key={cmd.title}
								type="button"
								role="option"
								aria-selected={i === slash.index}
								className={clsx('flex w-full flex-col items-start rounded-md px-3 py-1.5 text-left', i === slash.index ? 'bg-surface-muted' : 'hover:bg-surface-muted')}
								onMouseDown={(e) => e.preventDefault()}
								onClick={() => runSlash(cmd)}
							>
								<span className="text-small text-fg">{cmd.title}</span>
								<span className="text-caption text-fg-subtle">{cmd.hint}</span>
							</button>
						))}
					</div>
				) : null}
			</div>
		</div>
	)
}

function filterCommands(query: string): SlashCommand[] {
	const q = query.trim().toLowerCase()
	if (!q) return [...SLASH_COMMANDS]
	return SLASH_COMMANDS.filter((c) => c.title.toLowerCase().includes(q) || c.keywords.some((k) => k.includes(q)))
}
