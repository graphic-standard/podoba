import { GlobalRegistrator } from '@happy-dom/global-registrator'
GlobalRegistrator.register()
import { afterAll, expect, test } from 'bun:test'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { Dialog } from './dialog'
import { SettingsDialogSurface } from './settings-dialog-surface'
import { SidePanel } from './side-panel'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
afterAll(() => GlobalRegistrator.unregister())

// iOS Safari keeps the LAYOUT viewport full height when the keyboard opens, so a
// dialog sized with `inset-0` / `vh` ends under the keyboard and its lower fields
// cannot be reached. Every overlay must follow React Aria's visible-viewport height.
const VISIBLE_HEIGHT = 'h-[var(--visual-viewport-height,100dvh)]'

async function overlayOf(node: React.ReactNode): Promise<{ overlay: HTMLElement; cleanup: () => Promise<void> }> {
 const host = document.body.appendChild(document.createElement('div'))
 const root = createRoot(host)
 await act(async () => root.render(node))
 const overlay = [...document.querySelectorAll<HTMLElement>('div')].find(element => element.style.getPropertyValue('--visual-viewport-height') !== '')
 expect(overlay).toBeDefined()
 return { overlay: overlay!, cleanup: async () => { await act(async () => root.unmount()); host.remove() } }
}

test('dialog overlays are sized to the visible viewport, not the layout viewport', async () => {
 for (const node of [
  <Dialog isOpen onOpenChange={() => {}} title="Company">Body</Dialog>,
  <SettingsDialogSurface isOpen onOpenChange={() => {}} variant="edit" title="Company" closeLabel="Close" footer={null}>Body</SettingsDialogSurface>,
 ]) {
  const { overlay, cleanup } = await overlayOf(node)
  try {
   expect(overlay.classList.contains(VISIBLE_HEIGHT)).toBe(true)
   expect(overlay.classList.contains('inset-0')).toBe(false)
  } finally { await cleanup() }
 }
})

test('the side panel fills its visible-viewport overlay instead of the whole screen', async () => {
 const { overlay, cleanup } = await overlayOf(<SidePanel isOpen onOpenChange={() => {}} title="Details" closeLabel="Close" footer={<button type="button">Save</button>}>Body</SidePanel>)
 try {
  expect(overlay.classList.contains(VISIBLE_HEIGHT)).toBe(true)
  const panel = overlay.firstElementChild as HTMLElement | null
  expect(panel?.classList.contains('h-full')).toBe(true)
  expect(panel?.classList.contains('h-dvh')).toBe(false)
 } finally { await cleanup() }
})

test('dialog height caps follow the visible viewport', async () => {
 const { cleanup } = await overlayOf(<Dialog isOpen onOpenChange={() => {}} title="Company" size="md">Body</Dialog>)
 try {
  const caps = [...document.querySelectorAll<HTMLElement>('[class*="max-h-"]')].map(element => element.className)
  expect(caps.some(className => className.includes('max-h-[calc(var(--visual-viewport-height,100dvh)*0.85)]'))).toBe(true)
  expect(caps.some(className => className.includes('max-h-[85vh]'))).toBe(false)
 } finally { await cleanup() }
})
