import { GlobalRegistrator } from '@happy-dom/global-registrator'
GlobalRegistrator.register()
import { afterAll, expect, test } from 'bun:test'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { ProductionSettingsDialog, SettingsDialogEmphasis, SettingsDialogSurface, WizardFormDialog } from './settings-dialog-surface'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
afterAll(() => GlobalRegistrator.unregister())

test('shared dialog headings use the same large-text muted tone and retain emphasis', async () => {
 const host = document.body.appendChild(document.createElement('div'))
 const root = createRoot(host)
 const title = <>A <SettingsDialogEmphasis>highlight</SettingsDialogEmphasis></>
 const surfaces = [
  <SettingsDialogSurface isOpen onOpenChange={() => {}} variant="edit" title={title} closeLabel="Close" footer={null}>Content</SettingsDialogSurface>,
  <WizardFormDialog isOpen onOpenChange={() => {}} title={title} closeLabel="Close" footer={null}>Content</WizardFormDialog>,
  <ProductionSettingsDialog isOpen onOpenChange={() => {}} prefix="A" title="highlight" description="Description" closeLabel="Close" preview={null} footer={null}>Content</ProductionSettingsDialog>,
 ]
 try {
  for (const surface of surfaces) {
   await act(async () => root.render(surface))
   const heading = document.querySelector('h1, h2')
   expect(heading?.classList.contains('text-fg-muted-large')).toBe(true)
   expect(heading?.querySelector('.text-fg')).not.toBeNull()
  }
 } finally { await act(async () => root.unmount()); host.remove() }
})
