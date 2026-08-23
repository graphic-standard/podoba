import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import type { EditorState } from '@tiptap/pm/state'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { clsx } from 'clsx'
import { SAFE_LINK_HINT, safeLinkUrl } from '../utils/safe-link-url'

/**
 * BlockEditor — a Notion-style block/rich-text editor for podoba, on Tiptap 3
 * (ProseMirror). Opt-in subpath (`@podoba/react/editor`) so the base library stays
 * free of the ProseMirror weight — importing this is what pulls Tiptap into a bundle.
 * The Tiptap packages are OPTIONAL PEERS: install them alongside @podoba/react only
 * if you import this subpath.
 *
 * Serialises to an **HTML string** (controlled `value` / `onChange(html)`), so it is a
 * drop-in upgrade for any `set:html` / `dangerouslySetInnerHTML` renderer with no value
 * migration. SECURITY: like any editor, it can emit arbitrary HTML — sanitise on the
 * SERVER on write; the `value`/`onChange` contract here is presentation only.
 *
 * CONTROLLED-VALUE CONTRACT: echo `onChange`'s HTML back as `value` VERBATIM. The
 * editor only re-seeds its document when `value` differs from what it last emitted, so
 * a parent that normalises/sanitises before echoing would re-seed on every keystroke
 * and send the caret back to the start. Sanitise on write to your store, not in render.
 *
 * Notion features: `/` slash menu (self-contained — insert paragraph/heading/list/
 * to-do/quote/code/divider), an inline bubble toolbar (bold/italic/strike/highlight/
 * code/link), and StarterKit's markdown input rules. Styling rides `@tailwindcss/
 * typography` (`prose`), which @podoba/tailwind already registers, plus design tokens
 * so it flips under `[data-theme="dark"]`.
 *
 * Prefer this over {@link ../components/rich-text-editor RichTextEditor} for
 * document-shaped content; the dependency-free contentEditable one stays the right
 * pick for a short caption/bio field where ProseMirror is not worth installing.
 */
export type BlockEditorProps = {
	/** Controlled HTML value. Must be echoed back verbatim — see the contract above. */
	value: string
	/** Called with the editor's HTML on every change. */
	onChange: (html: string) => void
	/** Empty-document placeholder (also the `/`-hint). */
	placeholder?: string
	/** Optional visible label rendered above the editor; names the editable region. */
	label?: ReactNode
	/** Set false for a read-only render. */
	editable?: boolean
	/** Min height of the editable surface (default 200px). */
	minHeight?: number | string
	/** Class on the outer container. */
	className?: string
	/** Accessible name when there is no visible `label`. */
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

/** Open palette: the doc position of the trigger `/`, the query typed after it, and
 * the highlighted row. Screen position is derived from `from` at paint time, never
 * stored — so the menu can be re-placed on scroll/resize without stale coordinates. */
type SlashState = { from: number; query: string; index: number }

/** Tallest the palette is ever allowed to grow; past this it scrolls. */
const MENU_MAX_H = 288

/** Caret box + palette size + viewport, in viewport coords. */
type PlaceInput = { caretTop: number; caretBottom: number; caretLeft: number; wanted: number; width: number; viewportW: number; viewportH: number }

/**
 * Resolve the palette's fixed position from the caret. Below the caret by default;
 * flipped above only when above is genuinely roomier; height always capped to the
 * room on the chosen side so it scrolls rather than overflowing. Both branches are
 * anchored to the caret, so no result ever needs clamping away from it.
 * Exported for tests.
 */
export function placeSlashMenu({ caretTop, caretBottom, caretLeft, wanted, width, viewportW, viewportH }: PlaceInput): { left: number; top: number; maxHeight: number } {
	const gap = 6
	const edge = 8
	const below = viewportH - edge - (caretBottom + gap)
	const above = caretTop - gap - edge
	// Flip only when it buys room. Flipping on any bottom overflow and clamping the
	// result to `edge` parked the palette at the top of the viewport — over the page
	// header — whenever the caret sat high in a short viewport.
	const flip = wanted > below && above > below
	const maxHeight = Math.max(0, Math.min(wanted, flip ? above : below))
	return {
		left: Math.max(edge, Math.min(caretLeft, viewportW - width - edge)),
		top: flip ? caretTop - gap - maxHeight : caretBottom + gap,
		maxHeight,
	}
}

/** Filter the palette by title or keyword. Exported for tests. */
export function filterCommands(query: string): SlashCommand[] {
	const q = query.trim().toLowerCase()
	if (!q) return [...SLASH_COMMANDS]
	return SLASH_COMMANDS.filter((c) => c.title.toLowerCase().includes(q) || c.keywords.some((k) => k.includes(q)))
}

/** A `/` only opens the palette at the start of a block or after whitespace — never
 * mid-word, so `and/or`, `https://…` and `/api/v2` stay plain text. Code blocks are
 * excluded outright: a `/` there is always literal. Exported for tests. */
export function canOpenSlash(state: EditorState, from: number): boolean {
	if (from < 0 || from > state.doc.content.size) return false
	const $from = state.doc.resolve(from)
	if ($from.parent.type.spec.code) return false
	if ($from.parentOffset === 0) return true
	// textBetween returns '' for a non-text node (inline image, mention) — treat that
	// as a boundary too; only a real word character blocks the trigger.
	return /^\s*$/.test($from.parent.textBetween($from.parentOffset - 1, $from.parentOffset))
}

const btn =
	'inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-small text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg data-[active=true]:bg-surface-muted data-[active=true]:text-fg'

/** Marks the bubble toolbar toggles. `active` keys read off the useEditorState
 * snapshot below — Tiptap 3 does NOT re-render on transactions, so a plain
 * `editor.isActive()` read during render would go stale on selection-only changes. */
const MARK_TOOLS = [
	{ key: 'bold', title: 'Bold', label: <b>B</b>, run: (e: Editor) => e.chain().focus().toggleBold().run() },
	{ key: 'italic', title: 'Italic', label: <i>i</i>, run: (e: Editor) => e.chain().focus().toggleItalic().run() },
	{ key: 'strike', title: 'Strikethrough', label: <s>S</s>, run: (e: Editor) => e.chain().focus().toggleStrike().run() },
	{ key: 'highlight', title: 'Highlight', label: 'H', run: (e: Editor) => e.chain().focus().toggleHighlight().run() },
	{ key: 'code', title: 'Inline code', label: '</>', run: (e: Editor) => e.chain().focus().toggleCode().run() },
] as const

const LinkIcon = () => (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
		<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
		<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
	</svg>
)

export function BlockEditor({ value, onChange, placeholder = "Write, or press '/' for blocks…", label, editable = true, minHeight = 200, className, ...aria }: BlockEditorProps) {
	const onChangeRef = useRef(onChange)
	onChangeRef.current = onChange
	const lastEmitted = useRef<string>(value)
	// The Placeholder extension is configured once at editor creation, so read the
	// current prop through a ref — that keeps `placeholder` live without recreating
	// the whole editor on every change.
	const placeholderRef = useRef(placeholder)
	placeholderRef.current = placeholder

	// Slash state lives in a REF as well as in React state: ProseMirror handlers run
	// synchronously inside the key event, long before React re-renders, so reading a
	// render-assigned ref would lag a full render (two fast `/`s would double-open).
	// `setSlash` writes both, so handlers always see what the last one wrote.
	const slashRef = useRef<SlashState | null>(null)
	const [slash, setSlashState] = useState<SlashState | null>(null)
	const setSlash = useCallback((next: SlashState | null) => {
		slashRef.current = next
		setSlashState(next)
	}, [])

	const [linkOpen, setLinkOpen] = useState(false)
	const linkOpenRef = useRef(false)
	linkOpenRef.current = linkOpen
	const [linkDraft, setLinkDraft] = useState('')
	const [linkError, setLinkError] = useState<string | null>(null)
	const linkInputRef = useRef<HTMLInputElement>(null)

	const menuRef = useRef<HTMLDivElement>(null)
	const [menuPos, setMenuPos] = useState<{ left: number; top: number; maxHeight: number } | null>(null)
	// The palette portals to <body>, so mount first — a portal has no server render.
	const [mounted, setMounted] = useState(false)
	useEffect(() => setMounted(true), [])

	const reactId = useId()
	const labelId = `${reactId}-label`
	const listboxId = `${reactId}-slash`
	const optionId = (i: number) => `${listboxId}-option-${i}`

	// `runSlash` closes over `editor`, which does not exist yet — hand the handlers a
	// ref instead of relying on Tiptap re-applying options after every render.
	const runSlashRef = useRef<(cmd: SlashCommand) => void>(() => {})

	const ariaLabel = aria['aria-label']
	const filtered = useMemo(() => filterCommands(slash?.query ?? ''), [slash?.query])
	const activeOption = slash ? Math.min(slash.index, Math.max(filtered.length - 1, 0)) : 0
	const paletteOpen = slash !== null && filtered.length > 0

	const editor = useEditor({
		editable,
		// Explicit: Tiptap otherwise renders immediately and warns on every SSR pass.
		// A published library cannot assume a client-only host.
		immediatelyRender: false,
		extensions: [
			StarterKit.configure({ heading: { levels: [1, 2, 3] }, link: { openOnClick: false, autolink: true } }),
			Highlight,
			TaskList,
			TaskItem.configure({ nested: true }),
			Placeholder.configure({ placeholder: () => placeholderRef.current }),
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
				// The contenteditable IS the textbox — naming the EditorContent wrapper
				// instead would leave it nameless to assistive tech.
				role: 'textbox',
				'aria-multiline': 'true',
				...(label ? { 'aria-labelledby': labelId } : {}),
				...(ariaLabel ? { 'aria-label': ariaLabel } : {}),
				'aria-expanded': paletteOpen ? 'true' : 'false',
				...(paletteOpen ? { 'aria-controls': listboxId, 'aria-activedescendant': optionId(activeOption) } : {}),
			},
			// The `/` trigger fires on the actual character insert, so it covers every
			// input method (IME, synthetic input, paste of a single char) with one path.
			handleTextInput(view, from, _to, text) {
				if (text !== '/' || slashRef.current) return false
				if (!canOpenSlash(view.state, from)) return false
				setSlash({ from, query: '', index: 0 })
				return false // let the `/` type; onUpdate tracks it as the query prefix
			},
			handleKeyDown(_view, event) {
				const s = slashRef.current
				if (!s) return false
				if (event.key === 'Escape') {
					setSlash(null)
					return true
				}
				const list = filterCommands(s.query)
				// Nothing to pick — close and let the key through. Swallowing Enter and
				// the arrows here is what used to strand the caret after `/api/v2`.
				if (list.length === 0) {
					setSlash(null)
					return false
				}
				if (event.key === 'ArrowDown') {
					setSlash({ ...s, index: (s.index + 1) % list.length })
					return true
				}
				if (event.key === 'ArrowUp') {
					setSlash({ ...s, index: (s.index - 1 + list.length) % list.length })
					return true
				}
				if (event.key === 'Enter' || event.key === 'Tab') {
					runSlashRef.current(list[Math.min(s.index, list.length - 1)])
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
			if (!s) return
			const to = editor.state.selection.from
			if (to < s.from) return setSlash(null)
			const text = editor.state.doc.textBetween(s.from, to, '\n', '\n')
			if (!text.startsWith('/')) return setSlash(null)
			const query = text.slice(1)
			// A block query is one word. Whitespace, or a query that matches nothing,
			// means the user is writing prose — close rather than linger invisibly.
			if (/\s/.test(query) || filterCommands(query).length === 0) return setSlash(null)
			setSlash({ ...s, query, index: 0 })
		},
		// A pure caret move (click, arrow, select-all) fires no update — close the
		// palette when the caret leaves the `/query` it belongs to.
		onSelectionUpdate({ editor }) {
			const s = slashRef.current
			if (!s) return
			const to = editor.state.selection.from
			if (to < s.from || to > s.from + s.query.length + 1) setSlash(null)
		},
		onBlur() {
			setSlash(null)
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

	// Tiptap's own re-render pass re-applies options with `editable` pinned to the
	// live instance value, so the prop has to be pushed through this side channel.
	useEffect(() => {
		if (editor) editor.setEditable(editable)
	}, [editable, editor])

	const runSlash = useCallback(
		(cmd: SlashCommand | undefined) => {
			const s = slashRef.current
			if (!editor || !s || !cmd) return
			// Clamp: the doc can have shrunk under an open palette (an external
			// setContent), which would make deleteRange throw on a stale position.
			const size = editor.state.doc.content.size
			const from = Math.min(Math.max(s.from, 0), size)
			const to = Math.min(Math.max(editor.state.selection.from, from), size)
			editor.chain().focus().deleteRange({ from, to }).run()
			cmd.run(editor)
			setSlash(null)
		},
		[editor, setSlash],
	)
	runSlashRef.current = runSlash

	// Place the palette from the caret's CURRENT viewport coords.
	const placeMenu = useCallback(() => {
		const s = slashRef.current
		const el = menuRef.current
		if (!editor || !s || !el) return
		const size = editor.state.doc.content.size
		if (s.from > size) return setSlash(null)
		const caret = editor.view.coordsAtPos(s.from)
		const next = placeSlashMenu({
			caretTop: caret.top,
			caretBottom: caret.bottom,
			caretLeft: caret.left,
			// Measure the CONTENT, not the box — the box already carries the cap from the
			// last placement, so measuring it would let one tight spot shrink every
			// placement after it. +2 for the 1px border (scrollHeight omits borders).
			wanted: Math.min(MENU_MAX_H, el.scrollHeight + 2),
			width: el.getBoundingClientRect().width,
			viewportW: window.innerWidth,
			viewportH: window.innerHeight,
		})
		setMenuPos((prev) => (prev && prev.left === next.left && prev.top === next.top && prev.maxHeight === next.maxHeight ? prev : next))
	}, [editor, setSlash])

	useLayoutEffect(() => {
		if (slash) placeMenu()
		else setMenuPos(null)
	}, [slash, placeMenu])

	// Fixed coordinates go stale the moment anything scrolls — including a scroll
	// inside the editor itself, hence the capture-phase listener.
	useEffect(() => {
		if (!slash) return
		const replace = () => placeMenu()
		window.addEventListener('scroll', replace, true)
		window.addEventListener('resize', replace)
		return () => {
			window.removeEventListener('scroll', replace, true)
			window.removeEventListener('resize', replace)
		}
	}, [slash, placeMenu])

	// Selection-driven mark states. Tiptap 3's useEditor deliberately does not
	// re-render on transactions; this subscription is what keeps the toolbar honest.
	const active = useEditorState({
		editor,
		selector: ({ editor }) =>
			editor
				? {
						bold: editor.isActive('bold'),
						italic: editor.isActive('italic'),
						strike: editor.isActive('strike'),
						highlight: editor.isActive('highlight'),
						code: editor.isActive('code'),
						link: editor.isActive('link'),
						hasSelection: !editor.state.selection.empty,
					}
				: null,
	})

	const closeLink = useCallback(() => {
		setLinkOpen(false)
		setLinkError(null)
		linkOpenRef.current = false
	}, [])

	// The link panel replaces the toolbar in place; a collapsed selection means the
	// bubble menu is on its way out, so it must not strand an open panel.
	useEffect(() => {
		if (linkOpen && active && !active.hasSelection && !active.link) closeLink()
	}, [linkOpen, active, closeLink])

	useEffect(() => {
		if (linkOpen) linkInputRef.current?.focus()
	}, [linkOpen])

	const openLink = () => {
		if (!editor) return
		setLinkDraft((editor.getAttributes('link').href as string | undefined) ?? '')
		setLinkError(null)
		linkOpenRef.current = true
		setLinkOpen(true)
	}

	const applyLink = () => {
		if (!editor) return
		if (linkDraft.trim() === '') {
			editor.chain().focus().extendMarkRange('link').unsetLink().run()
			closeLink()
			return
		}
		const url = safeLinkUrl(linkDraft)
		if (!url) return setLinkError(SAFE_LINK_HINT)
		editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
		closeLink()
	}

	return (
		<div className={clsx('flex w-full flex-col gap-2', className)}>
			{label ? (
				<span id={labelId} className="text-small font-medium text-fg">
					{label}
				</span>
			) : null}
			<div className="relative rounded-lg border border-border bg-surface focus-within:border-brand-green">
				{editor ? (
					<BubbleMenu
						editor={editor}
						// Mirrors Tiptap's default (focus + non-empty selection), plus: stay up
						// while the link panel owns focus, or typing a URL would dismiss itself.
						shouldShow={({ editor, view, state, element }) => {
							const inMenu = element.contains(document.activeElement)
							if (!editor.isEditable || !(view.hasFocus() || inMenu)) return false
							return linkOpenRef.current || !state.selection.empty
						}}
						className="flex flex-col gap-1 rounded-lg border border-border bg-surface-card p-1 shadow-md"
					>
						{linkOpen ? (
							<>
								<div className="flex items-center gap-1">
									<input
										ref={linkInputRef}
										type="text"
										value={linkDraft}
										aria-label="Link URL"
										aria-invalid={linkError ? true : undefined}
										placeholder="https://, mailto:, /path"
										className="h-8 w-56 rounded-md border border-border bg-surface px-2 text-small text-fg outline-none placeholder:text-fg-muted focus:border-brand-green"
										onChange={(e) => {
											setLinkDraft(e.target.value)
											setLinkError(null)
										}}
										onKeyDown={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault()
												applyLink()
											}
											if (e.key === 'Escape') {
												e.preventDefault()
												closeLink()
												editor.chain().focus().run()
											}
										}}
									/>
									<button type="button" className={btn} onMouseDown={(e) => e.preventDefault()} onClick={applyLink} title="Apply link">
										Apply
									</button>
									<button
										type="button"
										className={btn}
										onMouseDown={(e) => e.preventDefault()}
										onClick={() => {
											closeLink()
											editor.chain().focus().run()
										}}
										title="Cancel"
									>
										Cancel
									</button>
								</div>
								{linkError ? <span className="px-1 pb-0.5 text-caption text-danger">{linkError}</span> : null}
							</>
						) : (
							<div className="flex items-center gap-0.5">
								{MARK_TOOLS.map((tool) => (
									// preventDefault on mousedown keeps the editor selection while the button is clicked.
									<button
										key={tool.key}
										type="button"
										className={btn}
										data-active={active?.[tool.key] ?? false}
										aria-pressed={active?.[tool.key] ?? false}
										onMouseDown={(e) => e.preventDefault()}
										onClick={() => tool.run(editor)}
										title={tool.title}
									>
										{tool.label}
									</button>
								))}
								<button type="button" className={btn} data-active={active?.link ?? false} aria-pressed={active?.link ?? false} onMouseDown={(e) => e.preventDefault()} onClick={openLink} title="Link">
									<LinkIcon />
								</button>
							</div>
						)}
					</BubbleMenu>
				) : null}

				<EditorContent editor={editor} />

				{mounted && paletteOpen && slash
					? createPortal(
							<div
								ref={menuRef}
								id={listboxId}
								role="listbox"
								aria-label="Insert block"
								className="fixed z-50 w-64 overflow-auto rounded-lg border border-border bg-surface-card p-1 shadow-md"
								style={{
									left: menuPos?.left ?? 0,
									top: menuPos?.top ?? 0,
									// The cap is placement-derived (room on the chosen side), so it lives here
									// rather than in a max-h-* class — MENU_MAX_H is the ceiling it clamps to.
									maxHeight: menuPos?.maxHeight ?? MENU_MAX_H,
									visibility: menuPos ? 'visible' : 'hidden',
								}}
							>
								{filtered.map((cmd, i) => (
									// role=option must sit on a plain element — a <button> would override it.
									// Focus stays in the editor; aria-activedescendant on the textbox drives AT.
									<div
										key={cmd.title}
										id={optionId(i)}
										role="option"
										aria-selected={i === activeOption}
										className={clsx('flex w-full cursor-pointer flex-col items-start rounded-md px-3 py-1.5 text-left', i === activeOption ? 'bg-surface-muted' : 'hover:bg-surface-muted')}
										onMouseDown={(e) => e.preventDefault()}
										onClick={() => runSlash(cmd)}
									>
										<span className="text-small text-fg">{cmd.title}</span>
										<span className="text-caption text-fg-muted">{cmd.hint}</span>
									</div>
								))}
							</div>,
							document.body,
						)
					: null}
			</div>
		</div>
	)
}
