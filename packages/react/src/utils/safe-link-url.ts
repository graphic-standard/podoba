/** Allow-list for a link href: http(s), mailto, tel, or a relative/anchor path.
 * The prefix allow-list inherently rejects `javascript:`/`data:`/`vbscript:`.
 *
 * Shared by every editor surface that takes a user-typed URL (RichTextEditor's
 * toolbar, BlockEditor's link panel) so the allow-list can never drift between them.
 * This is a UI guard, NOT the security boundary — sanitise HTML on the SERVER on write. */
export function safeLinkUrl(raw: string): string | null {
	const url = raw.trim()
	return /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(url) ? url : null
}

/** The message shown when {@link safeLinkUrl} rejects an input. */
export const SAFE_LINK_HINT = 'Only http(s), mailto, tel, or relative (/, #) links are allowed.'
