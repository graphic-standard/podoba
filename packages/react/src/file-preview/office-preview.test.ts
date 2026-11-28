import { GlobalRegistrator } from '@happy-dom/global-registrator'
GlobalRegistrator.register()
import { afterAll, describe, expect, test } from 'bun:test'
import { strToU8, zipSync } from 'fflate'
import { officePreviewSections } from './document-preview'
afterAll(() => GlobalRegistrator.unregister())

const zip = (files: Record<string, string>) => zipSync(Object.fromEntries(Object.entries(files).map(([path, text]) => [path, strToU8(text)])))
const w = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'
const s = 'xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"'

describe('officePreviewSections', () => {
	test('reads the paragraphs of a Word document', () => {
		const docx = zip({
			'word/document.xml': `<w:document ${w}><w:body><w:p><w:r><w:t>Hello </w:t></w:r><w:r><w:t>world</w:t></w:r></w:p><w:p><w:r><w:t>Second</w:t></w:r></w:p></w:body></w:document>`,
		})
		expect(officePreviewSections(docx)).toEqual([{ title: '', text: 'Hello world\nSecond' }])
	})

	test('reads a sheet cell by cell, with shared strings and the sheet name', () => {
		const xlsx = zip({
			'xl/workbook.xml': `<workbook ${s}><sheets><sheet name="Budget" sheetId="1"/></sheets></workbook>`,
			'xl/sharedStrings.xml': `<sst ${s}><si><t>Item</t></si><si><t>Balls</t></si></sst>`,
			'xl/worksheets/sheet1.xml': `<worksheet ${s}><sheetData><row><c r="A1" t="s"><v>0</v></c><c r="B1"><v>12</v></c></row><row><c r="A2" t="s"><v>1</v></c></row></sheetData></worksheet>`,
		})
		expect(officePreviewSections(xlsx)).toEqual([{ title: 'Budget', text: 'A1: Item\tB1: 12\nA2: Balls' }])
	})

	test('never decompresses parts other than the content XML', () => {
		// A broken macro part would throw if it were parsed; it is skipped instead.
		const docx = zip({
			'word/vbaProject.bin': 'plain words, not markup',
			'word/_rels/document.xml.rels': 'plain words, not markup',
			'word/document.xml': `<w:document ${w}><w:body><w:p><w:r><w:t>Body</w:t></w:r></w:p></w:body></w:document>`,
		})
		expect(officePreviewSections(docx)[0]?.text).toBe('Body')
	})

	test('refuses a DOCTYPE or entity declaration', () => {
		const docx = zip({
			'word/document.xml': `<!DOCTYPE d [<!ENTITY x "boom">]><w:document ${w}><w:body><w:p><w:r><w:t>&x;</w:t></w:r></w:p></w:body></w:document>`,
		})
		expect(() => officePreviewSections(docx)).toThrow('PREVIEW_INVALID')
	})

	test('a document without text is unavailable', () => {
		const docx = zip({ 'word/document.xml': `<w:document ${w}><w:body><w:p/></w:body></w:document>` })
		expect(() => officePreviewSections(docx)).toThrow('PREVIEW_UNAVAILABLE')
	})

	test('a part that expands past the limit is refused', () => {
		const big = `<w:document ${w}><w:body><w:p><w:r><w:t>${'a'.repeat(17 * 1024 * 1024)}</w:t></w:r></w:p></w:body></w:document>`
		expect(() => officePreviewSections(zip({ 'word/document.xml': big }))).toThrow(/PREVIEW_(TOO_LARGE|INVALID)/)
	})
})
