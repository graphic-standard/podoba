import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

import { Slider } from './slider'

// The thumb is the element React Aria gives the inline `translate(-50%, -50%)`.
const thumbClasses = (html: string) => {
	const match = html.match(/style="[^"]*translate\(-50%, -50%\)[^"]*" class="([^"]*)"/)
	if (!match) throw new Error('thumb not found')
	return match[1].split(' ')
}

describe('Slider', () => {
	// Regression guard: React Aria centers the thumb with `translate(-50%, -50%)` but
	// only sets the position along the track, so the cross axis is ours to center or
	// the thumb floats off the track.
	test('centers the thumb on a horizontal track', () => {
		const html = renderToStaticMarkup(<Slider label="Zoom" defaultValue={50} />)

		expect(thumbClasses(html)).toContain('top-1/2')
	})

	test('centers the thumb on a vertical track', () => {
		const html = renderToStaticMarkup(<Slider label="Zoom" defaultValue={50} orientation="vertical" />)
		const classes = thumbClasses(html)

		expect(classes).toContain('left-1/2')
		expect(classes).not.toContain('top-1/2')
		expect(html).toContain('data-orientation="vertical"')
	})
})
