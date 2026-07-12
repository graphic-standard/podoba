// @podoba/tokens — design tokens for the universal design system.
//
// This package ships the *output* of GS's token pipeline, not the authoring
// machinery. The theme-resolution cascade in @app/tokens (theme-resolver.ts)
// imports @app/schema's token model and stays a GS concern — it generates
// `variables.css` and writes it here. Consumers only ever need:
//
//   import "@podoba/tokens/variables.css";   // the CSS custom properties
//   import tokens from "@podoba/tokens/tokens.json";  // raw DTCG (optional)
//
// See ../../EXTRACTION.md → "Coupling to sever #1".

export {};
