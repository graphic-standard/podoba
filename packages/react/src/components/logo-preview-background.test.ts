import { describe, expect, test } from 'bun:test'
import { logoBackgroundFromPixels } from './logo-preview-background'

const pixels = (...rgba: number[][]) => new Uint8ClampedArray(rgba.flat())

describe('logoBackgroundFromPixels', () => {
	test('a dark logo gets the light surface and a light logo the dark one', () => {
		expect(logoBackgroundFromPixels(pixels([20, 20, 20, 255], [0, 0, 0, 255]))).toBe('light')
		expect(logoBackgroundFromPixels(pixels([250, 250, 250, 255], [230, 240, 255, 255]))).toBe('dark')
	})

	test('transparent padding does not count', () => {
		// Mostly transparent white padding around a black mark is still a dark logo.
		const padding = Array.from({ length: 50 }, () => [255, 255, 255, 0])
		expect(logoBackgroundFromPixels(pixels(...padding, [0, 0, 0, 255]))).toBe('light')
	})

	test('pixels count by their opacity', () => {
		// A faint white wash does not outweigh a solid black mark.
		expect(logoBackgroundFromPixels(pixels([255, 255, 255, 40], [0, 0, 0, 255]))).toBe('light')
	})

	test('nothing visible gives null', () => {
		expect(logoBackgroundFromPixels(pixels([255, 255, 255, 0], [0, 0, 0, 5]))).toBeNull()
		expect(logoBackgroundFromPixels(new Uint8ClampedArray())).toBeNull()
	})
})
