// @podoba/react — the universal component library.
//
// React Aria Components + Tailwind, composed with `uic`. Seeded from graphic-standard's
// @app/ui — atomic primitives + layout ONLY. Product-specific components (schema
// renderer, delivery/approval modals, brand headers) stay in GS and consume this.
// See ../../EXTRACTION.md.

// --- factory ---
export { uic, uiconfig, type ConfigVariants, type NoInfer } from "./utils/uic";

// --- primitives ---
export * from "./components/button";
export * from "./components/input";
export * from "./components/textarea";
export * from "./components/checkbox";
export * from "./components/radio";
export * from "./components/switch";
export * from "./components/select";
export * from "./components/combobox";
export * from "./components/multiselect";
export * from "./components/dialog";
export * from "./components/dropdown-menu";
export * from "./components/context-menu";
export * from "./components/tooltip";
export * from "./components/toast";
export * from "./components/disclosure";
export * from "./components/tabs";
export * from "./components/section-tabs";
export * from "./components/separator";
export * from "./components/text";
export * from "./components/view-toggle";

// --- layout ---
export * from "./layout/card";
export * from "./layout/section";
export * from "./layout/page-container";
export * from "./layout/app-shell";
export * from "./layout/topbar";
export * from "./layout/persistent-page-shell";
