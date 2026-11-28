import { GlobalRegistrator } from '@happy-dom/global-registrator'
GlobalRegistrator.register()
import { afterAll, expect, test } from 'bun:test'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { CtaPill, CtaPillAction } from './cta-pill'
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
afterAll(() => GlobalRegistrator.unregister())
test('normal click activates primary action; shortcut opens only the menu', async () => {
 let primary = 0, menu = 0
 const host = document.createElement('div'); document.body.append(host)
 const root = createRoot(host)
 await act(async () => root.render(<CtaPill lead="Create" menuHint="More options" onOpenMenu={() => menu++}><CtaPillAction onPress={() => primary++}>Create</CtaPillAction></CtaPill>))
 const button = host.querySelector('button')!
 await act(async () => button.click())
 expect(primary).toBe(1); expect(menu).toBe(0)
 await act(async () => button.dispatchEvent(new KeyboardEvent('keydown', { key: 'F10', shiftKey: true, bubbles: true })))
 expect(menu).toBe(1); expect(primary).toBe(1)
 expect(button.getAttribute('aria-describedby')).toBeTruthy()
 await act(async () => root.unmount()); host.remove()
})
test('holding opens the menu without triggering the primary action', async () => {
 let primary = 0, menu = 0
 const host = document.createElement('div'); document.body.append(host)
 const root = createRoot(host)
 await act(async () => root.render(<CtaPill lead="Create" onOpenMenu={() => menu++}><CtaPillAction onPress={() => primary++}>Create</CtaPillAction></CtaPill>))
 const button = host.querySelector('button')!
 await act(async () => { button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerId: 1, pointerType: 'mouse' })); await new Promise(resolve => setTimeout(resolve, 950)) })
 await act(async () => { button.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0, pointerId: 1, pointerType: 'mouse' })); button.click() })
 expect(menu).toBe(1); expect(primary).toBe(0)
 await act(async () => root.unmount()); host.remove()
})
test('cancelled hold resets progress and does not open the menu', async () => {
 let menu = 0
 const host = document.createElement('div'); document.body.append(host)
 const root = createRoot(host)
 await act(async () => root.render(<CtaPill lead="Create" onOpenMenu={() => menu++}><CtaPillAction>Create</CtaPillAction></CtaPill>))
 const button = host.querySelector('button')!
 await act(async () => button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerId: 1, pointerType: 'mouse' })))
 expect(button.style.animation).toContain('cta-hold-progress')
 await act(async () => button.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, pointerId: 1 })))
 expect(button.style.animation).toBe('')
 expect(menu).toBe(0)
 await act(async () => root.unmount()); host.remove()
})
