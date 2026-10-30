# @podoba/tailwind

The shared Tailwind v4 theme. Binds `@podoba/tokens` CSS custom properties to Tailwind's
`@theme`, so `@podoba/react` primitives (and your app code) can use utilities like
`bg-surface`, `text-fg-muted`, `text-heading2`, `rounded-panel`. The theme is
`@theme inline`, so those utilities compile to `var(--color-surface)` and friends, never
to a copied value.

It is a CSS file, not a JS preset, and needs Tailwind v4:

```css
/* app.css */
@import "tailwindcss";
@import "@podoba/tokens/variables.css";
@import "@podoba/tailwind";

@source "./**/*.{ts,tsx}"; /* you own your source globs */
@source "../node_modules/@podoba/react/src/**/*.{ts,tsx}";
```

The theme is intentionally **content-less**. A theme that hardcodes source globs (as
`@app/ui` did, pointing at `../../apps/web`) breaks every other consumer.

An app that does not run Tailwind at all does not need this package: it imports the
prebuilt `@podoba/react/styles.css` instead. See the
[`@podoba/react` README](../react/README.md) for both setups and why an app picks one.
