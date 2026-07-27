import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

import { DisplayHeading } from './text'

describe('DisplayHeading', () => {
	test('renders the shared GS product-display typography and supports asChild', () => {
		const html = renderToStaticMarkup(
			<DisplayHeading asChild>
				<h1>Review final output</h1>
			</DisplayHeading>,
		)

		expect(html).toContain('<h1')
		expect(html).toContain('text-display-large')
		expect(html).toContain('font-medium')
		expect(html).toContain('Review final output')
	})
})
