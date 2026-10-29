import { GlobalRegistrator } from '@happy-dom/global-registrator'
GlobalRegistrator.register()
import { act, useLayoutEffect, useRef, useState } from 'react'
import { afterAll, expect, test } from 'bun:test'
const { createRoot } = await import('react-dom/client')
const { Input } = await import('./input')
const { Textarea } = await import('./textarea')
const { ModalOverlay, ModalSurface, ModalDialog } = await import('./dialog')
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
afterAll(() => GlobalRegistrator.unregister())
for (const Field of [Input, Textarea]) {
	test(`${Field.name} hands dialog focus to its editable control`, async () => {
		const host = document.createElement('div')
		document.body.append(host)
		const root = createRoot(host)
		try {
			await act(async () => {
				root.render(
					<ModalOverlay isOpen>
						<ModalSurface>
							<ModalDialog aria-label="Settings">
								<Field label="Name" autoFocus />
							</ModalDialog>
						</ModalSurface>
					</ModalOverlay>,
				)
			})
			await act(async () => {
				await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
			})
			expect(document.activeElement?.tagName).toBe(Field === Input ? 'INPUT' : 'TEXTAREA')
		} finally {
			act(() => root.unmount())
			host.remove()
		}
	})
}

for (const Field of [Input, Textarea]) {
	test(`${Field.name} does not take focus from another field`, async () => {
		function Surface() {
			const ref = useRef<HTMLButtonElement>(null)
			useLayoutEffect(() => {
				ref.current?.focus()
			}, [])
			return (
				<>
					<Field label="Name" autoFocus />
					<button ref={ref}>Keep focus</button>
				</>
			)
		}
		const host = document.createElement('div')
		document.body.append(host)
		const root = createRoot(host)
		try {
			await act(async () => root.render(<Surface />))
			await act(async () => {
				await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
			})
			expect(document.activeElement?.textContent).toBe('Keep focus')
		} finally {
			act(() => root.unmount())
			host.remove()
		}
	})
}

test('an explicitly added inline field receives focus from its trigger', async () => {
	function Surface() {
		const [editing, setEditing] = useState(false)
		return (
			<>
				<button onClick={() => setEditing(true)}>Add example</button>
				{editing ? <Textarea label="Example" autoFocus /> : null}
			</>
		)
	}
	const host = document.createElement('div')
	document.body.append(host)
	const root = createRoot(host)
	try {
		await act(async () => root.render(<Surface />))
		await act(async () => {
			const trigger = host.querySelector('button')
			trigger?.focus()
			trigger?.click()
		})
		await act(async () => {
			await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
		})
		expect(document.activeElement === host.querySelector('textarea')).toBe(true)
	} finally {
		act(() => root.unmount())
		host.remove()
	}
})
