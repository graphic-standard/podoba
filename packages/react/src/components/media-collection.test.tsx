import { expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { MediaCarousel, MediaPanelCard } from './media-collection'
test('carousel uses GS icon controls and bottom-left caption card and circular inverted arrows',()=>{
 const html=renderToStaticMarkup(<MediaCarousel items={[{id:'one',title:'First photograph',preview:<img alt="First"/>},{id:'two',title:'Second photograph',preview:<img alt="Second"/>}]} label="Photographs" previousLabel="Previous" nextLabel="Next" />)
 expect(html).toContain('aria-label="Next"')
 expect(html).toContain('h-9 w-9')
 expect(html).toContain('First photograph')
 expect(html).toContain('1 / 2')
 expect(html).not.toContain('shadow-md')
 expect(html).toContain('max-w-3/4 rounded-lg bg-surface p-4')
 expect(html).toContain('rounded-full bg-surface-inverted')
 expect(html).toContain('<svg')
 expect(html).toContain('data-media-readability')
})

test('bottom panel title has a readable surface without a vignette over the illustration', () => {
 const html = renderToStaticMarkup(<MediaPanelCard title="Framing" titlePosition="bottom" preview={<img alt="Original diagram" />} onOpen={() => {}} />)
 expect(html).toContain('aria-label="Framing"')
 expect(html).toContain('mt-auto max-w-full self-start rounded-lg bg-surface')
 expect(html).toContain('Original diagram')
})

test('diagrams stay contained and preview-only cards have no empty gap', async () => {
 const { PreviewMetadataCard } = await import('./preview-metadata-card')
 const empty = renderToStaticMarkup(<PreviewMetadataCard title="Font" preview={<span>Preview</span>}>{null}</PreviewMetadataCard>)
 expect(empty).not.toContain('class="mt-4"')
 expect(renderToStaticMarkup(<PreviewMetadataCard title="Font" preview={null}>{0}</PreviewMetadataCard>)).toContain('class="mt-4">0')
 expect(renderToStaticMarkup(<MediaCarousel items={[]} label="Empty" previousLabel="Previous" nextLabel="Next" />)).toBe('')
 const html = renderToStaticMarkup(<MediaCarousel items={[{id:'a',title:'Diagram',preview:<img alt="Diagram"/>}]} label="Diagrams" previousLabel="Previous" nextLabel="Next" />)
 expect(html).toContain('object-contain')
 expect(html).not.toContain('aria-label="Next"')
})

test('keyboard navigation retains selected-item identity and photo crop policy', async () => {
 const { GlobalRegistrator } = await import('@happy-dom/global-registrator')
 const ownsDocument = !globalThis.document
 if (ownsDocument) GlobalRegistrator.register()
 const { act } = await import('react')
 const { createRoot } = await import('react-dom/client')
 ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
 const host = document.createElement('div');document.body.append(host)
 const root = createRoot(host), opened:number[] = []
 const items=[{id:'wide',title:'Landscape',preview:<img alt="Landscape"/>},{id:'tall',title:'Portrait',preview:<img alt="Portrait"/>}]
 try {
  await act(async()=>root.render(<MediaCarousel items={items} imageFit="orientation" label="Photos" previousLabel="Previous" nextLabel="Next" onOpen={index=>opened.push(index)}/>))
  const group=host.querySelector('[role="group"]')!
  const load=async(width:number,height:number)=>{const img=host.querySelector('img')!;Object.defineProperties(img,{naturalWidth:{value:width,configurable:true},naturalHeight:{value:height,configurable:true}});await act(async()=>img.dispatchEvent(new Event('load')))}
  await load(1200,800)
  expect(host.innerHTML).toContain('object-cover')
  await act(async()=>group.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true})))
  await load(800,1200)
  expect(host.textContent).toContain('2 / 2')
  expect(host.innerHTML).not.toContain('object-cover')
  expect(host.querySelector('[aria-label="Next"]')).toBeNull()
  await act(async()=>host.querySelector<HTMLButtonElement>('[aria-label="Portrait"]')?.click())
  expect(opened).toEqual([1])
  await act(async()=>group.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true})))
  expect(host.textContent).toContain('1 / 2')
  expect(host.querySelector('[aria-label="Previous"]')).toBeNull()
 }finally{await act(async()=>root.unmount());host.remove();if(ownsDocument)GlobalRegistrator.unregister()}
})
