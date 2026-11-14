import type { ReactNode } from 'react'
import { PanelHeading } from './text'

export type WorkflowStep = {
 readonly id: string
 readonly label: ReactNode
 readonly status: 'complete' | 'current' | 'upcoming'
}

/** Compact, non-interactive progress summary for modal workflows. */
export function WorkflowSteps({ title, steps }: { title: string; steps: readonly WorkflowStep[] }) {
 return <section className="flex flex-col gap-2 bg-surface-card p-5" aria-label={title}>
  <PanelHeading asChild><h3>{title}</h3></PanelHeading>
  <ol className="m-0 flex list-none flex-col gap-2 p-0 text-small">
   {steps.map(step => <li key={step.id} aria-current={step.status === 'current' ? 'step' : undefined} className={`flex items-start gap-3 ${step.status === 'current' ? 'text-fg' : 'text-fg-workflow-muted'}`}>
    <span className={`mt-1.25 h-2 w-2 shrink-0 rounded-full ${step.status === 'upcoming' ? 'bg-fg-subtle' : 'bg-brand-green'}`} aria-hidden="true" />
    {step.label}
   </li>)}
  </ol>
 </section>
}
