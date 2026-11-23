import { GlobalRegistrator } from '@happy-dom/global-registrator'
GlobalRegistrator.register()
import { afterAll, expect, test } from 'bun:test'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { CreateMenuDialog } from './create-menu-dialog'
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
afterAll(() => GlobalRegistrator.unregister())
test('names the dialog and closes through its close action', async () => {
 const host = document.createElement('div'); document.body.append(host); const root = createRoot(host); let changed: boolean | undefined
 await act(async () => root.render(<CreateMenuDialog isOpen onOpenChange={open => { changed = open }} title="Create something" closeLabel="Close menu"><span>Content</span></CreateMenuDialog>))
 expect(document.querySelector('[role="dialog"]')?.textContent).toContain('Create something')
 const close = document.querySelector<HTMLButtonElement>('button[aria-label="Close menu"]')
 expect(close).not.toBeNull()
 await act(async () => close?.click())
 expect(changed).toBe(false)
 await act(async () => root.unmount()); host.remove()
})
