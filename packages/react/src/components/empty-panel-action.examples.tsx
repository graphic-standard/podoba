import { EmptyPanelAction } from './empty-panel-action'
export const examples = {
 default: () => <EmptyPanelAction>Add deadline</EmptyPanelAction>,
 variants: () => <EmptyPanelAction>Select assets</EmptyPanelAction>,
 states: () => <><EmptyPanelAction isDisabled>Add deadline</EmptyPanelAction><EmptyPanelAction isPending>Loading</EmptyPanelAction></>,
}
export const meta = { category: 'Composite', description: 'Source dashboard empty action: 56px height, 192px minimum width and 16/20 medium text. Uses RAC focus, disabled and pending states.' }
