import type { ReactNode } from 'react'

/**
 * DashboardGrid + DashboardTile — responsive 12-column dashboard grid
 * (port of gs-platform `DashboardGrid`).
 *
 * gs-platform's grid is a 12-col CSS grid where each item declares a `width`
 * (3/4/6/12) and tiles collapse to full width on mobile. We reproduce that with
 * Tailwind responsive column spans — no SCSS, no external grid lib.
 *
 * **Drag-to-reorder is DEFERRED** for this issue: gs-platform implements it with
 * `@dnd-kit/core` + `@dnd-kit/sortable`, which are not dependencies of this repo
 * and adding them is out of scope (no dependency bumps). A static responsive grid
 * is acceptable per the issue spec; the `DashboardTile` API is shaped so a future
 * sortable wrapper can slot in without changing call sites.
 *
 * Presentational only (hard rule #1).
 */

export type DashboardTileSpan = 3 | 4 | 6 | 12

const SPAN_CLASS: Record<DashboardTileSpan, string> = {
	// Mobile: always full width. ≥sm: take the requested fraction of 12 cols.
	3: 'col-span-12 sm:col-span-6 lg:col-span-3',
	4: 'col-span-12 sm:col-span-6 lg:col-span-4',
	6: 'col-span-12 sm:col-span-6',
	12: 'col-span-12',
}

export type DashboardGridProps = {
	children: ReactNode
	className?: string
}

export function DashboardGrid({ children, className }: DashboardGridProps) {
	return (
		<div className={['grid grid-cols-12 gap-4', className].filter(Boolean).join(' ')}>{children}</div>
	)
}

export type DashboardTileProps = {
	/** Column span out of 12 (collapses to full width below `lg`). Default 3. */
	span?: DashboardTileSpan
	children: ReactNode
	className?: string
}

export function DashboardTile({ span = 3, children, className }: DashboardTileProps) {
	return <div className={[SPAN_CLASS[span], className].filter(Boolean).join(' ')}>{children}</div>
}
