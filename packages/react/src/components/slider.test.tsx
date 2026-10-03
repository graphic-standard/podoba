import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

import { Slider } from './slider'

describe('Slider', () => {
	// Regression guard: React Aria centers the thumb with `translate(-50%, -50%)` but
	// sets no `top`, so the thumb must carry `top-1/2` or it floats above the track.
	test('centers the thumb on the track', () => {
		const html = renderToStaticMarkup(<Slider label="Zoom" defaultValue={50} />)

		expect(html).toContain('translate(-50%, -50%)')
		expect(html).toMatch(/class="top-1\/2 [^"]*rounded-full/)
	})
})
