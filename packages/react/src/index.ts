// @podoba/react — the universal component library.
//
// React Aria Components + Tailwind, composed with `uic`. Seeded from graphic-standard's
// @app/ui — atomic primitives + layout, PLUS the label-driven product patterns
// (delivery/approval modals, brand header, stats/dashboard). Podoba is the single
// source of truth for UI. Only GS-DOMAIN-coupled UI (the @app/schema-driven component
// renderer) stays in GS and consumes this. See ../../EXTRACTION.md.

// --- factory ---
export { uic, uiconfig, type ConfigVariants, type NoInfer } from "./utils/uic";

// --- primitives ---
export * from "./components/button";
export * from "./components/input";
export * from "./components/textarea";
export * from "./components/rich-text-editor";
export * from "./components/focus-field";
export * from "./components/focus-context";
export * from "./components/checkbox";
export * from "./components/radio";
export * from "./components/switch";
export * from "./components/select";
export * from "./components/combobox";
export * from "./components/multiselect";
export * from "./components/number-field";
export * from "./components/search-field";
export * from "./components/slider";
export * from "./components/tag-group";
export * from "./components/file-upload";
export * from "./components/date-field";
export * from "./components/date-picker";
export * from "./components/dialog";
export * from "./components/dropdown-menu";
export * from "./components/context-menu";
export * from "./components/tooltip";
export * from "./components/toast";
export * from "./components/disclosure";
export * from "./components/collapsible-card";
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

// --- product patterns (label-driven; no domain coupling) ---
export * from "./components/brand-page-header";
export * from "./components/stats-card";
export * from "./components/dashboard-grid";
export * from "./components/task-approval-modal";
export * from "./components/request-changes-modal";
export * from "./components/delivery/download-modal";
export * from "./components/delivery/send-to-print-modal";
export * from "./components/delivery/publish-modal";
export * from "./components/delivery/delivery-status-module";
