# @podoba/tokens

Design tokens for podoba. Static, framework-agnostic.

```ts
import "@podoba/tokens/variables.css";        // CSS custom properties → apply on :root
import tokens from "@podoba/tokens/tokens.json"; // raw DTCG, if you need to introspect
```

- **`variables.css`** — the compiled CSS custom properties (`--color-brand-primary`, …). This is what apps load.
- **`tokens.json`** — the DTCG source (W3C Design Tokens format).
- **`fonts.css`**: optional. Bundles NC Fontina and points `--font-sans` at it, together
  with the looser `--tracking-*` scale that face is set with. Import it after `variables.css`.

## Values track Graphic Standard

`variables.css` and `tokens.json` match the GS platform's `@app/tokens` output (the
`packages/tokens/src/variables.css` it generates), plus the few tokens only podoba's
components need (`--control-height-mobile-cta`, the create-hub motion, `--shadow-mobile-cta`)
and dark values for the modal scrim. An app that themes itself like GS can load
`variables.css` alone and bring GT America through its own `@font-face`: it gets the GS
palette, type ramp and tracking without keeping a copy of the GS tokens.

The GS tracking names are not an ordered scale. `--tracking-wide` (-0.56px) and
`--tracking-wider` (-0.6px) are GS's heading and display treatments, tighter than
`--tracking-tight` (-0.2px), and GS sets its `uppercase tracking-wide` labels with them
too. That is the GS look on GT America, kept as is. Only `fonts.css` brings the
positive scale, because NC Fontina needs it.

GT America is a commercial face, so it is named in `--font-sans` / `--font-mono` but never
shipped here. Without it (or `fonts.css`), text falls back to the system sans.

## Not here on purpose

The **theme-resolution cascade** (`theme-resolver.ts` in `@app/tokens`) is authoring
machinery that imports `@app/schema`'s token model. It stays in GS and *generates* the
files above. Keeping it out is what lets `@podoba/tokens` be dependency-free and truly
app-agnostic. See [../../EXTRACTION.md](../../EXTRACTION.md).
