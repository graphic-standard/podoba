import { expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { WorkflowSteps } from './workflow-steps'

test('workflow summary marks the current step and uses shared visual states', () => {
 const html = renderToStaticMarkup(<WorkflowSteps title="Progress" steps={[
  { id: 'a', label: 'First', status: 'complete' },
  { id: 'b', label: 'Second', status: 'current' },
  { id: 'c', label: 'Third', status: 'upcoming' },
 ]} />)
 expect(html).toContain('aria-label="Progress"')
 expect(html.match(/aria-current="step"/g)).toHaveLength(1)
 expect(html.match(/bg-brand-green/g)).toHaveLength(2)
 expect(html.match(/bg-fg-subtle/g)).toHaveLength(1)
 expect(html).toContain('text-panel-heading')
})
