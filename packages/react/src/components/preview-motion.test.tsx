/// <reference types="bun" />

import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

import { PreviewReveal, PreviewSkeleton } from './preview-motion'
import { CatalogLaunchCard, CatalogSummaryCard } from './template-catalog-card'

describe('preview motion', () => {
	test('skeleton is the source mint shimmer and announces only when labelled', () => {
		const html = renderToStaticMarkup(<PreviewSkeleton label="Rendering preview" />)
		expect(html).toContain('role="status"')
		expect(html).toContain('animate-preview-skeleton-shimmer')
		expect(html).toContain('#c7fee0')
		expect(renderToStaticMarkup(<PreviewSkeleton />)).toContain('aria-hidden="true"')
	})

	test('reveal renders the artwork with a decorative overlay and no motion before a reveal', () => {
		const html = renderToStaticMarkup(
			<PreviewReveal revealKey="a">
				<img alt="Poster" src="/p.png" />
			</PreviewReveal>,
		)
		expect(html).toContain('alt="Poster"')
		expect(html).toContain('aria-hidden="true"')
		expect(html).not.toContain('animate-preview-particle')
	})
})

describe('CatalogSummaryCard preview', () => {
	test('covers the summary card with the artwork and white ink', () => {
		const html = renderToStaticMarkup(<CatalogSummaryCard title="Print" badge={null} details="2 outputs" preview={<img alt="" src="/p.png" />} />)
		expect(html).toContain('data-preview="true"')
		expect(html).toContain('text-white/88')
	})
})

describe('CatalogLaunchCard preview', () => {
	test('covers the card with the artwork and switches to white ink', () => {
		const html = renderToStaticMarkup(
			<CatalogLaunchCard title="Print" details="1 section" action={null} preview={<img alt="" src="/p.png" />} />,
		)
		expect(html).toContain('data-preview="true"')
		expect(html).toContain('to-black/50')
		expect(html).toContain('text-white')
		expect(renderToStaticMarkup(<CatalogLaunchCard title="Print" details="1 section" action={null} />)).not.toContain('text-white')
	})
})
