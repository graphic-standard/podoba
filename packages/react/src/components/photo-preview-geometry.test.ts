import { describe, expect, test } from 'bun:test'
import { clampPhotoPan, photoPreviewGeometry } from './photo-preview-geometry'

describe('photoPreviewGeometry', () => {
	test('fits a portrait photo with the inset and covers the frame when zoomed', () => {
		const photo = photoPreviewGeometry(800, 400, 400, 600)!
		expect(photo.height).toBeCloseTo(336)
		expect(photo.width).toBeCloseTo(224)
		expect(photo.width * photo.coverScale).toBeCloseTo(800)
		expect(photo.height * photo.coverScale).toBeGreaterThanOrEqual(400)
	})

	test('works for landscape and gives null while a size is unknown', () => {
		const photo = photoPreviewGeometry(400, 800, 1200, 600)!
		expect(photo.width).toBeCloseTo(336)
		expect(photo.height * photo.coverScale).toBeCloseTo(800)
		expect(photoPreviewGeometry(0, 100, 50, 50)).toBeNull()
		expect(photoPreviewGeometry(100, 100, Number.NaN, 50)).toBeNull()
	})
})

describe('clampPhotoPan', () => {
	test('pans only as far as the cropped edges, never showing an empty one', () => {
		expect(clampPhotoPan(900, -900, 800, 400, 1000, 1000)).toEqual({ x: 100, y: -300 })
		expect(clampPhotoPan(-50, 50, 800, 400, 800, 1000)).toEqual({ x: 0, y: 50 })
	})
})
