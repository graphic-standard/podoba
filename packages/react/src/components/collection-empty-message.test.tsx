import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { CollectionEmptyMessage } from './collection-empty-message'

describe('CollectionEmptyMessage', () => {
 test('announces the empty state and visually distinguishes the next step', () => {
  const html = renderToStaticMarkup(<CollectionEmptyMessage message="No projects yet." nextStep="Create a project." />)
  expect(html).toContain('role="status"')
  expect(html).toContain('No projects yet.')
  expect(html).toContain('<span class="text-fg">Create a project.</span>')
  expect(html).toContain('min-h-48')
 })
 test('supports compact nested surfaces without an action', () => {
  const html = renderToStaticMarkup(<CollectionEmptyMessage compact message="Nothing found." />)
  expect(html).toContain('min-h-24')
  expect(html).toContain('Nothing found.')
  expect(html).not.toContain('<span class="text-fg">')
 })
})
