import podobaPreset from "@podoba/tailwind";
import type { Config } from "tailwindcss";

// Reuse the design-system preset, and scan BOTH the gallery source and the
// @podoba/react component source — the utility classes live in the library, so
// Tailwind must see them to generate the CSS.
export default {
	presets: [podobaPreset],
	content: ["./index.html", "./src/**/*.{ts,tsx}", "../../packages/react/src/**/*.{ts,tsx}"],
} satisfies Config;
