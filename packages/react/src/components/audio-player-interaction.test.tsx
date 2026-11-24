import { GlobalRegistrator } from '@happy-dom/global-registrator'
GlobalRegistrator.register()
import { afterAll, afterEach, expect, test } from 'bun:test'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'

import { AudioPlayer } from './audio-player'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
afterAll(() => GlobalRegistrator.unregister())

const labels = { play: 'Play', pause: 'Pause', position: 'Position', volume: 'Volume' }
const originalPlay = HTMLMediaElement.prototype.play
afterEach(() => {
	HTMLMediaElement.prototype.play = originalPlay
})

async function mount(): Promise<{ host: HTMLElement; root: Root; errors: () => number }> {
	let errors = 0
	const host = document.createElement('div')
	document.body.append(host)
	const root = createRoot(host)
	await act(async () => root.render(<AudioPlayer src="/a.mp3" name="Jingle.mp3" labels={labels} onError={() => errors++} />))
	return { host, root, errors: () => errors }
}

async function unmount(host: HTMLElement, root: Root): Promise<void> {
	await act(async () => root.unmount())
	host.remove()
}

const button = (host: HTMLElement) => host.querySelector('button') as HTMLButtonElement
const audioElement = (host: HTMLElement) => host.querySelector('audio') as HTMLAudioElement
/** The root of the slider whose label reads `text`. */
const sliderRoot = (host: HTMLElement, text: string) =>
	[...host.querySelectorAll('label')].find((label) => label.textContent === text)?.closest('[data-orientation]')

/** Make play() reject the way a browser does, with a DOMException of this name. */
function rejectPlay(name: string): void {
	HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException('play() rejected', name))
}

test('a source that cannot load reports one error', async () => {
	const { host, root, errors } = await mount()
	try {
		await act(async () => audioElement(host).dispatchEvent(new Event('error')))
		expect(errors()).toBe(1)
	} finally {
		await unmount(host, root)
	}
})

test('playback the browser refuses reports one error and keeps the Play label', async () => {
	rejectPlay('NotAllowedError')
	const { host, root, errors } = await mount()
	try {
		await act(async () => button(host).click())
		expect(errors()).toBe(1)
		expect(button(host).textContent).toBe('Play')
	} finally {
		await unmount(host, root)
	}
})

test('pausing before playback started is not an error', async () => {
	rejectPlay('AbortError')
	const { host, root, errors } = await mount()
	try {
		await act(async () => button(host).click())
		expect(errors()).toBe(0)
	} finally {
		await unmount(host, root)
	}
})

test('the button follows playback, and a new source resets it', async () => {
	const { host, root } = await mount()
	try {
		await act(async () => audioElement(host).dispatchEvent(new Event('play')))
		expect(button(host).textContent).toBe('Pause')
		// The media load algorithm (a new src) fires `emptied`, never `pause`.
		await act(async () => audioElement(host).dispatchEvent(new Event('emptied')))
		expect(button(host).textContent).toBe('Play')
		expect(sliderRoot(host, 'Position')?.hasAttribute('data-disabled')).toBe(true)
	} finally {
		await unmount(host, root)
	}
})

test('only the position slider waits for the duration; the volume label is read once', async () => {
	const { host, root } = await mount()
	try {
		expect(sliderRoot(host, 'Position')?.hasAttribute('data-disabled')).toBe(true)
		expect(sliderRoot(host, 'Volume')?.hasAttribute('data-disabled')).toBe(false)
		const visibleVolume = [...host.querySelectorAll('span')].find((span) => span.textContent === 'Volume')
		expect(visibleVolume?.getAttribute('aria-hidden')).toBe('true')
	} finally {
		await unmount(host, root)
	}
})
