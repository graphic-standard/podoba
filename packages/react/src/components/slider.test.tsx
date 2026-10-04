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

describe('Slider size="sm"', () => {
	test('keeps the label for assistive tech but drops the visible value label', () => {
		const html = renderToStaticMarkup(
			<Slider label="Zoom" size="sm" defaultValue={40} formatOptions={{ style: 'percent' }} minValue={0} maxValue={1} />,
		)

		expect(html).toContain('Zoom')
		expect(html).toContain('class="sr-only"')
		expect(html).not.toContain('-top-6')
	})

	test('renders the track adornment and the root className', () => {
		const html = renderToStaticMarkup(
			<Slider label="Zoom" size="sm" tone="inverted" className="w-28" defaultValue={50} trackAdornment={<div data-testid="limit" />} />,
		)

		expect(html).toContain('data-testid="limit"')
		expect(html).toMatch(/class="[^"]*\bw-28\b/)
	})
})
