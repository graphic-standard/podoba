# Font binaries

`@font-face` in [`../fonts.css`](../fonts.css) references the file below by exact
name. Drop the woff2 here and it's bundled and served by any consumer that
imports `@podoba/tokens/fonts.css`.

NC Fontina is a **variable font** — a single file covers the whole weight axis:

| File                         | Axis    | Covers                                            |
| ---------------------------- | ------- | ------------------------------------------------- |
| `nc-fontina-variable.woff2`  | `wght`  | 400 `font-normal` · 500 `font-medium` · 600 `font-semibold` · 700 `font-bold` |

The `@font-face` declares `font-weight: 100 900` (a range). Narrow it in
`fonts.css` to the font's real `wght` axis if it's smaller (e.g. `400 700`).

Italics: this upright file only. If NC Fontina has a separate italic file, add a
second `@font-face` with `font-style: italic`; otherwise the browser synthesizes
obliques where `italic` is used (e.g. the rich-text editor).
