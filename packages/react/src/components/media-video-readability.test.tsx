import { GlobalRegistrator } from '@happy-dom/global-registrator'
const ownsDocument = !globalThis.document
if (ownsDocument) GlobalRegistrator.register()
import { afterAll, expect, test } from 'bun:test'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MediaReadableText } from './media-asset-panel'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

test('video readability follows the frame under the text and stops observing after unmount', async () => {
 const originalRaf = globalThis.requestAnimationFrame, originalCancel = globalThis.cancelAnimationFrame
 const originalResize = globalThis.ResizeObserver, originalContext = HTMLCanvasElement.prototype.getContext
 const callbacks = new Map<number, FrameRequestCallback>(); let next = 0, shade = 255, frames = 0
 globalThis.requestAnimationFrame = cb => { const id = ++next; callbacks.set(id, cb); return id }
 globalThis.cancelAnimationFrame = id => { callbacks.delete(id) }
 globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} } as typeof ResizeObserver
 HTMLCanvasElement.prototype.getContext = (() => ({
  fillStyle: '', globalCompositeOperation: '', fillRect() {}, drawImage() { frames++ },
  getImageData() { return { data: Uint8ClampedArray.from(Array.from({ length: 512 }, () => [shade, shade, shade, 255]).flat()) } },
 })) as unknown as typeof HTMLCanvasElement.prototype.getContext
 const host = document.createElement('div'); document.body.append(host); const root = createRoot(host)
 const rect = { left: 0, top: 0, width: 100, height: 40, right: 100, bottom: 40, x: 0, y: 0, toJSON() {} } as DOMRect
 const flush = async () => { const pending = [...callbacks.values()]; callbacks.clear(); await act(async () => { for (const cb of pending) cb(0) }) }
 try {
  await act(async () => root.render(<div data-media-readability><video style={{ objectFit: 'cover' }} /><MediaReadableText>Label</MediaReadableText></div>))
  const video = host.querySelector('video')!, text = host.querySelector<HTMLElement>('[data-media-text-color]')!, panel = host.querySelector<HTMLElement>('[data-media-readability]')!
  Object.defineProperties(video, { videoWidth: { value: 100 }, videoHeight: { value: 40 }, readyState: { value: 2 } })
  video.getBoundingClientRect = () => rect; text.getBoundingClientRect = () => rect; panel.getBoundingClientRect = () => rect
  await flush()
  expect(text.dataset.mediaTextColor).toBe('dark'); expect(text.dataset.mediaTextBackground).toBe('none')
  shade = 0
  await act(async () => video.dispatchEvent(new Event('timeupdate'))); await flush()
  expect(text.dataset.mediaTextColor).toBe('white'); expect(text.dataset.mediaTextBackground).toBe('none')
  expect(frames).toBeGreaterThanOrEqual(2)
  await act(async () => root.unmount()); video.dispatchEvent(new Event('timeupdate'))
  expect(callbacks.size).toBe(0)
 } finally {
  host.remove(); globalThis.requestAnimationFrame = originalRaf; globalThis.cancelAnimationFrame = originalCancel
  globalThis.ResizeObserver = originalResize; HTMLCanvasElement.prototype.getContext = originalContext
 }
})
afterAll(() => { if (ownsDocument) GlobalRegistrator.unregister() })
