import { GlobalRegistrator } from '@happy-dom/global-registrator'
GlobalRegistrator.register()
import { act, useState } from 'react'
import { afterAll, expect, test } from 'bun:test'
const { createRoot } = await import('react-dom/client')
const { CycleMenuButton } = await import('./cycle-menu-button')
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
afterAll(() => GlobalRegistrator.unregister())
const pause = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
async function fixture(disabled = false) {
 let currentDisabled = disabled
 let options = [{id:'a',label:'A'},{id:'blocked',label:'Unavailable',isDisabled:true},{id:'b',label:'B'}]
 const host = document.createElement('div'); document.body.append(host)
 const root = createRoot(host), changes: string[] = []
 let setExternalValue: (value: string) => void = () => {}
 function Demo() {
  const [value,setValue] = useState('a')
  setExternalValue = setValue
  return <CycleMenuButton label="Color" icon={<span>●</span>} value={value} isDisabled={currentDisabled} onChange={id => { changes.push(id);setValue(id) }} options={options} />
 }
 await act(async () => {root.render(<Demo />)})
 return {button:host.querySelector('button')!,changes,update: async (next: { disabled?: boolean; options?: typeof options; value?: string }) => {
  if (next.disabled !== undefined) currentDisabled = next.disabled
  if (next.options !== undefined) options = next.options
  await act(async () => { if (next.value !== undefined) setExternalValue(next.value); root.render(<Demo />) })
 },close: () => {act(()=>root.unmount());host.remove()}}
}
function pointer(target: Element, type: string, pointerType = 'mouse') {
 target.dispatchEvent(new PointerEvent(type,{bubbles:true,pointerId:1,pointerType,button:0,buttons:type==='pointerdown'?1:0,isPrimary:true}))
}
test('short activation cycles with wraparound and skips unavailable options', async () => {
 const f = await fixture()
 try {
  await act(async()=>{f.button.click()});expect(f.changes).toEqual(['b'])
  await act(async()=>{f.button.click()});expect(f.changes).toEqual(['b','a'])
 } finally {f.close()}
})
test('hold opens the menu without cycling before or after release', async () => {
 const f = await fixture()
 try {
  await act(async()=>{pointer(f.button,'pointerdown');await pause(600)})
  expect(f.changes).toEqual([])
  expect(document.querySelector('[role="menu"]')).not.toBeNull()
  await act(async()=>{pointer(f.button,'pointerup');f.button.click()})
  expect(f.changes).toEqual([])
 } finally {f.close()}
})
test('disabled control cannot cycle', async () => {
 const f = await fixture(true)
 try {await act(async()=>{f.button.click()});expect(f.changes).toEqual([]);expect(f.button.disabled).toBe(true)} finally {f.close()}
})
test('keyboard menu shortcut and Escape retain value and restore trigger focus', async () => {
 const f = await fixture()
 try {
  await act(async()=>{f.button.focus()})
  await act(async()=>{f.button.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',altKey:true,bubbles:true}))})
  expect(document.querySelector('[role="menu"]')).not.toBeNull()
  expect(f.changes).toEqual([])
  await act(async()=>{document.activeElement?.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await pause(50)})
  expect(document.querySelector('[role="menu"]')).toBeNull()
  expect(f.changes).toEqual([])
  expect(document.activeElement).toBe(f.button)
 } finally {f.close()}
})
test('touch hold and release do not cycle, and cancellation never opens a menu', async () => {
 const f = await fixture()
 try {
  await act(async()=>{pointer(f.button,'pointerdown','touch');pointer(f.button,'pointercancel','touch');await pause(600)})
  expect(document.querySelector('[role="menu"]')).toBeNull()
  expect(f.changes).toEqual([])
  await act(async()=>{pointer(f.button,'pointerdown','touch');await pause(600)})
  expect(document.querySelector('[role="menu"]')).not.toBeNull()
  await act(async()=>{pointer(f.button,'pointerup','touch');f.button.click()})
  expect(f.changes).toEqual([])
 } finally {f.close()}
})

test('becoming disabled during a hold suppresses the pending menu and release', async () => {
 const f = await fixture()
 try {
  await act(async () => { pointer(f.button,'pointerdown'); await pause(100) })
  await f.update({ disabled: true })
  await act(async () => { await pause(550); pointer(f.button,'pointerup'); f.button.click() })
  expect(document.querySelector('[role="menu"]')).toBeNull()
  expect(f.changes).toEqual([])
  await f.update({ disabled: false })
  expect(document.querySelector('[role="menu"]')).toBeNull()
  await act(async () => { f.button.click() })
  expect(f.changes).toEqual(['b'])
 } finally { f.close() }
})
test('empty or newly unavailable choices cannot open or cycle and do not reopen after recovery', async () => {
 const f = await fixture()
 try {
  await act(async () => { pointer(f.button,'pointerdown'); await pause(100) })
  await f.update({ options: [] })
  await act(async () => { await pause(550); pointer(f.button,'pointerup'); f.button.click() })
  expect(document.querySelector('[role="menu"]')).toBeNull()
  expect(f.button.disabled).toBe(true)
  expect(f.changes).toEqual([])
  await f.update({ options: [{id:'a',label:'A'},{id:'b',label:'B'}] })
  expect(document.querySelector('[role="menu"]')).toBeNull()
  await act(async () => { pointer(f.button,'pointerdown'); await pause(550) })
  expect(document.querySelector('[role="menu"]')).not.toBeNull()
  await f.update({ options: [{id:'a',label:'A',isDisabled:true},{id:'b',label:'B',isDisabled:true}] })
  expect(document.querySelector('[role="menu"]')).toBeNull()
  expect(f.changes).toEqual([])
 } finally { f.close() }
})
test('a removed choice cannot be activated from a menu opened before the options changed', async () => {
 const f = await fixture()
 try {
  await act(async () => { pointer(f.button,'pointerdown'); await pause(550) })
  await f.update({ options: [{id:'a',label:'A'},{id:'c',label:'C'}] })
  expect([...document.querySelectorAll('[role="menuitemradio"]')].some(item => item.textContent === 'B')).toBe(false)
  await act(async () => { pointer(f.button,'pointerup'); f.button.click() })
  expect(f.changes).toEqual([])
 } finally { f.close() }
})

test('a controlled value change during hold is reflected without a stale release cycle', async () => {
 const f = await fixture()
 try {
  await act(async () => { pointer(f.button,'pointerdown'); await pause(100) })
  await f.update({ value: 'b' })
  await act(async () => { await pause(550) })
  expect(document.querySelector('[role="menuitemradio"][aria-checked="true"]')?.textContent).toBe('B')
  await act(async () => { pointer(f.button,'pointerup'); f.button.click() })
  expect(f.changes).toEqual([])
  await act(async () => { document.activeElement?.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); await pause(50) })
  await act(async () => { f.button.click() })
  expect(f.changes).toEqual(['a'])
 } finally { f.close() }
})
