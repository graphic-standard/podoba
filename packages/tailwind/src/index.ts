// @podoba/tailwind — shared Tailwind preset for the design system.
//
// Binds @podoba/tokens' CSS custom properties (see @podoba/tokens/variables.css)
// to Tailwind's theme, so primitives reference `bg-surface` / `text-fg-muted` /
// `text-heading2` / `rounded-panel` and resolve to `var(--…)`.
//
// Ported verbatim from @app/ui/tailwind.config.ts `theme.extend` + plugins.
// Deliberately CONTENT-LESS: a shared preset must not hardcode `content` globs
// (the source pointed at ../../apps/web). Each consuming app owns its `content`.
//
//   import podobaPreset from "@podoba/tailwind";
//   export default { presets: [podobaPreset], content: ["./src/**/*.{ts,tsx}"] };
//
// NOTE: custom scale keys here (fontSize `micro`…`display`/`heading1-5`, spacing
// `nav-x`, borderRadius `panel`) are mirrored in @podoba/react's uic tailwind-merge
// config so conflicting utilities dedupe correctly. Keep the two in sync.

import typography from "@tailwindcss/typography";
import type { Config } from "tailwindcss";

export const podobaPreset: Omit<Config, "content"> = {
	theme: {
		extend: {
			colors: {
				brand: {
					DEFAULT: "var(--color-brand-primary)",
					primary: "var(--color-brand-primary)",
					secondary: "var(--color-brand-secondary)",
					green: "var(--color-brand-green)",
				},
				surface: {
					DEFAULT: "var(--color-surface)",
					muted: "var(--color-surface-muted)",
					card: "var(--color-surface-card)",
					inverted: "var(--color-surface-inverted)",
					placeholder: "var(--color-surface-placeholder)",
				},
				fg: {
					DEFAULT: "var(--color-fg)",
					muted: "var(--color-fg-muted)",
					subtle: "var(--color-fg-subtle)",
					inverted: "var(--color-fg-inverted)",
				},
				accent: {
					strong: "var(--color-accent-strong)",
					yellow: "var(--color-accent-yellow)",
					mint: "var(--color-accent-mint)",
					"green-light": "var(--color-accent-green-light)",
					pink: "var(--color-accent-pink)",
				},
				neutral: {
					600: "var(--color-neutral-600)",
				},
				border: {
					DEFAULT: "var(--color-border)",
				},
				danger: {
					DEFAULT: "var(--color-danger)",
					fg: "var(--color-danger-fg)",
				},
				success: {
					DEFAULT: "var(--color-success)",
					fg: "var(--color-success-fg)",
				},
				ring: {
					DEFAULT: "var(--color-ring)",
				},
			},
			borderRadius: {
				sm: "var(--radius-sm)",
				md: "var(--radius-md)",
				lg: "var(--radius-lg)",
				xl: "var(--radius-xl)",
				"2xl": "var(--radius-2xl)",
				panel: "var(--radius-panel)",
			},
			spacing: {
				xs: "var(--space-xs)",
				sm: "var(--space-sm)",
				md: "var(--space-md)",
				lg: "var(--space-lg)",
				xl: "var(--space-xl)",
				"nav-x": "var(--space-nav-x)",
			},
			fontFamily: {
				sans: "var(--font-sans)",
				mono: "var(--font-mono)",
			},
			// NC Fontina reads best light, so the whole weight scale is shifted down one
			// step (-100 from Tailwind's defaults): light 300→200, normal 400→300,
			// medium 500→400, semibold 600→500, bold 700→600. Every value stays inside
			// NC Fontina's 200–700 wght axis. The unused extremes (thin/extralight/
			// extrabold/black) are left at Tailwind defaults — they fall outside the axis.
			fontWeight: {
				light: "200",
				normal: "300",
				medium: "400",
				semibold: "500",
				bold: "600",
			},
			fontSize: {
				micro: "var(--font-size-micro)",
				caption: "var(--font-size-caption)",
				label: "var(--font-size-label)",
				compact: "var(--font-size-compact)",
				callout: "var(--font-size-callout)",
				body: "var(--font-size-body)",
				subtitle: "var(--font-size-subtitle)",
				title: "var(--font-size-title)",
				headline: "var(--font-size-headline)",
				display: "var(--font-size-display)",
				heading1: ["var(--font-size-heading1)", { lineHeight: "var(--line-height-heading1)" }],
				heading2: ["var(--font-size-heading2)", { lineHeight: "var(--line-height-heading2)" }],
				heading3: ["var(--font-size-heading3)", { lineHeight: "var(--line-height-heading3)" }],
				heading4: ["var(--font-size-heading4)", { lineHeight: "var(--line-height-heading4)" }],
				heading5: ["var(--font-size-heading5)", { lineHeight: "var(--line-height-heading5)" }],
			},
			letterSpacing: {
				tight: "var(--tracking-tight)",
				normal: "var(--tracking-normal)",
				wide: "var(--tracking-wide)",
				wider: "var(--tracking-wider)",
			},
			keyframes: {
				"expand-cta": {
					from: { opacity: "0", transform: "translateY(-2px)" },
					to: { opacity: "1", transform: "translateY(0)" },
				},
				"lightbox-in": {
					from: { opacity: "0", transform: "translateX(24%)" },
					to: { opacity: "1", transform: "translateX(0)" },
				},
			},
			animation: {
				"expand-cta": "expand-cta 220ms cubic-bezier(0.16, 1, 0.3, 1)",
				"lightbox-in": "lightbox-in 0.3s ease-out",
			},
		},
	},
	plugins: [typography],
};

export default podobaPreset;
