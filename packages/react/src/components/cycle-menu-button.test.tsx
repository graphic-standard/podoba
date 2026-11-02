import { expect, test } from 'bun:test'

// React Aria retains document-bound focus state across imports. Run this DOM
// lifecycle in its own process so other suites can replace their Happy DOM safely.
if (process.env.PODOBA_CYCLE_MENU_TEST_WORKER === '1') {
 await import('./cycle-menu-button.test.behavior')
} else {
 test('CycleMenuButton pointer, touch, keyboard and dynamic-option interactions', async () => {
  const child = Bun.spawn([process.execPath, 'test', import.meta.path], {
   cwd: process.cwd(),
   env: { ...process.env, PODOBA_CYCLE_MENU_TEST_WORKER: '1' },
   stdout: 'pipe', stderr: 'pipe',
  })
  const [code, stdout, stderr] = await Promise.all([child.exited, new Response(child.stdout).text(), new Response(child.stderr).text()])
  expect({ code, output: code === 0 ? '' : stdout + stderr }).toEqual({ code: 0, output: '' })
 }, 30_000)
}
