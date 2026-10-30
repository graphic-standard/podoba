// Build the prebuilt stylesheet published as `@podoba/react/styles.css`.
//
// Tailwind compiles every class string in src/ (components, layout, editor) into
// one CSS file, so an app can use podoba without running Tailwind itself. The
// result still reads every design value from `@podoba/tokens/variables.css`: the
// theme in @podoba/tailwind is `@theme inline`, so utilities emit `var(--…)`.
//
// Runs on `prepack`, so `npm publish` (scripts/publish.ts) always ships a fresh
// file. `bun run build:css` builds it by hand into dist/ (gitignored).

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const PKG = new URL("..", import.meta.url).pathname;
const INPUT = `${PKG}scripts/styles.css`;
const OUTPUT = `${PKG}dist/styles.css`;

mkdirSync(`${PKG}dist`, { recursive: true });

const res = spawnSync(`${PKG}node_modules/.bin/tailwindcss`, ["-i", INPUT, "-o", OUTPUT, "--minify"], {
	cwd: PKG,
	stdio: "inherit",
});
if (res.status !== 0) throw new Error(`tailwindcss failed (exit ${res.status})`);

// The inline theme maps each key onto the token of the same name, and Tailwind
// still writes those keys into `@layer theme` as `--color-surface:var(--color-surface)`.
// They only work because the unlayered token file outranks the layer; loaded in a
// layer of its own, or read inside a shadow root through `:host`, each one is a
// cycle that wipes the token. They carry no value, so drop them.
const css = readFileSync(OUTPUT, "utf8");
let dropped = 0;
const cleaned = css.replace(/(?<=[{;])--([\w-]+):var\(--\1\);?/g, () => {
	dropped++;
	return "";
});
writeFileSync(OUTPUT, cleaned);

console.log(`✓ dist/styles.css ${(Buffer.byteLength(cleaned) / 1000).toFixed(1)} kB (dropped ${dropped} self-referencing theme vars)`);
