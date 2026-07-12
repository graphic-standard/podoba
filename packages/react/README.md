# @podoba/react

The universal component library — React Aria Components + Tailwind, composed with `uic`.

```tsx
import { Button, Dialog, Select } from "@podoba/react";
```

Requires the token CSS + the Tailwind preset in the consuming app:

```ts
// app root
import "@podoba/tokens/variables.css";
// tailwind.config.ts
import podobaPreset from "@podoba/tailwind";
export default { presets: [podobaPreset], content: ["./src/**/*.{ts,tsx}", "./node_modules/@podoba/react/src/**/*.{ts,tsx}"] };
```

> Note the second `content` glob: because `@podoba/react` ships class strings (not
> compiled CSS), the consuming app's Tailwind must scan podoba's source so its utilities
> are generated.

Scope is **atomic primitives + layout only**. GS product patterns (schema renderer,
delivery/approval modals, brand page header) live in GS and consume this. See
[../../EXTRACTION.md](../../EXTRACTION.md).
