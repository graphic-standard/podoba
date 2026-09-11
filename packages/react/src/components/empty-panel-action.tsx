import { uic } from '../utils/uic'
import { DialogActionButton } from './dialog-action-button'

/** Centered action for an empty dashboard panel; keeps the source UI action palette. */
export const EmptyPanelAction = uic(DialogActionButton, {
 displayName: 'EmptyPanelAction',
 baseClass: 'h-14 min-w-48 px-6 py-0 text-body font-medium leading-5',
})
