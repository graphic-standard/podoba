/// <reference types="bun" />

import { describe, expect, test } from 'bun:test'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

/**
 * #25 regression guard — `fg-subtle` must never carry meaning.
 *
 * `--color-fg-subtle` (#b3b3b3) measures 2.10:1 on `surface` and 1.94:1 on
 * `surface-card`: below WCAG 2.1 AA normal text (4.5:1), below large text (3:1),
 * and below the 3:1 floor for UI component parts. It is ORNAMENTAL ONLY.
 * Meaningful copy takes `fg-muted`; a dark panel takes `fg-inverted/60`; a fixed
 * brand fill takes `fg-on-brand/70` (see `Subtle`'s tones).
 *
 * The token contrast pairs live in @podoba/tokens `contrast.test.ts`. That harness
 * cannot see WHICH RUN OF TEXT a class lands on, so this one guards usage instead:
 * every `text-fg-subtle` in the component source is enumerated below with the
 * reason it is allowed. Adding one anywhere fails this test until it is justified
 * here — which is the point. Twice now a port has quietly put copy on this token
 * (a page-header breadcrumb, then a settings-dialog title), and neither `tsc` nor
 * a render test noticed.
 *
 * Comment lines are ignored — prose explaining the rule is not a use of it.
 */
const ALLOWED: Record<string, { count: number; why: string }> = {
	// The token's own definition: these two components EXPOSE `fg-subtle` as an
	// opt-in `decorative` variant. They are the sanctioned way to reach it.
	'components/subtle.tsx': { count: 1, why: 'the `decorative` tone itself' },
	'components/text.tsx': { count: 1, why: 'the `decorative` tone itself' },

	// Icon-only controls: a glyph with an `aria-label`, no text. These sit below
	// the 3:1 non-text floor and are a LIBRARY-WIDE convention predating the
	// Manager port — tracked separately rather than half-fixed here.
	'components/asset-selection-surface.tsx': { count: 1, why: 'close glyph' },
	'components/compact-settings-dialog.tsx': { count: 1, why: 'close glyph' },
	'components/delivery/send-to-print-modal.tsx': { count: 1, why: 'close glyph' },
	'components/dialog.tsx': { count: 1, why: 'close glyph' },
	'components/focus-field.tsx': { count: 1, why: 'close glyph' },
	'components/search-field.tsx': { count: 2, why: 'search + clear glyphs' },
	'components/settings-dialog-surface.tsx': { count: 2, why: 'close glyph, both surfaces' },
	'components/side-panel.tsx': { count: 1, why: 'close glyph' },
	'components/tag-group.tsx': { count: 1, why: 'tag remove glyph' },
	'components/toast.tsx': { count: 1, why: 'close glyph' },

	// WCAG 1.4.3 exempts inactive controls from contrast entirely.
	'components/compact-action-button.tsx': { count: 1, why: 'disabled-state ink' },
}

const SRC = new URL('..', import.meta.url).pathname

function sourceFiles(dir: string): string[] {
	return readdirSync(dir).flatMap((entry) => {
		const full = join(dir, entry)
		if (statSync(full).isDirectory()) return sourceFiles(full)
		if (!/\.tsx?$/.test(entry) || entry.includes('.test.')) return []
		return [full]
	})
}

function usesOf(file: string): number {
	return readFileSync(file, 'utf8')
		.split('\n')
		.filter((line) => {
			if (!line.includes('text-fg-subtle')) return false
			const trimmed = line.trim()
			// Prose about the rule is not a use of it.
			return !trimmed.startsWith('//') && !trimmed.startsWith('*') && !trimmed.startsWith('/*')
		}).length
}

describe('fg-subtle is ornamental only (#25)', () => {
	const found: Record<string, number> = {}
	for (const file of sourceFiles(SRC)) {
		const count = usesOf(file)
		if (count > 0) found[relative(SRC, file)] = count
	}

	test('every use is enumerated and justified', () => {
		const expected = Object.fromEntries(
			Object.entries(ALLOWED).map(([file, { count }]) => [file, count]),
		)
		expect(found).toEqual(expected)
	})

	test('no run of copy is styled with it', () => {
		// A line that sets a TYPE SCALE is styling text, not a glyph. None of the
		// allowlisted icon controls do; every violation found so far did.
		const scale = /text-(micro|caption|label|compact|small|body|callout|headline|panel-heading|heading[1-5]|display|display-large)\b/
		const offenders: string[] = []
		for (const file of sourceFiles(SRC)) {
			for (const line of readFileSync(file, 'utf8').split('\n')) {
				const trimmed = line.trim()
				if (!trimmed.includes('text-fg-subtle')) continue
				if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue
				// The `decorative` variants pair the token WITH a scale by design.
				if (/^decorative:/.test(trimmed)) continue
				if (scale.test(trimmed)) offenders.push(`${relative(SRC, file)}: ${trimmed.slice(0, 90)}`)
			}
		}
		expect(offenders).toEqual([])
	})
})
