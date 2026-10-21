import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { InlineAlert } from './inline-alert'

describe('InlineAlert', () => {
	test('announces errors and preserves the GS warning glyph and style', () => {
		const html = renderToStaticMarkup(<InlineAlert>Download failed</InlineAlert>)
		expect(html).toContain('role="alert"')
		expect(html).toContain('Download failed')
		expect(html).toContain('aria-hidden="true"')
		expect(html).toContain('text-caption')
		expect(html).toContain('text-danger')
		expect(html).toContain('M12 9v4')
	})
	test('supports a polite duplicate notice and footer placement without application styling copies', () => {
		const html = renderToStaticMarkup(<InlineAlert role="status" className="m-0 w-full" data-testid="duplicate">File already saved</InlineAlert>)
		expect(html).toContain('role="status"')
		expect(html).not.toContain('role="alert"')
		expect(html).toContain('m-0 w-full')
		expect(html).toContain('data-testid="duplicate"')
	})
})
