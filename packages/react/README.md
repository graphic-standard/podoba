# @podoba/react

The universal component library — React Aria Components + Tailwind, composed with `uic`.

```tsx
import { Button, Dialog, Select } from "@podoba/react";
```

The components carry Tailwind class strings. An app gets the CSS for them in one of
two ways. **Pick one, never both.**

### A. Prebuilt CSS (no Tailwind in the app)

```ts
// app root
import "@podoba/tokens/variables.css";
import "@podoba/tokens/fonts.css"; // optional: NC Fontina, see @podoba/tokens
import "@podoba/react/styles.css";
```

`styles.css` is compiled from every class in the published source, the editor
(`@podoba/react/editor`) included, together with Tailwind's preflight reset. Any bundler
that follows package `exports` and bundles CSS imports picks it up: `Bun.build`, Vite,
esbuild. About 113 kB minified, 18 kB gzip.

Everything the podoba theme defines (colours, type ramp, radii, shadows, motion) is read
from `@podoba/tokens/variables.css` through `var(--…)`, and the file declares none of the
token properties itself, so restyle by overriding them after the token file (or under
`[data-theme="dark"]`). What stays fixed is what the theme does not cover: Tailwind's
stock scale (spacing, a few neutral greys, black and white, `shadow-lg`), the
`prose` colours of the editor, and the odd arbitrary value in a component. Your own CSS wins over the utilities without
`!important`: they sit in Tailwind's cascade layers, and unlayered rules beat layered
ones.

The file only contains utilities podoba itself uses. A class you pass through
`className` is styled only if podoba happens to use it too, so style your own markup
with plain CSS and the token variables. If you want Tailwind utilities in your own code,
use B instead.

### B. Your own Tailwind v4 scans podoba's source

```css
/* app.css */
@import "tailwindcss";
@import "@podoba/tokens/variables.css";
@import "@podoba/tailwind";

/* v4 skips node_modules when it detects sources, so name podoba's source. */
@source "../node_modules/@podoba/react/src/**/*.{ts,tsx}";
```

This is what Graphic Standard does. Point `@source` at `src/`, not at the package
root: the root also holds `dist/styles.css`, and Tailwind would read its class names as
candidates too.

### Why not both

`styles.css` next to any Tailwind build of the app's own puts two stylesheets into the
same `theme` / `base` / `utilities` layers, and inside one layer the later stylesheet
wins. Tailwind orders a variant after the plain utility it overrides only within one
build. So if the app's build also emits `p-2` and comes after `styles.css`, a podoba
element with `p-2 sm:p-4` keeps `p-2` on wide screens. If the app's Tailwind scans
podoba's source as well, nothing breaks, but every utility and the reset ship twice.

Scope is **atomic primitives + layout only**. GS product patterns (schema renderer,
delivery/approval modals, brand page header) live in GS and consume this. See
[../../EXTRACTION.md](../../EXTRACTION.md).

`RoundCheckToggle` is the shared circular GS annotation control. Supply a translated
`aria-label`, `isSelected`, `onChange`, and optionally `isDisabled`; it owns the
24px green checked appearance and React Aria keyboard/pressed-state behavior.
