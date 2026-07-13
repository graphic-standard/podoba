import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Minimal Vite playground. @podoba/react is consumed straight from its TS source
// (its package `main` points at src/index.ts), so Vite transpiles the library
// live — no build step, edits to components hot-reload here.
export default defineConfig({
	plugins: [react()],
	server: { port: 5273 },
});
