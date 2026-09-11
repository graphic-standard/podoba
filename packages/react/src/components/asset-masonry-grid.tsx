import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

export function assetMasonryColumns(width: number) {
	const gap = 12
	if (width <= 0) return { count: 1, width: 200, gap }
	const minimum = width < 768 ? 200 : width < 1024 ? 250 : 280
	const count = Math.max(width < 768 ? 1 : width < 1024 ? 2 : 3, Math.floor((width + gap) / (minimum + gap)))
	return { count, width: (width - (count - 1) * gap) / count, gap }
}

export function assetMasonryPositions(heights: number[], count: number, gap = 12) {
	const bottoms = Array.from({ length: Math.max(1, count) }, () => 0)
	const positions = heights.map(height => {
		const column = bottoms.indexOf(Math.min(...bottoms))
		const top = bottoms[column] ?? 0
		bottoms[column] = top + height + gap
		return { column, top }
	})
	return { positions, height: heights.length ? Math.max(...bottoms) - gap : 0 }
}

/** Source shortest-column order, measuring children so metadata cannot overlap. */
export function AssetMasonryGrid({ items, label }: {
	items: { id: string; aspectRatio: number; content: ReactNode }[]
	label: string
}) {
	const container = useRef<HTMLUListElement>(null)
	const [width, setWidth] = useState(0)
	const [measured, setMeasured] = useState<Record<string, { width: number; height: number }>>({})
	const columns = assetMasonryColumns(width)
	// Callers build `items` inline, so depending on the ARRAY identity tore down the
	// ResizeObserver, rebuilt it and re-observed every child on each parent render.
	// The observer only cares about which children exist — key on the id list.
	const itemsKey = items.map(item => item.id).join('\u0000')
	useLayoutEffect(() => {
		const node = container.current
		if (!node) return
		const measure = () => {
			setWidth(node.clientWidth)
			const next: typeof measured = {}
			for (const child of node.children) {
				if (!(child instanceof HTMLElement) || !child.dataset.masonryId) continue
				next[child.dataset.masonryId] = { width: child.offsetWidth, height: child.offsetHeight }
			}
			setMeasured(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next)
		}
		measure()
		const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure)
		observer?.observe(node)
		for (const child of node.children) observer?.observe(child)
		return () => observer?.disconnect()
	}, [itemsKey, columns.width])
	const heights = items.map(item => {
		const size = measured[item.id]
		if (size && Math.abs(size.width - columns.width) < 1 && size.height > 0) return size.height
		return Math.min(800, Math.max(150, columns.width / (item.aspectRatio > 0 ? item.aspectRatio : 1)))
	})
	const layout = assetMasonryPositions(heights, columns.count, columns.gap)
	return <ul ref={container} aria-label={label} data-testid="asset-grid" className="relative m-0 w-full list-none p-0" style={{ height: layout.height }}>
		{items.map((item, index) => <li key={item.id} data-masonry-id={item.id} className="absolute" style={{ width: columns.width, insetInlineStart: (layout.positions[index]?.column ?? 0) * (columns.width + columns.gap), top: layout.positions[index]?.top ?? 0 }}>{item.content}</li>)}
	</ul>
}
