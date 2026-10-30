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

## Dependencies

`bun.lock` is committed, and CI and the publish job install with
`bun install --frozen-lockfile`, so they run exactly what the lockfile pins. Change a
dependency with `bun add` / `bun remove` (or edit `package.json` and run `bun install`)
and commit the updated `bun.lock` in the same change; CI fails when the two disagree.

`bunfig.toml` refuses versions published in the last 12 hours (`minimumReleaseAge`).
When an install fails with `blocked by minimum-release-age`, widen the semver range so
an older version satisfies it, or wait. Don't lower the setting.

CI runs bun 1.3.14 (`packageManager` in `package.json`); a newer local bun reads the
same lockfile, but regenerate it with that version if its format ever changes:
`bunx bun@1.3.14 install`.
