# podoba

The universal design system. **React Aria Components + Tailwind**, seeded from
graphic-standard's `@app/ui`. App-agnostic on purpose — consumed by graphic-standard,
gs-platform, pramen (editor + admin), praha-sportovni, and everything built next.

> _podoba_ (cs.) — *form, likeness, appearance.*

## Packages

| Package | What it is | Depends on |
|---|---|---|
| [`@podoba/tokens`](packages/tokens) | Design tokens: static `tokens.json` (DTCG) + generated `variables.css`. Framework-agnostic — usable from React, email, native, docs. | — |
| [`@podoba/tailwind`](packages/tailwind) | Tailwind v4 theme (`@import "@podoba/tailwind"`) binding the token CSS-vars to `@theme`. Only for apps that run Tailwind themselves. | tailwindcss (peer) |
| [`@podoba/react`](packages/react) | The components: React Aria primitives + layout, built with `uic`. Ships prebuilt `styles.css` for apps without Tailwind. | `@podoba/tokens`, `@podoba/tailwind`, react (peer) |

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

`bunfig.toml` refuses versions published in the last 12 hours (`minimumReleaseAge`)
whenever bun resolves them, which happens locally when `bun.lock` changes; CI only
installs what the lockfile already pins. When an install fails with
`blocked by minimum-release-age`, widen the semver range so an older version satisfies
it, or wait. Don't lower the setting.

CI takes its bun version from `packageManager` in `package.json` (currently 1.3.14), so
that is the one place to change it. A newer local bun reads the same lockfile, but
regenerate it with the pinned version if its format ever changes:
`bunx bun@1.3.14 install`.

`scripts/version.ts` bumps the workspace versions recorded in `bun.lock` along with the
manifests (bun leaves them stale on its own), so a release commit includes `bun.lock`.
