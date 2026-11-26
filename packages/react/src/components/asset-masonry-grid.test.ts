import { expect, test } from 'bun:test'

import { assetMasonryColumns, assetMasonryPositions } from './asset-masonry-grid'

test('two columns on a phone, more as the container grows, never fewer', () => {
	for (const [width, count] of [[0, 1], [240, 1], [279, 1], [280, 2], [358, 2], [599, 2], [600, 3], [767, 3], [899, 3], [900, 3], [1023, 3], [1180, 4], [1392, 4], [1472, 5]] as const) {
		const result = assetMasonryColumns(width)
		expect(result.count).toBe(count)
		expect(result.gap).toBe(12)
		expect(result.width * count + (count - 1) * result.gap).toBeCloseTo(width || 200)
	}
	let previous = 0
	for (let width = 1; width <= 2400; width++) {
		const { count } = assetMasonryColumns(width)
		expect(count).toBeGreaterThanOrEqual(previous)
		previous = count
	}
})

test('places each next asset in the shortest column and excludes the trailing gutter', () => {
	const result = assetMasonryPositions([300, 150, 200, 100, 80], 3)
	expect(result.positions).toEqual([{ column: 0, top: 0 }, { column: 1, top: 0 }, { column: 2, top: 0 }, { column: 1, top: 162 }, { column: 2, top: 212 }])
	expect(result.height).toBe(300)
	expect(assetMasonryPositions([], 3).height).toBe(0)
})
