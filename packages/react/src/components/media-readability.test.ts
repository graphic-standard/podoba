import {describe,expect,test} from 'bun:test'
import {resolveMediaText} from './media-asset-panel'
describe('adaptive panel readability', () => {
 test('leaves calm light and dark photographs unobscured', () => {
 const light=resolveMediaText(Array.from({length:40},()=>[250,250,250] as const))
 const dark=resolveMediaText(Array.from({length:40},()=>[15,15,15] as const))
 expect(light.color).toBe('dark'); expect(light.background).toBe('none')
 expect(dark.color).toBe('white'); expect(dark.background).toBe('none')
 })
 test('protects dark text on a busy bright image with at least the approved 80% tint',()=>{
 const result=resolveMediaText([...Array.from({length:30},()=>[240,240,240] as const),...Array.from({length:10},()=>[50,50,50] as const)])
 expect(result.color).toBe('dark');expect(result.tint).toBe(255);expect(result.opacity).toBeGreaterThanOrEqual(.8)
 })
 test('keeps authored text and background overrides',()=>{
 const result=resolveMediaText([[240,240,240]],{color:'white',background:'none'})
 expect(result.color).toBe('white');expect(result.background).toBe('none');expect(result.opacity).toBe(0)
 })
})
