import {
	Button,
	Card,
	Checkbox,
	Dialog,
	DialogTrigger,
	Disclosure,
	DisclosurePanel,
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	Heading,
	Input,
	Radio,
	RadioGroup,
	Select,
	SelectItem,
	Separator,
	SectionTabs,
	Switch,
	Tab,
	TabList,
	TabPanel,
	Tabs,
	Text,
	Textarea,
	toast,
	ToastRegion,
	Tooltip,
	TooltipTrigger,
	ViewToggle,
} from "@podoba/react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

// ── gallery chrome ──────────────────────────────────────────────────────────
// A tiny local framework: a SECTIONS registry (grouped) drives both the sidebar
// nav and the canvas, `Demo` labels a single specimen. Deliberately plain — the
// point is to see the real components, not to rebuild Storybook.

function Demo({ label, children }: { label: string; children: ReactNode }) {
	return (
		<div className="flex flex-col gap-2">
			<span className="text-micro font-medium uppercase tracking-wide text-fg-subtle">{label}</span>
			<div className="flex flex-wrap items-start gap-4">{children}</div>
		</div>
	);
}

// Small icons for the ViewToggle demo (decorative).
const GridIcon = () => (
	<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
		<rect x="3" y="3" width="8" height="8" rx="1.5" />
		<rect x="13" y="3" width="8" height="8" rx="1.5" />
		<rect x="3" y="13" width="8" height="8" rx="1.5" />
		<rect x="13" y="13" width="8" height="8" rx="1.5" />
	</svg>
);
const ListIcon = () => (
	<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
		<rect x="3" y="5" width="18" height="3" rx="1.5" />
		<rect x="3" y="11" width="18" height="3" rx="1.5" />
		<rect x="3" y="17" width="18" height="3" rx="1.5" />
	</svg>
);

// Stateful demos (hooks can't live in the static SECTIONS array).
function ViewToggleDemo() {
	const [view, setView] = useState("grid");
	return (
		<ViewToggle
			aria-label="Switch view"
			value={view}
			onChange={setView}
			options={[
				{ id: "grid", label: "Grid", icon: <GridIcon /> },
				{ id: "list", label: "List", icon: <ListIcon /> },
			]}
		/>
	);
}

function SectionTabsDemo() {
	const [active, setActive] = useState("all");
	return (
		<SectionTabs
			active={active}
			onChange={setActive}
			tabs={[
				{ key: "all", label: "All" },
				{ key: "active", label: "Active" },
				{ key: "archived", label: "Archived" },
				{ key: "trash", label: "Trash", disabled: true },
			]}
		/>
	);
}

type SectionDef = { id: string; group: string; title: string; subtitle?: string; content: ReactNode };

const SECTIONS: SectionDef[] = [
	// ── Forms ──
	{
		id: "text-fields",
		group: "Forms",
		title: "Text fields",
		subtitle:
			"Active fields use a white fill so they read as editable — including inside a Card (which shares the cream surface). Flip the canvas background to check contrast.",
		content: (
			<>
				<Demo label="On the canvas surface">
					<div className="w-72">
						<Input label="Label" placeholder="Type here…" />
					</div>
					<div className="w-72">
						<Input label="With description" placeholder="you@example.com" description="We'll never share it." />
					</div>
				</Demo>
				<Demo label="Inside a Card (cream surface)">
					<Card variant="outlined" padding="md" className="w-72">
						<Input label="Email" placeholder="you@example.com" />
					</Card>
				</Demo>
				<Demo label="States">
					<div className="w-72">
						<Input label="Invalid" placeholder="…" isInvalid errorMessage="This field is required." />
					</div>
					<div className="w-72">
						<Input label="Disabled" placeholder="Can't touch this" isDisabled />
					</div>
				</Demo>
				<Demo label="Sizes (sm · md · lg)">
					<div className="w-72">
						<Input label="Small" size="sm" placeholder="sm" />
					</div>
					<div className="w-72">
						<Input label="Medium" size="md" placeholder="md" />
					</div>
					<div className="w-72">
						<Input label="Large" size="lg" placeholder="lg" />
					</div>
				</Demo>
				<Demo label="Textarea">
					<div className="w-full max-w-md">
						<Textarea label="Message" placeholder="Write something…" description="Resizes vertically." />
					</div>
				</Demo>
			</>
		),
	},
	{
		id: "select",
		group: "Forms",
		title: "Select",
		subtitle: "Trigger matched to the text fields (white fill + border).",
		content: (
			<Demo label="Default · disabled">
				<div className="w-72">
					<Select label="Fruit" placeholder="Pick one">
						<SelectItem id="apple">Apple</SelectItem>
						<SelectItem id="banana">Banana</SelectItem>
						<SelectItem id="cherry">Cherry</SelectItem>
					</Select>
				</div>
				<div className="w-72">
					<Select label="Disabled" placeholder="Unavailable" isDisabled>
						<SelectItem id="a">A</SelectItem>
					</Select>
				</div>
			</Demo>
		),
	},
	{
		id: "selection-controls",
		group: "Forms",
		title: "Selection controls",
		content: (
			<>
				<Demo label="Checkbox">
					<Checkbox>Unchecked</Checkbox>
					<Checkbox defaultSelected>Checked</Checkbox>
					<Checkbox isDisabled>Disabled</Checkbox>
				</Demo>
				<Demo label="Switch">
					<Switch>Off</Switch>
					<Switch defaultSelected>On</Switch>
				</Demo>
				<Demo label="Radio group">
					<RadioGroup label="Plan">
						<Radio value="free">Free</Radio>
						<Radio value="pro">Pro</Radio>
						<Radio value="team">Team</Radio>
					</RadioGroup>
				</Demo>
			</>
		),
	},

	// ── Actions ──
	{
		id: "buttons",
		group: "Actions",
		title: "Buttons",
		content: (
			<>
				<Demo label="Variants">
					<Button variant="primary">Primary</Button>
					<Button variant="secondary">Secondary</Button>
					<Button variant="ghost">Ghost</Button>
					<Button variant="destructive">Destructive</Button>
					<Button isDisabled>Disabled</Button>
				</Demo>
				<Demo label="Sizes">
					<Button size="sm">Small</Button>
					<Button size="md">Medium</Button>
					<Button size="lg">Large</Button>
				</Demo>
			</>
		),
	},
	{
		id: "dropdown-menu",
		group: "Actions",
		title: "Dropdown menu",
		subtitle: "A button-anchored action menu.",
		content: (
			<Demo label="Trigger → menu">
				<DropdownMenuTrigger>
					<Button variant="secondary">Actions</Button>
					<DropdownMenu aria-label="Row actions">
						<DropdownMenuItem>Edit</DropdownMenuItem>
						<DropdownMenuItem>Duplicate</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem>Delete</DropdownMenuItem>
					</DropdownMenu>
				</DropdownMenuTrigger>
			</Demo>
		),
	},
	{
		id: "view-toggle",
		group: "Actions",
		title: "View toggle",
		subtitle: "Single-select icon group (e.g. grid / list).",
		content: (
			<Demo label="Grid · List">
				<ViewToggleDemo />
			</Demo>
		),
	},

	// ── Overlays ──
	// ── Modals (a core Graphic Standard element) ──
	{
		id: "modal",
		group: "Modals",
		title: "Modal / Dialog",
		subtitle:
			"A core GS surface. Built on RAC — the trigger owns open/close (Esc / click-outside dismiss). Sizes sm → full; the body accepts any content.",
		content: (
			<>
				<Demo label="Sizes (sm · md · lg · xl)">
					{(["sm", "md", "lg", "xl"] as const).map((size) => (
						<DialogTrigger key={size}>
							<Button variant="secondary">{size.toUpperCase()}</Button>
							<Dialog
								size={size}
								title={`${size} dialog`}
								description="The modal width scales with the size; the body content stays the same."
							>
								{({ close }) => (
									<div className="flex justify-end gap-2 pt-2">
										<Button variant="ghost" onPress={close}>
											Close
										</Button>
									</div>
								)}
							</Dialog>
						</DialogTrigger>
					))}
				</Demo>

				<Demo label="Confirm (destructive)">
					<DialogTrigger>
						<Button variant="destructive">Delete item</Button>
						<Dialog size="sm" title="Delete item?" description="This action cannot be undone.">
							{({ close }) => (
								<div className="flex justify-end gap-2 pt-2">
									<Button variant="ghost" onPress={close}>
										Cancel
									</Button>
									<Button variant="destructive" onPress={close}>
										Delete
									</Button>
								</div>
							)}
						</Dialog>
					</DialogTrigger>
				</Demo>

				<Demo label="Form modal (with badge)">
					<DialogTrigger>
						<Button>New project</Button>
						<Dialog
							title="New project"
							description="Give it a name to get started."
							badge={
								<span className="rounded-full bg-brand-green px-2 py-0.5 text-micro font-medium text-fg">Beta</span>
							}
						>
							{({ close }) => (
								<div className="flex flex-col gap-4">
									<Input label="Project name" placeholder="Acme rebrand" />
									<Select label="Template" placeholder="Choose a template">
										<SelectItem id="blank">Blank</SelectItem>
										<SelectItem id="brand">Brand kit</SelectItem>
										<SelectItem id="campaign">Campaign</SelectItem>
									</Select>
									<div className="flex justify-end gap-2 pt-2">
										<Button variant="ghost" onPress={close}>
											Cancel
										</Button>
										<Button onPress={close}>Create</Button>
									</div>
								</div>
							)}
						</Dialog>
					</DialogTrigger>
				</Demo>
			</>
		),
	},
	{
		id: "tooltip",
		group: "Overlays",
		title: "Tooltip",
		content: (
			<Demo label="Hover / focus">
				<TooltipTrigger>
					<Button variant="secondary">Hover me</Button>
					<Tooltip>A helpful hint.</Tooltip>
				</TooltipTrigger>
			</Demo>
		),
	},
	{
		id: "toast",
		group: "Overlays",
		title: "Toast",
		subtitle: "Imperative queue; the region is mounted once at the app root.",
		content: (
			<Demo label="Fire a toast">
				<Button variant="secondary" onPress={() => toast.success("Saved", "Your changes were saved.")}>
					Success
				</Button>
				<Button variant="secondary" onPress={() => toast.error("Failed", "Something went wrong.")}>
					Error
				</Button>
				<Button variant="ghost" onPress={() => toast.add({ title: "Heads up", description: "A plain toast." })}>
					Default
				</Button>
			</Demo>
		),
	},

	// ── Navigation ──
	{
		id: "tabs",
		group: "Navigation",
		title: "Tabs",
		content: (
			<Demo label="Underlined tabs">
				<Tabs className="w-72">
					<TabList>
						<Tab id="one">One</Tab>
						<Tab id="two">Two</Tab>
						<Tab id="three">Three</Tab>
					</TabList>
					<TabPanel id="one">First panel</TabPanel>
					<TabPanel id="two">Second panel</TabPanel>
					<TabPanel id="three">Third panel</TabPanel>
				</Tabs>
			</Demo>
		),
	},
	{
		id: "section-tabs",
		group: "Navigation",
		title: "Section tabs",
		subtitle: "Pill-style filter tabs, with disabled (“Soon”) support.",
		content: (
			<Demo label="Filter">
				<SectionTabsDemo />
			</Demo>
		),
	},
	{
		id: "disclosure",
		group: "Navigation",
		title: "Disclosure",
		content: (
			<Demo label="Expand / collapse">
				<Disclosure>
					<Button slot="trigger" variant="ghost">
						Details
					</Button>
					<DisclosurePanel>
						<Text size="compact" tone="muted">
							Hidden content, revealed on toggle.
						</Text>
					</DisclosurePanel>
				</Disclosure>
			</Demo>
		),
	},

	// ── Content ──
	{
		id: "typography",
		group: "Content",
		title: "Typography",
		subtitle: "The Text / Heading type ramp.",
		content: (
			<>
				<Demo label="Text sizes">
					<div className="flex flex-col gap-1">
						<Text size="display">Display</Text>
						<Text size="title">Title</Text>
						<Text size="body">Body</Text>
						<Text size="caption" tone="muted">
							Caption · muted
						</Text>
					</div>
				</Demo>
				<Demo label="Heading">
					<Heading>Section heading</Heading>
				</Demo>
			</>
		),
	},
	{
		id: "card",
		group: "Content",
		title: "Card",
		content: (
			<Demo label="Variants">
				<Card variant="plain" padding="md" className="w-40">
					<Text size="compact">plain</Text>
				</Card>
				<Card variant="outlined" padding="md" className="w-40">
					<Text size="compact">outlined</Text>
				</Card>
				<Card variant="elevated" padding="md" className="w-40">
					<Text size="compact">elevated</Text>
				</Card>
			</Demo>
		),
	},
	{
		id: "separator",
		group: "Content",
		title: "Separator",
		content: (
			<Demo label="Horizontal">
				<div className="w-72">
					<Text size="compact">Above</Text>
					<Separator className="my-3" />
					<Text size="compact">Below</Text>
				</div>
			</Demo>
		),
	},

	// ── Tokens ──
	{
		id: "tokens",
		group: "Tokens",
		title: "Colours",
		subtitle: "Core colour swatches.",
		content: (
			<Demo label="Surfaces · foreground · status">
				{[
					{ name: "surface", v: "--color-surface" },
					{ name: "surface-card", v: "--color-surface-card" },
					{ name: "surface-muted", v: "--color-surface-muted" },
					{ name: "brand-green", v: "--color-brand-green" },
					{ name: "fg", v: "--color-fg" },
					{ name: "fg-muted", v: "--color-fg-muted" },
					{ name: "fg-subtle", v: "--color-fg-subtle" },
					{ name: "border", v: "--color-border" },
					{ name: "danger", v: "--color-danger" },
					{ name: "success", v: "--color-success" },
				].map((s) => (
					<div key={s.name} className="flex w-28 flex-col gap-1">
						<div className="h-12 w-full rounded-md border border-border" style={{ background: `var(${s.v})` }} />
						<span className="text-micro text-fg-muted">{s.name}</span>
					</div>
				))}
			</Demo>
		),
	},
];

const GROUP_ORDER = ["Forms", "Modals", "Actions", "Overlays", "Navigation", "Content", "Tokens"];

// Canvas background options — the surfaces a component realistically sits on.
// (No dark option: the tokens are light-only, so a dark canvas would render
// text-fg invisible. Add it here once dark tokens land.)
const BACKGROUNDS = [
	{ id: "surface", label: "White", v: "--color-surface" },
	{ id: "surface-card", label: "Cream", v: "--color-surface-card" },
	{ id: "surface-muted", label: "Muted", v: "--color-surface-muted" },
] as const;

export function App() {
	const [bg, setBg] = useState<(typeof BACKGROUNDS)[number]["id"]>("surface");
	const [query, setQuery] = useState("");
	const [active, setActive] = useState(SECTIONS[0].id);
	const canvasRef = useRef<HTMLDivElement>(null);

	// Group the (filtered) sections for the sidebar, preserving GROUP_ORDER.
	const groups = useMemo(() => {
		const q = query.trim().toLowerCase();
		const match = SECTIONS.filter((s) => !q || s.title.toLowerCase().includes(q) || s.group.toLowerCase().includes(q));
		return GROUP_ORDER.map((group) => ({ group, items: match.filter((s) => s.group === group) })).filter(
			(g) => g.items.length > 0,
		);
	}, [query]);

	// Scrollspy: highlight the nav item for whichever section is nearest the top
	// of the canvas. Observe against the scrolling canvas, not the window.
	useEffect(() => {
		const root = canvasRef.current;
		if (!root) return;
		const observer = new IntersectionObserver(
			(entries) => {
				for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
			},
			{ root, rootMargin: "0px 0px -70% 0px", threshold: 0 },
		);
		for (const el of root.querySelectorAll("[data-section]")) observer.observe(el);
		return () => observer.disconnect();
	}, []);

	const jump = (id: string) => {
		canvasRef.current?.querySelector(`#${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
	};

	const activeTitle = SECTIONS.find((s) => s.id === active);

	return (
		<div className="flex h-screen overflow-hidden text-fg">
			{/* ── sidebar ── */}
			<aside className="flex w-64 shrink-0 flex-col border-r border-border bg-surface-card">
				<div className="flex flex-col gap-3 border-b border-border p-4">
					<div className="flex flex-col">
						<span className="text-heading5 font-semibold text-fg">podoba</span>
						<span className="text-micro uppercase tracking-wide text-fg-subtle">component gallery</span>
					</div>
					<input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Filter…"
						className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-fg outline-none placeholder:text-fg-muted focus:border-fg-subtle"
					/>
				</div>
				<nav className="flex flex-1 flex-col gap-4 overflow-y-auto p-3">
					{groups.map((g) => (
						<div key={g.group} className="flex flex-col gap-0.5">
							<span className="px-3 pb-1 text-micro font-semibold uppercase tracking-wider text-fg-subtle">
								{g.group}
							</span>
							{g.items.map((s) => (
								<button
									key={s.id}
									type="button"
									onClick={() => jump(s.id)}
									className={`rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
										active === s.id
											? "bg-surface font-medium text-fg"
											: "text-fg-muted hover:bg-surface/60 hover:text-fg"
									}`}
								>
									{s.title}
								</button>
							))}
						</div>
					))}
					{groups.length === 0 ? <span className="px-3 py-1.5 text-sm text-fg-subtle">No matches</span> : null}
				</nav>
			</aside>

			{/* ── canvas ── */}
			<div className="flex flex-1 flex-col overflow-hidden">
				<header className="flex items-center justify-between gap-4 border-b border-border bg-surface px-6 py-3">
					<span className="text-sm font-medium text-fg">
						{activeTitle ? (
							<>
								<span className="text-fg-subtle">{activeTitle.group}</span>
								<span className="px-1.5 text-fg-subtle">/</span>
								{activeTitle.title}
							</>
						) : null}
					</span>
					<div className="flex items-center gap-2">
						<span className="text-micro uppercase tracking-wide text-fg-subtle">Background</span>
						<div className="flex gap-1 rounded-md border border-border p-0.5">
							{BACKGROUNDS.map((b) => (
								<button
									key={b.id}
									type="button"
									onClick={() => setBg(b.id)}
									className={`rounded px-2.5 py-1 text-xs transition-colors ${
										bg === b.id ? "bg-surface-muted font-medium text-fg" : "text-fg-muted hover:text-fg"
									}`}
								>
									{b.label}
								</button>
							))}
						</div>
					</div>
				</header>
				<div
					ref={canvasRef}
					className="flex-1 overflow-y-auto transition-colors"
					style={{ background: `var(--color-${bg})` }}
				>
					<div className="mx-auto flex max-w-5xl flex-col gap-12 px-8 py-12">
						{SECTIONS.map((s) => (
							<section key={s.id} id={s.id} data-section className="flex scroll-mt-6 flex-col gap-5">
								<div className="flex flex-col gap-1">
									<span className="text-micro font-semibold uppercase tracking-wider text-fg-subtle">{s.group}</span>
									<h2 className="text-heading3 font-semibold text-fg">{s.title}</h2>
									{s.subtitle ? <p className="max-w-2xl text-sm text-fg-muted">{s.subtitle}</p> : null}
								</div>
								<div className="flex flex-col gap-6">{s.content}</div>
							</section>
						))}
					</div>
				</div>
			</div>

			{/* Toast queue renders here, mounted once. */}
			<ToastRegion />
		</div>
	);
}
