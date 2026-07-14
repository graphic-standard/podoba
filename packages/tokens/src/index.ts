// @podoba/tokens — design tokens for the universal design system.
//
// This package ships the *output* of GS's token pipeline, not the authoring
// machinery. The theme-resolution cascade in @app/tokens (theme-resolver.ts)
// imports @app/schema's token model and stays a GS concern — it generates
// `variables.css` and writes it here. Consumers only ever need:
//
//   import "@podoba/tokens/variables.css";   // the CSS custom properties
//   import "@podoba/tokens/fonts.css";        // @font-face + --font-sans override (NC Fontina)
//   import tokens from "@podoba/tokens/tokens.json";  // raw DTCG (optional)
//
// fonts.css is hand-authored (not generated) — it bundles the web fonts and
// overrides --font-sans; keep it imported AFTER variables.css so the override wins.
//
// See ../../EXTRACTION.md → "Coupling to sever #1".

export {};
