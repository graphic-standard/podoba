import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
// After index.css (which pulls in variables.css): fonts.css re-points --font-sans and
// the tracking scale at NC Fontina, and only wins the :root cascade when it comes last.
import "@podoba/tokens/fonts.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
