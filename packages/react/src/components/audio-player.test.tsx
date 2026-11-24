import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

import { AudioPlayer, formatAudioTime } from './audio-player'

const labels = { play: 'Play', pause: 'Pause', position: 'Position', volume: 'Volume' }

describe('formatAudioTime', () => {
	test('reads minutes and seconds, and hours from one hour', () => {
		expect(formatAudioTime(0)).toBe('0:00')
		expect(formatAudioTime(65.9)).toBe('1:05')
		expect(formatAudioTime(3723)).toBe('1:02:03')
	})

	test('treats an unknown or negative time as zero', () => {
		expect(formatAudioTime(Number.NaN)).toBe('0:00')
		expect(formatAudioTime(Number.POSITIVE_INFINITY)).toBe('0:00')
		expect(formatAudioTime(-4)).toBe('0:00')
	})
})

describe('AudioPlayer', () => {
	test('is a named group with the host labels and a metadata-only audio element', () => {
		const html = renderToStaticMarkup(<AudioPlayer src="/a.mp3" name="Jingle.mp3" labels={labels} />)

		expect(html).toContain('role="group"')
		expect(html).toContain('aria-label="Jingle.mp3"')
		expect(html).toContain('preload="metadata"')
		expect(html).toContain('Play')
		expect(html).toContain('Position')
		expect(html).toContain('Volume')
	})
})
