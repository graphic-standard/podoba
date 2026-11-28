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
 await act(async () => { button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerId: 1, pointerType: 'mouse' })); await new Promise(resolve => setTimeout(resolve, 600)) })
 await act(async () => { button.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0, pointerId: 1, pointerType: 'mouse' })); button.click() })
 expect(menu).toBe(1); expect(primary).toBe(0)
 await act(async () => root.unmount()); host.remove()
})

const pointer = (type: string, target: Element) =>
 target.dispatchEvent(new PointerEvent(type, { bubbles: true, button: 0, pointerId: 1, pointerType: 'mouse' }))
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

test('holdMs lengthens the hold; the default stays 550 ms', async () => {
 let menu = 0
 const host = document.createElement('div'); document.body.append(host)
 const root = createRoot(host)
 await act(async () => root.render(<CtaPill lead="Create" holdMs={750} onOpenMenu={() => menu++}><CtaPillAction>Create</CtaPillAction></CtaPill>))
 const button = host.querySelector('button')!
 await act(async () => { pointer('pointerdown', button); await wait(600) })
 expect(menu).toBe(0)
 await act(async () => { await wait(200) })
 expect(menu).toBe(1)
 await act(async () => { pointer('pointerup', button) })
 await act(async () => root.unmount()); host.remove()
})

test('a press on a disabled action never turns into a hold', async () => {
 let menu = 0
 const host = document.createElement('div'); document.body.append(host)
 const root = createRoot(host)
 await act(async () => root.render(<CtaPill lead="Create" onOpenMenu={() => menu++}><CtaPillAction isDisabled>Create</CtaPillAction></CtaPill>))
 const button = host.querySelector('button')!
 expect(button.disabled).toBe(true)
 await act(async () => { pointer('pointerdown', button); await wait(600) })
 expect(menu).toBe(0)
 await act(async () => root.unmount()); host.remove()
})

test('holdFeedback draws the ring only while a hold runs, at the hold length; without it the action is untouched', async () => {
 const host = document.createElement('div'); document.body.append(host)
 const root = createRoot(host)
 await act(async () => root.render(<CtaPill lead="Create" holdMs={750} holdFeedback onOpenMenu={() => {}}><CtaPillAction>Create</CtaPillAction></CtaPill>))
 const button = host.querySelector('button')!
 // The transparent border is there before the hold, so the hold does not resize the button.
 expect(button.style.border).toContain('2px')
 expect(button.hasAttribute('data-holding')).toBe(false)
 await act(async () => { pointer('pointerdown', button); await wait(50) })
 expect(button.hasAttribute('data-holding')).toBe(true)
 expect(button.className).toContain('animate-cta-hold')
 expect(button.style.getPropertyValue('--cta-hold-duration')).toBe('750ms')
 await act(async () => { pointer('pointerup', button) })
 expect(button.hasAttribute('data-holding')).toBe(false)

 await act(async () => root.render(<CtaPill lead="Create" onOpenMenu={() => {}}><CtaPillAction>Create</CtaPillAction></CtaPill>))
 const plain = host.querySelector('button')!
 // React Aria's own press styles may be there; the ring's border and duration are not.
 expect(plain.style.border).toBe('')
 expect(plain.style.getPropertyValue('--cta-hold-duration')).toBe('')
 await act(async () => { pointer('pointerdown', plain); await wait(50) })
 expect(plain.hasAttribute('data-holding')).toBe(false)
 await act(async () => { pointer('pointerup', plain) })
 await act(async () => root.unmount()); host.remove()
})
