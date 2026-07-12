# @podoba/tailwind

The shared Tailwind preset. Binds `@podoba/tokens` CSS custom properties to Tailwind's
`theme.extend`, so `@podoba/react` primitives (and your app code) can use utilities like
`bg-surface`, `text-fg-muted`, `text-heading2`, `rounded-panel`.

```ts
// tailwind.config.ts in a consuming app
import podobaPreset from "@podoba/tailwind";

export default {
	presets: [podobaPreset],
	content: ["./src/**/*.{ts,tsx}"], // you own your content globs
};
```

Also `import "@podoba/tokens/variables.css"` once at your app root so the `var(--…)`
the preset points at actually resolve.

The preset is intentionally **content-less** — a preset that hardcodes `content` globs
(as `@app/ui` did, pointing at `../../apps/web`) breaks every other consumer.
