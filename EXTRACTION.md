# Extraction manifest: `@app/ui` + `@app/tokens` → `@podoba/*`

Source: `~/Developer/graphic-standard/graphic-standard/packages/{ui,tokens}`
Target: this repo (`~/Developer/graphic-standard/podoba`)

Nothing has moved yet. This is the plan to review before any code is touched.

---

## 1. What moves to `@podoba/react`  (atomic primitives + layout)

From `@app/ui/src/components/` — each with its `.examples.tsx` + `.test.tsx`:

| File | → |
|---|---|
| `button.tsx` | `components/button.tsx` |
| `input.tsx` | `components/input.tsx` |
| `textarea.tsx` | `components/textarea.tsx` |
| `checkbox.tsx` | `components/checkbox.tsx` |
| `radio.tsx` | `components/radio.tsx` |
| `switch.tsx` | `components/switch.tsx` |
| `select.tsx` | `components/select.tsx` |
| `dialog.tsx` | `components/dialog.tsx` |
| `dropdown-menu.tsx` | `components/dropdown-menu.tsx` |
| `context-menu.tsx` | `components/context-menu.tsx` |
| `tooltip.tsx` | `components/tooltip.tsx` |
| `toast.tsx` | `components/toast.tsx` |
| `disclosure.tsx` | `components/disclosure.tsx` |
| `tabs.tsx` | `components/tabs.tsx` |
| `section-tabs.tsx` | `components/section-tabs.tsx` |
| `separator.tsx` | `components/separator.tsx` |
| `text.tsx` | `components/text.tsx` |
| `view-toggle.tsx` | `components/view-toggle.tsx` |

From `@app/ui/src/layout/`:

| File | → |
|---|---|
| `card.tsx` | `layout/card.tsx` |
| `section.tsx` | `layout/section.tsx` |
| `page-container.tsx` | `layout/page-container.tsx` |
| `app-shell.tsx` | `layout/app-shell.tsx` |
| `topbar.tsx` | `layout/topbar.tsx` |
| `persistent-page-shell.tsx` | `layout/persistent-page-shell.tsx` |

From `@app/ui/src/utils/`:

| File | → |
|---|---|
| `uic.ts` | `utils/uic.ts` |

Plus `components.test.tsx`, `layout.test.tsx` → alongside.

---

## 2. What moves to `@podoba/tokens`  (static output only)

| Source (`@app/tokens/src/`) | → | Note |
|---|---|---|
| `tokens.json` (1156 lines, DTCG) | `src/tokens.json` | verbatim |
| `variables.css` | `src/variables.css` | regenerate WITHOUT `@app/schema` (static) |
| `theme-resolver.ts` | ❌ **does not move** | authoring cascade, imports `@app/schema` — stays GS |
| `theme-resolver.test.ts` | ❌ | ditto |

## 3. What moves to `@podoba/tailwind`

| Source | → | Note |
|---|---|---|
| `@app/ui/tailwind.config.ts` → `theme.extend` + `plugins` | `src/index.ts` (`podobaPreset`) | drop `content` globs; drop the `../../apps/web` reference |

---

## 4. What STAYS in `@app/ui` (GS product-specific → becomes a podoba consumer)

These are **not** universal primitives. They stay in graphic-standard and import from
`@podoba/react`:

- **Schema renderer:** `component-registry.ts`, `map-schema-to-props.ts`, `component-renderer.tsx` (+ examples/test), `schema-mapper.test.ts`
- **Product modals:** `task-approval-modal.tsx`, `request-changes-modal.tsx`, `delivery/download-modal.tsx`, `delivery/send-to-print-modal.tsx`, `delivery/publish-modal.tsx`, `delivery/delivery-status-module.tsx`
- **Brand patterns:** `brand-page-header.tsx`

After extraction, `@app/ui` re-exports podoba (`export * from "@podoba/react"`) so its
consumers don't all change imports at once — a compatibility shim we can delete later.

### Borderline — flagged, default = STAY in GS, promote to podoba on a 2nd real consumer

| Component | Why borderline |
|---|---|
| `stats-card.tsx` | generic KPI card, but a dashboard/product pattern |
| `dashboard-grid.tsx` | generic grid, but "ported from gs-platform", product-shaped |

---

## 5. Couplings to sever (the actual work, not just file moves)

1. **`@podoba/tokens` ✕ `@app/schema`** — `theme-resolver.ts` imports `tokenSchema, Token, TokenValue` from `@app/schema`. Resolution: don't move the resolver; ship static `tokens.json` + `variables.css`. GS's pipeline generates them into podoba. *(This is why tokens can be dependency-free.)*
2. **Per-file `@app/schema` imports** — grep every moved component; any primitive that reaches into `@app/schema` must have that type inlined or lifted, or it isn't actually universal. (Expected: none — the schema coupling lives in the renderer, which stays.)
3. **Import rewrites in moved code** — `@app/tokens` → `@podoba/tokens`; `../tailwind.config` / theme refs → `@podoba/tailwind`; internal `../utils/uic` stays relative.
4. **`uic.ts` tailwind-merge config** — hardcodes the theme's ramps (font-size `micro…display` + `heading1-5`, spacing `nav-x`, radius `panel`). Moves with `@podoba/react` as-is; later should derive from `@podoba/tailwind` so the two can't drift. Note, don't block on it.
5. **`tailwind.config` `content` globs** — reference `../../apps/web`. A shared preset must be content-less; consumers own `content` (incl. a glob scanning `@podoba/react/src`, since podoba ships class strings not compiled CSS).

---

## 6. Order of operations

1. ✅ **DONE** — Move tokens (static `tokens.json` + `variables.css`) + tailwind preset. `@podoba/{tokens,tailwind}` typecheck green.
2. ✅ **DONE** — Move `uic` + 18 primitives + 6 layout. **No import rewrites needed** — the universal set only imported `../utils/uic` + two intra-set relatives (`section-tabs→button`, `view-toggle→tooltip`); every `@app/*` hit was docstring prose, zero code coupling. `@podoba/react` typechecks green with all 26 `.d.ts` emitted (`tsc --build --force`, exit 0).
3. ⬜ **Deferred to pass 3** — move `.examples.tsx` + `.test.tsx` (need @storybook/test + bun:test wiring; skipped to keep this pass green).
4. 🟡 **GS repoint — DONE (non-destructive) + verified.** `@app/ui/src/index.ts` now does `export * from "@podoba/react"` + keeps GS-specific exports local; the 8 staying files (brand-page-header, stats-card, task-approval-modal, request-changes-modal, delivery/*) import primitives from `@podoba/react`. `tsc --build --force` on `@app/ui` → **exit 0**. `apps/web` typecheck: only pre-existing buzola `RegisteredPage` codegen errors, **zero** `@podoba`/`@app/ui`/component errors → no regression.
   - **Wiring caveat:** dep is `"@podoba/react": "link:@podoba/react"` (local `bun link`). NOT portable/committable — other machines/CI break without the link. Committable state needs `@podoba/*` **published to npm** + version pin (like `@pramen/*`). Not published (no unprompted external publish).
   - **Phase B — DONE + verified.** Deleted the 24 duplicate primitive/layout `.tsx` sources + `utils/uic.ts` + the 2 aggregate unit tests (`components.test.tsx`, `layout.test.tsx`). **Kept** all `.examples.tsx` — they're not dead: `apps/web/src/lib/gallery.gen.ts` deep-imports them for the component gallery — and rewired their moved-module imports to `@podoba/react` (staying siblings preserved). `@app/ui` typecheck exit 0; `apps/web` = 138 errors, all buzola `RegisteredPage`-family, **0** from the deletion.
   - **Deferred to pass 3:** (a) unit tests were deleted from GS, not yet recreated in podoba; (b) examples still live in GS as gallery fixtures (importing `@podoba/react`) rather than alongside their components in podoba — cleaning that up means teaching the GS gallery generator to scan podoba too.
5. ⬜ Only then: migrate pramen editor/admin, then praha-sportovni.

### What moved (pass 1–2)
- `@podoba/tokens`: `tokens.json` (1156 lines, verbatim) + `variables.css` (68 lines, real vars — GT America fonts, gs palette). `theme-resolver` correctly left in GS.
- `@podoba/tailwind`: full `theme.extend` (colors/radius/spacing/fontFamily/fontSize ramp/tracking/keyframes/animation) + typography plugin; `content` globs dropped.
- `@podoba/react`: uic + button, input, textarea, checkbox, radio, switch, select, dialog, dropdown-menu, context-menu, tooltip, toast, disclosure, tabs, section-tabs, separator, text, view-toggle + card, section, page-container, app-shell, topbar, persistent-page-shell.
