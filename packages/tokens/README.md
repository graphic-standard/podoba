# @podoba/tokens

Design tokens for podoba. Static, framework-agnostic.

```ts
import "@podoba/tokens/variables.css";        // CSS custom properties → apply on :root
import tokens from "@podoba/tokens/tokens.json"; // raw DTCG, if you need to introspect
```

- **`variables.css`** — the compiled CSS custom properties (`--color-brand-primary`, …). This is what apps load.
- **`tokens.json`** — the DTCG source (W3C Design Tokens format).

## Not here on purpose

The **theme-resolution cascade** (`theme-resolver.ts` in `@app/tokens`) is authoring
machinery that imports `@app/schema`'s token model. It stays in GS and *generates* the
files above. Keeping it out is what lets `@podoba/tokens` be dependency-free and truly
app-agnostic. See [../../EXTRACTION.md](../../EXTRACTION.md).
