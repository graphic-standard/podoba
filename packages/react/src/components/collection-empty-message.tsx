import type { ReactNode } from 'react'

/** Centered, label-driven feedback for an empty collection. */
export function CollectionEmptyMessage({ message, nextStep, compact = false }: { message: ReactNode; nextStep?: ReactNode; compact?: boolean }) {
 return <div role="status" className={compact ? 'flex min-h-24 items-center justify-center px-4 pt-6 pb-3 text-center' : 'flex min-h-48 items-center justify-center px-6 pt-12 pb-6 text-center'}><p className={`max-w-[36ch] font-medium text-fg-muted ${compact ? 'text-body' : 'text-heading4'}`}>{message}{nextStep ? <> <span className="text-fg">{nextStep}</span></> : null}</p></div>
}
