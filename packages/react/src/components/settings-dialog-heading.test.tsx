import { GlobalRegistrator } from '@happy-dom/global-registrator'
GlobalRegistrator.register()
import { afterAll, expect, test } from 'bun:test'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { ProductionSettingsDialog, SettingsDialogDisclosure, SettingsDialogEmphasis, SettingsDialogSurface, WizardFormDialog } from './settings-dialog-surface'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
afterAll(() => GlobalRegistrator.unregister())

test('controlled settings disclosure obeys its expanded state', async () => {
 const host = document.body.appendChild(document.createElement('div'))
 const root = createRoot(host)
 const draw = (expanded: boolean) => <SettingsDialogDisclosure title="Details" isExpanded={expanded} onExpandedChange={() => {}}>Contents</SettingsDialogDisclosure>
 try {
  await act(async () => root.render(draw(false)))
  const trigger = host.querySelector<HTMLButtonElement>('button')!
  expect(trigger.getAttribute('aria-expanded')).toBe('false')
  await act(async () => root.render(draw(true)))
  expect(trigger.getAttribute('aria-expanded')).toBe('true')
 } finally { await act(async () => root.unmount()); host.remove() }
})

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

test('production preview supports light and keeps the dark default', async () => {
 const host = document.body.appendChild(document.createElement('div'))
 const root = createRoot(host)
 const draw = (light: boolean) => <ProductionSettingsDialog isOpen onOpenChange={() => {}} prefix="A" title="preview" description="Description" closeLabel="Close" preview={null} footer={null} {...(light ? { previewTone: 'light' as const } : {})}>Content</ProductionSettingsDialog>
 try {
  await act(async () => root.render(draw(false)))
  expect(document.querySelector<HTMLElement>('[data-testid="production-settings-preview"]')?.style.background).not.toBe('var(--color-surface-card)')
  expect(document.querySelector('button[aria-label="Close"]')?.className).toContain('text-white/60')
  await act(async () => root.render(draw(true)))
  expect(document.querySelector<HTMLElement>('[data-testid="production-settings-preview"]')?.style.background).toBe('var(--color-surface-card)')
  expect(document.querySelector('button[aria-label="Close"]')?.className).toContain('text-fg-muted')
 } finally { await act(async () => root.unmount()); host.remove() }
})

test('production preview takes a solid background over the tone; an empty one falls back to the tone', async () => {
 const host = document.body.appendChild(document.createElement('div'))
 const root = createRoot(host)
 const draw = (background: string) => <ProductionSettingsDialog isOpen onOpenChange={() => {}} prefix="A" title="color" description="Description" closeLabel="Close" preview={null} footer={null} previewTone="light" previewBackground={background}>Content</ProductionSettingsDialog>
 const pane = () => document.querySelector<HTMLElement>('[data-testid="production-settings-preview"]')
 try {
  await act(async () => root.render(draw('rgb(255, 0, 0)')))
  expect(pane()?.style.background).toBe('rgb(255, 0, 0)')
  await act(async () => root.render(draw('')))
  expect(pane()?.style.background).toBe('var(--color-surface-card)')
 } finally { await act(async () => root.unmount()); host.remove() }
})

test('compact layout: the fields scroll with a minimum height, the section scrolls as a fallback', async () => {
 const originalMatchMedia = window.matchMedia
 // Force the compact layout (narrow or portrait), which happy-dom does not report.
 window.matchMedia = ((query: string) => ({ matches: true, media: query, onchange: null, addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false })) as typeof window.matchMedia
 const host = document.body.appendChild(document.createElement('div'))
 const root = createRoot(host)
 try {
  await act(async () => root.render(<ProductionSettingsDialog isOpen onOpenChange={() => {}} prefix="A" title="compact" description="Description" closeLabel="Close" preview={null} footer={null}>Content</ProductionSettingsDialog>))
  expect(document.querySelector('[data-testid="production-settings"]')?.getAttribute('data-production-compact')).toBe('true')
  const fields = document.querySelector<HTMLElement>('[data-testid="production-settings-form"]')
  expect(fields?.className).toContain('overflow-y-auto')
  expect(fields?.className).toContain('min-h-32')
  expect(fields?.className).not.toContain('shrink-0')
  expect(fields?.parentElement?.className).toContain('overflow-y-auto')
 } finally {
  await act(async () => root.unmount()); host.remove()
  window.matchMedia = originalMatchMedia
 }
})
