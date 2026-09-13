/// <reference types="bun" />

import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

import { AnimatedSummaryText } from './animated-summary-text'
import { BrandPageHeader } from './brand-page-header'
import { fieldDescriptionClass, fieldErrorClass } from './field-appearance'
import { Input } from './input'
import { PreviewSkeleton } from './preview-motion'
import { SectionTabs } from './section-tabs'
import { BadgeIcon, CheckCircledIcon, LayersIcon, SwitchViewIcon } from './source-icons'
import { CatalogSummaryCard } from './template-catalog-card'

describe('AnimatedSummaryText', () => {
	test('reveals per character with the source 22ms step capped at 1800ms', () => {
		const text = 'a'.repeat(100)
		const html = renderToStaticMarkup(<AnimatedSummaryText text={text} />)
		expect(html.match(/data-summary-token=""/g)?.length).toBe(100)
		expect(html).toContain('animation-delay:0ms')
		expect(html).toContain('animation-delay:22ms')
		expect(html).toContain('animation-delay:1800ms')
		expect(html).not.toContain('animation-delay:1804ms')
		expect(html).toContain('animate-summary-token')
		expect(html).toContain('motion-reduce:animate-none')
	})

	test('keeps words whole, breaks on newline, highlights runs and reads as one string', () => {
		const html = renderToStaticMarkup(
			<AnimatedSummaryText
				text={'Two tasks\nneed you'}
				segments={[{ text: 'Two tasks\n' }, { text: 'need you', highlighted: true }]}
				highlightClassName="text-fg"
			/>,
		)
		expect(html).toContain('<span class="sr-only">Two tasks need you</span>')
		expect(html).toContain('aria-hidden="true"')
		expect(html).toContain('<br/>')
		expect(html).toContain('inline-block whitespace-nowrap text-fg')
	})
})

describe('SectionTabs switchable hint', () => {
	test('a selected switchable tab carries the hint, the 12px gap and a hidden burst', () => {
		const html = renderToStaticMarkup(
			<SectionTabs
				tabs={[
					{ key: 'all', label: 'All (18)', switchable: true, switchHintLabel: 'Switch view' },
					{ key: 'my', label: 'My tasks (0)', switchable: true, switchHintLabel: 'Switch view' },
				]}
				active="all"
				onChange={() => {}}
			/>,
		)
		expect(html.match(/title="Switch view"/g)?.length).toBe(1)
		expect(html.match(/data-switchable="true"/g)?.length).toBe(1)
		expect(html).toContain('gap-3')
		expect(html).toContain('w-0')
		expect(html).toContain('group-data-[hovered]/switch:w-3.5')
		expect(html).toContain('duration-120')
	})

	test('tabs without switchable render no hint', () => {
		const html = renderToStaticMarkup(<SectionTabs tabs={[{ key: 'all', label: 'All' }]} active="all" onChange={() => {}} />)
		expect(html).not.toContain('title=')
		expect(html).not.toContain('<svg')
	})
})

describe('source icons', () => {
	test('render decorative glyphs on their source grids', () => {
		for (const Icon of [LayersIcon, BadgeIcon, CheckCircledIcon]) {
			const html = renderToStaticMarkup(<Icon />)
			expect(html).toContain('viewBox="0 0 15 15"')
			expect(html).toContain('aria-hidden="true"')
		}
		expect(renderToStaticMarkup(<SwitchViewIcon />)).toContain('viewBox="0 0 16 16"')
	})
})

describe('PreviewSkeleton theme', () => {
	test('keeps the light source literals and swaps to surface tokens in dark theme', () => {
		const html = renderToStaticMarkup(<PreviewSkeleton />)
		expect(html).toContain('[--preview-skeleton-base:#ffffff]')
		expect(html).toContain('[--preview-skeleton-glow:#c7fee0]')
		expect(html).toContain('dark:[--preview-skeleton-base:var(--color-surface)]')
		expect(html).toContain('var(--preview-skeleton-glow)')
		expect(html).not.toMatch(/background-image:[^"]*#ffffff/)
	})
})

describe('contrast fixes', () => {
	test('catalog summary footer uses the AA muted ink', () => {
		const html = renderToStaticMarkup(<CatalogSummaryCard title="Launch" badge={null} description="Two templates" details="3 outputs" />)
		expect(html).toContain('text-fg-muted')
		expect(html).not.toContain('text-fg-workflow-muted')
	})

	test('page header parent link offers the large-text soft tone', () => {
		const soft = renderToStaticMarkup(<BrandPageHeader greeting="Tokens" parentLink={<a href="/ds">Design system</a>} parentLinkTone="soft" />)
		expect(soft).toContain('[&amp;_a]:text-fg-muted-large')
		const muted = renderToStaticMarkup(<BrandPageHeader greeting="Tokens" parentLink={<a href="/ds">Design system</a>} />)
		expect(muted).toContain('[&amp;_a]:text-fg-muted')
		expect(muted).not.toContain('text-fg-muted-large')
	})
})

describe('field helper and error text', () => {
	test('use the source 14px helper and 16px error scale', () => {
		expect(fieldDescriptionClass).toBe('text-small text-fg-muted')
		expect(fieldErrorClass).toBe('text-body leading-[normal] text-danger')
		const html = renderToStaticMarkup(<Input label="Deadline" description="Optional deadline for this project" />)
		expect(html).toContain('class="text-small text-fg-muted"')
	})
})
