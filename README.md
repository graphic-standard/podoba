# podoba

The universal design system. **React Aria Components + Tailwind**, seeded from
graphic-standard's `@app/ui`. App-agnostic on purpose — consumed by graphic-standard,
gs-platform, pramen (editor + admin), praha-sportovni, and everything built next.

> _podoba_ (cs.) — *form, likeness, appearance.*

## Packages

| Package | What it is | Depends on |
|---|---|---|
| [`@podoba/tokens`](packages/tokens) | Design tokens: static `tokens.json` (DTCG) + generated `variables.css`. Framework-agnostic — usable from React, email, native, docs. | — |
| [`@podoba/tailwind`](packages/tailwind) | Tailwind preset binding the token CSS-vars to `theme.extend`. Consumers do `presets: [podobaPreset]`. | tailwindcss (peer) |
| [`@podoba/react`](packages/react) | The components: React Aria primitives + layout, built with `uic`. | `@podoba/tokens`, `@podoba/tailwind`, react (peer) |

A consumer that only needs the palette (an email renderer, a native app, a docs site)
pulls `@podoba/tokens` alone and never drags in React or Tailwind.

## Status

Scaffold only. Nothing has moved from `@app/ui` yet — see [EXTRACTION.md](EXTRACTION.md)
for the exact file-move manifest, what stays behind in GS, and the couplings to sever.
