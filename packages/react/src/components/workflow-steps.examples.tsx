import { WorkflowSteps } from './workflow-steps'

const steps = [
 { id: 'prepare', label: 'Prepare files', status: 'complete' as const },
 { id: 'review', label: 'Review', status: 'current' as const },
 { id: 'finish', label: 'Finish', status: 'upcoming' as const },
]
export const examples = { default: () => <WorkflowSteps title="Your progress" steps={steps} /> }
export const meta = { category: 'Composite', description: 'A compact workflow summary for modal control panels.' }
