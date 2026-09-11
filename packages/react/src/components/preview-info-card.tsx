import { uic } from '../utils/uic'

// Shared, domain-free information overlay. Position belongs to the preview pane.
export const PreviewInfoCard = uic('div', {
 displayName: 'PreviewInfoCard',
 baseClass: 'pointer-events-none absolute bottom-0 left-0 z-10 flex w-80 max-w-full flex-col gap-3 rounded-md bg-surface p-4',
})
export const PreviewInfoRow = uic('div', {
 displayName: 'PreviewInfoRow',
 baseClass: 'flex min-h-6 items-center justify-between gap-2',
})
export const PreviewInfoLabel = uic('span', {
 displayName: 'PreviewInfoLabel',
 baseClass: 'min-w-0 truncate text-label font-normal leading-5 text-fg-muted',
})
export const PreviewInfoCount = uic('span', {
 displayName: 'PreviewInfoCount',
 baseClass: 'shrink-0 rounded-full bg-surface-muted px-2 py-0.5 text-micro font-medium leading-5 tracking-tight text-fg',
})
export const PreviewInfoTitle = uic('h3', {
 displayName: 'PreviewInfoTitle',
 baseClass: 'm-0 truncate text-compact font-medium leading-4 text-fg',
})
export const PreviewInfoActions = uic('div', {
 displayName: 'PreviewInfoActions',
 baseClass: 'pointer-events-auto flex flex-wrap gap-2 pt-1',
})
