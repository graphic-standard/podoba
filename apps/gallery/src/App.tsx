import {
	Button,
	Card,
	Checkbox,
	CollapsibleCard,
	ComboBox,
	ComboBoxItem,
	DateField,
	DatePicker,
	Dialog,
	DialogTrigger,
	Disclosure,
	DisclosurePanel,
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	FileUpload,
	FocusField,
	FocusFields,
	Heading,
	Input,
	MultiSelect,
	NumberField,
	Radio,
	RadioGroup,
	RichTextEditor,
	SearchField,
	Select,
	SelectItem,
	Separator,
	SectionTabs,
	Slider,
	Switch,
	Tag,
	TagGroup,
	TimeField,
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
	// ── product patterns (label-driven) ──
	Badge,
	BrandPageHeader,
	ContextMenu,
	CtaPill,
	DashboardGrid,
	DashboardTile,
	DeliveryStatusModule,
	DeliveryStatusPill,
	DownloadModal,
	FeatureTile,
	PublishModal,
	RequestChangesModal,
	SendToPrintModal,
	StatsCard,
	Subtle,
	TaskApprovalModal,
	Tile,
	tileStatClass,
	useContextMenu,
	// ── icon set ──
	ArrowRightIcon,
	CalendarIcon,
	CheckIcon,
	ChevronDownIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronUpIcon,
	CloseIcon,
	DownloadIcon,
	ExpandIcon,
	ExternalLinkIcon,
	FileTextIcon,
	FolderIcon,
	ImageIcon,
	MenuIcon,
	MinusIcon,
	MoonIcon,
	PlayIcon,
	PlusIcon,
	SearchIcon,
	StarIcon,
	SunIcon,
	TrashIcon,
	UploadIcon,
	UserIcon,
	type IconProps,
} from "@podoba/react";
import { type ComponentType, createElement, type ReactNode, useEffect, useMemo, useRef, useState } from "react";

// ── gallery chrome ──────────────────────────────────────────────────────────
// A tiny local framework: a SECTIONS registry (grouped) drives both the sidebar
// nav and the canvas, `Demo` labels a single specimen. Deliberately plain — the
// point is to see the real components, not to rebuild Storybook.

function Demo({ label, children }: { label: string; children: ReactNode }) {
	return (
		<div className="flex flex-col gap-3">
			<span className="text-micro font-medium uppercase tracking-wide text-fg-subtle">{label}</span>
			<div className="flex flex-wrap items-start gap-6">{children}</div>
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

function RichTextDemo() {
	const [html, setHtml] = useState("<h2>Rich text</h2><p>A dependency-free WYSIWYG. Try <b>bold</b>, <i>italic</i>, lists, and links.</p><ul><li>Emits an HTML string</li><li>Pastes as plain text</li></ul>");
	return (
		<RichTextEditor
			label="Body"
			description="Formatting round-trips as an HTML string."
			value={html}
			onChange={setHtml}
		/>
	);
}

const FF_CATEGORIES = [
	{ id: "event", label: "Event" },
	{ id: "campaign", label: "Campaign" },
	{ id: "social", label: "Social" },
];
const FF_COUNTRIES = [
	{ id: "cz", label: "Czechia" },
	{ id: "sk", label: "Slovakia" },
	{ id: "pl", label: "Poland" },
	{ id: "de", label: "Germany" },
];
const FF_TAGS = [
	{ id: "brand", label: "Brand" },
	{ id: "print", label: "Print" },
	{ id: "web", label: "Web" },
	{ id: "social", label: "Social" },
];
const stripHtml = (h: string) => h.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

function FocusFieldsDemo() {
	const [headline, setHeadline] = useState("adsadsads");
	const [body, setBody] = useState("");
	const [bio, setBio] = useState("<p>Short <b>bio</b> in rich text…</p>");
	const [qty, setQty] = useState(1);
	const [cat, setCat] = useState<string | null>("event");
	const [country, setCountry] = useState<string | null>(null);
	const [tags, setTags] = useState<Set<string>>(new Set(["brand"]));
	const [labels, setLabels] = useState([
		{ id: "q4", name: "Q4" },
		{ id: "prio", name: "Priority" },
	]);
	const [featured, setFeatured] = useState(true);
	const [priority, setPriority] = useState(60);

	const tagPreview = [...tags].map((id) => FF_TAGS.find((t) => t.id === id)?.label).filter(Boolean).join(", ");

	return (
		<FocusFields className="w-full max-w-xl">
			{/* text — bare, enlarged headline */}
			<FocusField icon="T" label="Headline" preview={headline} placeholder="Headline">
				<input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Headline" />
			</FocusField>
			<FocusField icon="T" label="Body" preview={body} placeholder="Body copy">
				<textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Body copy" />
			</FocusField>

			{/* everything else — self-labelled controls, editor="control" */}
			<FocusField icon="¶" label="Bio" preview={stripHtml(bio)} placeholder="Rich text" editor="control">
				<RichTextEditor label="Bio" value={bio} onChange={setBio} />
			</FocusField>
			<FocusField icon="#" label="Quantity" preview={String(qty)} editor="control">
				<NumberField label="Quantity" value={qty} onChange={setQty} minValue={0} />
			</FocusField>
			<FocusField icon="▾" label="Category" preview={FF_CATEGORIES.find((c) => c.id === cat)?.label} placeholder="Choose…" editor="control">
				<Select label="Category" placeholder="Choose…" selectedKey={cat} onSelectionChange={(k) => setCat(String(k))}>
					{FF_CATEGORIES.map((c) => (
						<SelectItem key={c.id} id={c.id}>
							{c.label}
						</SelectItem>
					))}
				</Select>
			</FocusField>
			<FocusField icon="⌕" label="Country" preview={FF_COUNTRIES.find((c) => c.id === country)?.label} placeholder="Search…" editor="control">
				<ComboBox label="Country" placeholder="Search…" selectedKey={country} onSelectionChange={(k) => setCountry(k == null ? null : String(k))}>
					{FF_COUNTRIES.map((c) => (
						<ComboBoxItem key={c.id} id={c.id}>
							{c.label}
						</ComboBoxItem>
					))}
				</ComboBox>
			</FocusField>
			<FocusField icon="✦" label="Tags" preview={tagPreview} placeholder="Pick tags" editor="control">
				<MultiSelect label="Tags" placeholder="Pick tags" options={FF_TAGS} selectedKeys={tags} onChange={setTags} searchable />
			</FocusField>
			<FocusField icon="📅" label="Publish date" placeholder="Pick a date" editor="control">
				<DatePicker label="Publish date" />
			</FocusField>
			<FocusField icon="⌗" label="Labels" preview={labels.map((l) => l.name).join(", ")} placeholder="Add labels" editor="control">
				<TagGroup label="Labels" onRemove={(keys) => setLabels((p) => p.filter((l) => !keys.has(l.id)))}>
					{labels.map((l) => (
						<Tag key={l.id} id={l.id}>
							{l.name}
						</Tag>
					))}
				</TagGroup>
			</FocusField>
			<FocusField icon="◐" label="Featured" preview={featured ? "Yes" : "No"} editor="control">
				<Switch isSelected={featured} onChange={setFeatured}>
					Featured
				</Switch>
			</FocusField>
			<FocusField icon="⇔" label="Priority" preview={String(priority)} editor="control">
				<Slider label="Priority" value={priority} onChange={setPriority} maxValue={100} />
			</FocusField>
			<FocusField icon="⇪" label="Attachment" placeholder="Choose a file" editor="control">
				<FileUpload label="Attachment" accept={["image/*"]} />
			</FocusField>
		</FocusFields>
	);
}

function TagGroupDemo() {
	const [tags, setTags] = useState([
		{ id: "brand", name: "Brand" },
		{ id: "print", name: "Print" },
		{ id: "social", name: "Social" },
		{ id: "web", name: "Web" },
	]);
	return (
		<TagGroup
			label="Tags"
			description="Roving focus; press ✕ or Backspace to remove."
			onRemove={(keys) => setTags((prev) => prev.filter((t) => !keys.has(t.id)))}
		>
			{tags.map((t) => (
				<Tag key={t.id} id={t.id}>
					{t.name}
				</Tag>
			))}
		</TagGroup>
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

// ── typography showcase ──────────────────────────────────────────────────────
// The <Text> UI ramp (font-size only, largest → smallest) and the <Heading>
// semantic ramp (levels carry a line-height). px values mirror @podoba/tokens.
const TEXT_SIZES = [
	{ name: "display", meta: "1.75rem · 28px" },
	{ name: "headline", meta: "1.375rem · 22px" },
	{ name: "title", meta: "1.25rem · 20px" },
	{ name: "subtitle", meta: "1.125rem · 18px" },
	{ name: "body", meta: "1rem · 16px" },
	{ name: "callout", meta: "0.9375rem · 15px" },
	{ name: "compact", meta: "0.8125rem · 13px" },
	{ name: "label", meta: "0.75rem · 12px" },
	{ name: "caption", meta: "0.6875rem · 11px" },
	{ name: "micro", meta: "0.625rem · 10px" },
] as const;

const HEADINGS = [
	{ level: "1", meta: "heading1 · 28px" },
	{ level: "2", meta: "heading2 · 22px" },
	{ level: "3", meta: "heading3 · 20px" },
	{ level: "4", meta: "heading4 · 18px" },
	{ level: "5", meta: "heading5 · 16px" },
] as const;

const SPECIMEN = "The quick brown fox";

function RampRow({ meta, children }: { meta: string; children: ReactNode }) {
	return (
		<div className="flex items-baseline gap-4 border-b border-border/60 py-2 last:border-0">
			<span className="w-32 shrink-0 font-mono text-micro text-fg-subtle">{meta}</span>
			<div className="min-w-0 flex-1">{children}</div>
		</div>
	);
}

function TypographyShowcase() {
	return (
		<>
			<Demo label="Heading ramp (semantic — carries line-height)">
				<div className="flex w-full max-w-2xl flex-col">
					{HEADINGS.map((h) => (
						<RampRow key={h.level} meta={h.meta}>
							<Heading asChild level={h.level}>
								{createElement(`h${h.level}`, null, `Heading level ${h.level}`)}
							</Heading>
						</RampRow>
					))}
				</div>
			</Demo>

			<Demo label="Text ramp (UI — font-size only)">
				<div className="flex w-full max-w-2xl flex-col">
					{TEXT_SIZES.map((s) => (
						<RampRow key={s.name} meta={`${s.name} · ${s.meta.split(" · ")[1]}`}>
							<Text size={s.name}>{SPECIMEN}</Text>
						</RampRow>
					))}
				</div>
			</Demo>

			<Demo label="Weights (regular · medium · semibold · bold)">
				<Text size="title" weight="regular">
					Regular
				</Text>
				<Text size="title" weight="medium">
					Medium
				</Text>
				<Text size="title" weight="semibold">
					Semibold
				</Text>
				<Text size="title" weight="bold">
					Bold
				</Text>
			</Demo>

			<Demo label="Tones">
				<Text tone="default">Default</Text>
				<Text tone="muted">Muted</Text>
				<Text tone="subtle">Subtle</Text>
				<span className="rounded-md bg-surface-inverted px-2.5 py-1">
					<Text tone="inverted">Inverted</Text>
				</span>
			</Demo>

			<Demo label="Combinations">
				{/* Article header */}
				<div className="flex w-64 flex-col gap-2">
					<Text size="label" weight="medium" tone="muted" className="uppercase tracking-wide">
						Case study
					</Text>
					<Heading asChild level="2">
						<h3>Rebranding Acme for a global launch</h3>
					</Heading>
					<Text size="subtitle" tone="muted">
						How we rebuilt the identity system in six weeks.
					</Text>
				</div>
				{/* Stat */}
				<div className="flex w-40 flex-col gap-1">
					<Text size="display" weight="bold">
						128
					</Text>
					<Text size="caption" tone="muted" className="uppercase tracking-wide">
						Assets delivered
					</Text>
				</div>
				{/* Definition pair */}
				<div className="flex w-40 flex-col gap-0.5">
					<Text size="caption" tone="subtle" className="uppercase tracking-wide">
						Status
					</Text>
					<Text size="callout" weight="medium">
						In review
					</Text>
				</div>
				{/* Body paragraph */}
				<div className="flex w-72 flex-col gap-2">
					<Text size="body" weight="semibold">
						Body copy
					</Text>
					<Text size="body" tone="muted" className="leading-relaxed">
						Pack my box with five dozen liquor jugs — a pangram to preview the body copy at its natural leading.
					</Text>
				</div>
			</Demo>
		</>
	);
}

// ── icon catalogue ────────────────────────────────────────────────────────────
// One <XxxIcon> per glyph on a shared 24×24 grid; sized via className, coloured
// via text-*. Mirrors the export order in components/icons.tsx.
const ICONS: { name: string; Icon: ComponentType<IconProps> }[] = [
	{ name: "ChevronDown", Icon: ChevronDownIcon },
	{ name: "ChevronUp", Icon: ChevronUpIcon },
	{ name: "ChevronRight", Icon: ChevronRightIcon },
	{ name: "ChevronLeft", Icon: ChevronLeftIcon },
	{ name: "ArrowRight", Icon: ArrowRightIcon },
	{ name: "Close", Icon: CloseIcon },
	{ name: "Check", Icon: CheckIcon },
	{ name: "Plus", Icon: PlusIcon },
	{ name: "Minus", Icon: MinusIcon },
	{ name: "Search", Icon: SearchIcon },
	{ name: "Play", Icon: PlayIcon },
	{ name: "Menu", Icon: MenuIcon },
	{ name: "ExternalLink", Icon: ExternalLinkIcon },
	{ name: "Expand", Icon: ExpandIcon },
	{ name: "Sun", Icon: SunIcon },
	{ name: "Moon", Icon: MoonIcon },
	{ name: "FileText", Icon: FileTextIcon },
	{ name: "Folder", Icon: FolderIcon },
	{ name: "Image", Icon: ImageIcon },
	{ name: "Calendar", Icon: CalendarIcon },
	{ name: "Trash", Icon: TrashIcon },
	{ name: "Star", Icon: StarIcon },
	{ name: "User", Icon: UserIcon },
	{ name: "Upload", Icon: UploadIcon },
	{ name: "Download", Icon: DownloadIcon },
];

function IconShowcase() {
	return (
		<>
			<Demo label="The set (currentColor · 24×24 grid)">
				<div className="grid w-full max-w-3xl grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2">
					{ICONS.map(({ name, Icon }) => (
						<div
							key={name}
							className="flex flex-col items-center gap-2 rounded-lg border border-border p-3 text-fg"
						>
							<Icon className="h-6 w-6" />
							<span className="text-micro text-fg-muted">{name}</span>
						</div>
					))}
				</div>
			</Demo>
			<Demo label="Sizes (inherit via className)">
				<div className="flex items-end gap-4 text-fg">
					<StarIcon className="h-4 w-4" />
					<StarIcon className="h-6 w-6" />
					<StarIcon className="h-8 w-8" />
					<StarIcon className="h-10 w-10" />
				</div>
			</Demo>
			<Demo label="Colour (inherit via text-*)">
				<PlayIcon className="h-6 w-6 text-fg" />
				<CheckIcon className="h-6 w-6 text-success" />
				<TrashIcon className="h-6 w-6 text-danger" />
				<StarIcon className="h-6 w-6 text-fg-muted" />
				<span className="inline-flex rounded-md bg-surface-inverted p-1.5">
					<MoonIcon className="h-6 w-6 text-fg-inverted" />
				</span>
			</Demo>
			<Demo label="In context">
				<Button size="sm">
					<PlusIcon className="h-4 w-4" /> New
				</Button>
				<Button variant="secondary" size="sm">
					<DownloadIcon className="h-4 w-4" /> Export
				</Button>
				<Button variant="ghost" size="sm">
					Learn more <ArrowRightIcon className="h-4 w-4" />
				</Button>
			</Demo>
		</>
	);
}

// ── context menu (right-click) ──────────────────────────────────────────────
function ContextMenuDemo() {
	const menu = useContextMenu();
	return (
		<>
			<div
				onContextMenu={menu.open}
				className="flex h-40 w-full max-w-md items-center justify-center rounded-lg border border-dashed border-border bg-surface-muted text-sm text-fg-muted"
			>
				Right-click anywhere in this area
			</div>
			<ContextMenu
				{...menu.props}
				aria-label="Asset actions"
				groups={[
					{
						id: "edit",
						items: [
							{ id: "open", label: "Open", icon: <ExternalLinkIcon className="h-3.5 w-3.5" /> },
							{ id: "rename", label: "Rename", icon: <FileTextIcon className="h-3.5 w-3.5" /> },
							{ id: "download", label: "Download", icon: <DownloadIcon className="h-3.5 w-3.5" /> },
						],
					},
					{
						id: "meta",
						label: "More",
						items: [
							{ id: "star", label: "Add to favourites", icon: <StarIcon className="h-3.5 w-3.5" /> },
							{ id: "soon", label: "Move to…", disabled: true },
							{ id: "delete", label: "Delete", icon: <TrashIcon className="h-3.5 w-3.5" />, destructive: true },
						],
					},
				]}
			/>
		</>
	);
}

// ── dashboard (Tile · StatsCard · Badge · DashboardGrid) ────────────────────
function DashboardDemo() {
	return (
		<DashboardGrid className="w-full max-w-4xl">
			<DashboardTile span={3}>
				<StatsCard title="Assets" value="128" footer="+12 this week" />
			</DashboardTile>
			<DashboardTile span={3}>
				<StatsCard
					title="In review"
					value="7"
					badge={<Badge label="Live" color="green" />}
					description="Awaiting approval"
				/>
			</DashboardTile>
			<DashboardTile span={3}>
				<StatsCard dark title="Cloud" value="2.4k" footer="Rendered outputs" />
			</DashboardTile>
			<DashboardTile span={3}>
				<Tile
					theme="teal"
					head={
						<>
							<span>Brand kit</span>
							<Badge label="v3" color="dark" />
						</>
					}
					tail={<span className="text-compact text-fg/70">Updated today</span>}
				>
					<span className={tileStatClass}>Ready</span>
				</Tile>
			</DashboardTile>
			<DashboardTile span={6}>
				<Tile theme="yellow" head={<span>Campaign</span>} tail={<span className="text-compact text-fg/70">6 channels</span>}>
					<span className={tileStatClass}>Q4 launch</span>
				</Tile>
			</DashboardTile>
			<DashboardTile span={6}>
				<Tile theme="dark" head={<span>Storage</span>} tail={<span className="text-compact text-white/60">of 100 GB</span>}>
					<span className={tileStatClass}>62 GB</span>
				</Tile>
			</DashboardTile>
		</DashboardGrid>
	);
}

function BrandPageHeaderDemo() {
	return (
		<div className="w-full max-w-4xl rounded-lg border border-border bg-surface p-6">
			<BrandPageHeader
				breadcrumbs={[{ label: "Workspace" }, { label: "Acme" }]}
				greeting={
					<>
						<Subtle>Good afternoon,</Subtle> Jonas 👋
					</>
				}
				cta={
					<CtaPill lead="Let's" emphasis="create" tail="something">
						<Button className="rounded-full bg-surface-inverted text-fg-inverted data-[hovered]:opacity-90">
							<PlusIcon className="h-4 w-4" /> Create
						</Button>
					</CtaPill>
				}
			/>
		</div>
	);
}

// ── delivery + approval modals (controlled open state) ──────────────────────
function DownloadModalDemo() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button variant="secondary" onPress={() => setOpen(true)}>
				<DownloadIcon className="h-4 w-4" /> Download
			</Button>
			<DownloadModal
				isOpen={open}
				onOpenChange={setOpen}
				onConfirm={() => setOpen(false)}
				labels={{
					title: "Download asset",
					body: "Choose a format to generate a downloadable file.",
					formatLabel: "Format",
					formatPng: "PNG (image)",
					formatPdf: "PDF (print-ready)",
					cancel: "Cancel",
					confirm: "Generate",
					submitting: "Generating…",
					preparing: "Preparing your file…",
					download: "Download",
					ready: "Your file is ready.",
				}}
			/>
		</>
	);
}

function SendToPrintModalDemo() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button variant="secondary" onPress={() => setOpen(true)}>
				Send to print
			</Button>
			<SendToPrintModal
				isOpen={open}
				onOpenChange={setOpen}
				onConfirm={() => setOpen(false)}
				labels={{
					title: "Send to print",
					body: "Specify the print run for this artwork.",
					sizeLabel: "Size",
					sizePlaceholder: "A2",
					materialLabel: "Material",
					materialPlaceholder: "Matte 250g",
					quantityLabel: "Quantity",
					quantityPlaceholder: "100",
					quantityError: "Enter a whole number greater than 0.",
					addressLabel: "Delivery address",
					addressPlaceholder: "Street, city, ZIP",
					cancel: "Cancel",
					confirm: "Send order",
					submitting: "Sending…",
				}}
			/>
		</>
	);
}

function PublishModalDemo() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button variant="secondary" onPress={() => setOpen(true)}>
				Publish
			</Button>
			<PublishModal
				isOpen={open}
				onOpenChange={setOpen}
				onConfirm={() => setOpen(false)}
				labels={{
					title: "Publish to channel",
					body: "Pick a destination account and channel.",
					destinationLabel: "Destination",
					destinationPlaceholder: "@acme",
					channelLabel: "Channel",
					channelPlaceholder: "Choose a channel",
					cancel: "Cancel",
					confirm: "Publish",
					submitting: "Publishing…",
					channels: [
						{ value: "instagram", label: "Instagram" },
						{ value: "linkedin", label: "LinkedIn" },
						{ value: "x", label: "X" },
					],
				}}
			/>
		</>
	);
}

function TaskApprovalModalDemo() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button onPress={() => setOpen(true)}>Approve</Button>
			<TaskApprovalModal
				isOpen={open}
				onOpenChange={setOpen}
				onConfirm={() => setOpen(false)}
				labels={{
					title: "Approve task?",
					body: "Approving marks this task complete. You can leave an optional note.",
					noteLabel: "Note (optional)",
					notePlaceholder: "Looks great — shipping it.",
					cancel: "Cancel",
					confirm: "Approve",
					submitting: "Approving…",
				}}
			/>
		</>
	);
}

function RequestChangesModalDemo() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button variant="secondary" onPress={() => setOpen(true)}>
				Request changes
			</Button>
			<RequestChangesModal
				isOpen={open}
				onOpenChange={setOpen}
				onConfirm={() => setOpen(false)}
				labels={{
					title: "Request changes",
					body: "Describe what needs to change. A note is required.",
					noteLabel: "Note",
					notePlaceholder: "Please tighten the headline and swap the hero image.",
					cancel: "Cancel",
					confirm: "Request changes",
					submitting: "Sending…",
				}}
			/>
		</>
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
		id: "combobox",
		group: "Forms",
		title: "Combobox",
		subtitle: "Filterable single-select — type to narrow the list.",
		content: (
			<Demo label="Filter as you type">
				<div className="w-72">
					<ComboBox label="Country" placeholder="Search…">
						<ComboBoxItem id="cz">Czechia</ComboBoxItem>
						<ComboBoxItem id="sk">Slovakia</ComboBoxItem>
						<ComboBoxItem id="pl">Poland</ComboBoxItem>
						<ComboBoxItem id="de">Germany</ComboBoxItem>
						<ComboBoxItem id="at">Austria</ComboBoxItem>
						<ComboBoxItem id="hu">Hungary</ComboBoxItem>
					</ComboBox>
				</div>
			</Demo>
		),
	},
	{
		id: "multi-select",
		group: "Forms",
		title: "Multi-select",
		subtitle: "Choose several options; the trigger summarises the selection.",
		content: (
			<Demo label="Empty · preselected">
				<div className="w-72">
					<MultiSelect
						label="Tags"
						placeholder="Pick tags"
						options={[
							{ id: "brand", label: "Brand" },
							{ id: "print", label: "Print" },
							{ id: "social", label: "Social" },
							{ id: "web", label: "Web" },
							{ id: "motion", label: "Motion" },
						]}
					/>
				</div>
				<div className="w-72">
					<MultiSelect
						label="Preselected"
						placeholder="Pick tags"
						defaultSelectedKeys={["brand", "web", "social"]}
						options={[
							{ id: "brand", label: "Brand" },
							{ id: "print", label: "Print" },
							{ id: "social", label: "Social" },
							{ id: "web", label: "Web" },
						]}
					/>
				</div>
				<div className="w-72">
					<MultiSelect
						label="Searchable (combobox multi)"
						placeholder="Pick countries"
						searchable
						options={[
							{ id: "cz", label: "Czechia" },
							{ id: "sk", label: "Slovakia" },
							{ id: "pl", label: "Poland" },
							{ id: "de", label: "Germany" },
							{ id: "at", label: "Austria" },
							{ id: "hu", label: "Hungary" },
							{ id: "fr", label: "France" },
							{ id: "es", label: "Spain" },
							{ id: "it", label: "Italy" },
						]}
					/>
				</div>
			</Demo>
		),
	},
	{
		id: "rich-text",
		group: "Forms",
		title: "Rich text",
		subtitle: "Dependency-free contentEditable WYSIWYG (ported from the CMS). Emits an HTML string.",
		content: (
			<Demo label="Editor">
				<div className="w-full max-w-xl">
					<RichTextDemo />
				</div>
			</Demo>
		),
	},
	{
		id: "number-field",
		group: "Forms",
		title: "Number field",
		subtitle: "Numeric input with steppers, min/max, and formatting.",
		content: (
			<Demo label="Plain · currency">
				<div className="w-72">
					<NumberField label="Quantity" defaultValue={1} minValue={0} placeholder="0" />
				</div>
				<div className="w-72">
					<NumberField
						label="Price"
						defaultValue={19.99}
						minValue={0}
						formatOptions={{ style: "currency", currency: "EUR" }}
					/>
				</div>
			</Demo>
		),
	},
	{
		id: "search-field",
		group: "Forms",
		title: "Search field",
		subtitle: "Search input with a clear button (Esc clears).",
		content: (
			<Demo label="Default">
				<div className="w-72">
					<SearchField label="Search" placeholder="Search assets…" />
				</div>
			</Demo>
		),
	},
	{
		id: "slider",
		group: "Forms",
		title: "Slider",
		subtitle: "Single value or a range (two-number value).",
		content: (
			<Demo label="Single · range">
				<div className="w-72">
					<Slider label="Opacity" defaultValue={70} maxValue={100} />
				</div>
				<div className="w-72">
					<Slider label="Price range" defaultValue={[20, 80]} maxValue={100} />
				</div>
			</Demo>
		),
	},
	{
		id: "tags",
		group: "Forms",
		title: "Tag group",
		subtitle: "Chips / removable tag input with roving focus.",
		content: (
			<Demo label="Removable">
				<div className="w-full max-w-md">
					<TagGroupDemo />
				</div>
			</Demo>
		),
	},
	{
		id: "file-upload",
		group: "Forms",
		title: "File upload",
		subtitle: "Drop zone + picker (drag-and-drop, keyboard accessible).",
		content: (
			<Demo label="Single · multiple">
				<div className="w-72">
					<FileUpload label="Cover image" accept={["image/*"]} />
				</div>
				<div className="w-72">
					<FileUpload label="Attachments" allowsMultiple />
				</div>
			</Demo>
		),
	},
	{
		id: "date-picker",
		group: "Date & time",
		title: "Date picker",
		subtitle: "Segmented field + calendar popover. Set granularity=\"minute\" for datetime.",
		content: (
			<Demo label="Date · datetime">
				<div className="w-72">
					<DatePicker label="Publish date" />
				</div>
				<div className="w-72">
					<DatePicker label="Publish at" granularity="minute" />
				</div>
			</Demo>
		),
	},
	{
		id: "date-field",
		group: "Date & time",
		title: "Date & time fields",
		subtitle: "Segmented, keyboard-first entry — no calendar.",
		content: (
			<Demo label="DateField · TimeField">
				<div className="w-72">
					<DateField label="Due date" />
				</div>
				<div className="w-72">
					<TimeField label="Reminder" />
				</div>
			</Demo>
		),
	},
	{
		id: "focus-field",
		group: "Focus fields",
		title: "Focus field (focus mode)",
		subtitle:
			"Click a field: it takes over the form at a large size while the rest blurs and dims behind. Esc or a click outside closes it.",
		content: (
			<Demo label="Immersive editing">
				<FocusFieldsDemo />
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
	{
		id: "context-menu",
		group: "Actions",
		title: "Context menu",
		subtitle:
			"Right-click action menu on a dark panel (React Aria: roving focus, type-ahead, viewport-aware). Grouped items with icons, disabled and destructive states.",
		content: (
			<Demo label="Right-click the surface">
				<ContextMenuDemo />
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

				<Demo label="Full-screen (blurred backdrop)">
					<DialogTrigger>
						<Button variant="secondary">Open full-screen</Button>
						<Dialog
							size="full"
							title="Full-screen canvas"
							description="A near-fullscreen takeover over a blurred backdrop — for pickers, editors, galleries."
						>
							{({ close }) => (
								<div className="flex min-h-0 flex-1 flex-col gap-4">
									<div className="flex flex-1 items-center justify-center rounded-lg border border-border bg-surface-card">
										<Text tone="muted">Canvas fills the height; inner content scrolls independently.</Text>
									</div>
									<div className="flex shrink-0 justify-end">
										<Button onPress={close}>Done</Button>
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
	{
		id: "collapsible-card",
		group: "Navigation",
		title: "Collapsible card",
		subtitle: "Titled card with a description and chevron, expanding to reveal a body.",
		content: (
			<Demo label="Expand / collapse">
				<CollapsibleCard
					title="Variables"
					description="Shared variables applied across this template."
					className="w-96"
				>
					<Select label="Color theme" placeholder="White">
						<SelectItem id="white">White</SelectItem>
						<SelectItem id="cream">Cream</SelectItem>
						<SelectItem id="charcoal">Charcoal</SelectItem>
					</Select>
				</CollapsibleCard>
			</Demo>
		),
	},

	// ── Content ──
	{
		id: "typography",
		group: "Content",
		title: "Typography",
		subtitle:
			"Two ramps: <Heading> is the semantic scale (levels 1–5, each with a line-height); <Text> is the size-only UI scale. Plus weights, tones, and how they compose.",
		content: <TypographyShowcase />,
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

	{
		id: "subtle",
		group: "Content",
		title: "Two-tone text",
		subtitle:
			"<Subtle> wraps a run in the light fg-subtle grey; text outside it stays full-contrast. Compose it freely to two-tone any run of a line, in any word order — ideal for greetings and mid-line emphasis.",
		content: (
			<Demo label="Inline de-emphasis">
				<h1 className="text-display font-medium leading-tight text-fg">
					<Subtle>Good afternoon,</Subtle> Jonas 👋
					<br />
					<Subtle>You have</Subtle> 3 planned tasks <Subtle>today</Subtle>
				</h1>
			</Demo>
		),
	},

	// ── Iconography ──
	{
		id: "icons",
		group: "Iconography",
		title: "Icons",
		subtitle:
			"The curated line-icon set — one <XxxIcon> per glyph on a shared 24×24 grid, 2px round stroke, currentColor. Size via className (h-5 w-5…), colour via text-*.",
		content: <IconShowcase />,
	},

	// ── Product patterns (label-driven, ported from gs-platform) ──
	{
		id: "feature-tile",
		group: "Product patterns",
		title: "Feature tile",
		subtitle:
			"Full-width media hero — background image, eyebrow (top-left), title (bottom-left), plus an optional action and badge. Presentational; the whole tile is pressable.",
		content: (
			<Demo label="Media hero">
				<div className="w-full max-w-2xl">
					<FeatureTile
						image="https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=1200&q=80"
						imageAlt="Workspace"
						eyebrow="Tutorial"
						title="Start here — build your first brand system"
						onPress={() => {}}
						pressLabel="Open tutorial"
						action={
							<span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-fg">
								<PlayIcon className="h-5 w-5" />
							</span>
						}
						badge={
							<span className="rounded-full bg-black/40 px-3 py-1 text-caption font-medium text-white">
								4 min
							</span>
						}
					/>
				</div>
			</Demo>
		),
	},
	{
		id: "cta-pill",
		group: "Product patterns",
		title: "CTA pill",
		subtitle:
			"The Brand Core hero CTA — a teal bar with a three-fragment copy line (the middle word emphasised white) and an action control on the right.",
		content: (
			<Demo label="Hero CTA">
				<CtaPill lead="Let's" emphasis="create" tail="something">
					<Button className="rounded-full bg-surface-inverted text-fg-inverted data-[hovered]:opacity-90">
						<PlusIcon className="h-4 w-4" /> Create
					</Button>
				</CtaPill>
			</Demo>
		),
	},
	{
		id: "dashboard",
		group: "Product patterns",
		title: "Dashboard tiles",
		subtitle:
			"StatsCard (KPI), Tile (four themed dashboard cards), Badge (status pill) and DashboardGrid (responsive 12-col grid). All presentational, copy via props.",
		content: (
			<>
				<Demo label="Stat cards (light · badged · dark)">
					<div className="flex flex-wrap gap-4">
						<div className="w-56">
							<StatsCard title="Assets" value="128" footer="+12 this week" />
						</div>
						<div className="w-56">
							<StatsCard
								title="In review"
								value="7"
								badge={<Badge label="Live" color="green" />}
								description="Awaiting approval"
							/>
						</div>
						<div className="w-56">
							<StatsCard dark title="Cloud" value="2.4k" footer="Rendered outputs" />
						</div>
					</div>
				</Demo>
				<Demo label="Tile themes (light · dark · teal · yellow)">
					<div className="flex flex-wrap gap-4">
						{(["light", "dark", "teal", "yellow"] as const).map((theme) => (
							<div key={theme} className="w-48">
								<Tile theme={theme} head={<span className="capitalize">{theme}</span>}>
									<span className={tileStatClass}>Ready</span>
								</Tile>
							</div>
						))}
					</div>
				</Demo>
				<Demo label="Badges">
					<Badge label="Green" color="green" />
					<Badge label="Yellow" color="yellow" />
					<Badge label="Grey" color="grey" />
					<Badge label="Dark" color="dark" />
				</Demo>
				<Demo label="Responsive grid (3 · 3 · 3 · 3 · 6 · 6)">
					<DashboardDemo />
				</Demo>
			</>
		),
	},
	{
		id: "brand-page-header",
		group: "Product patterns",
		title: "Brand page header",
		subtitle:
			"The brand-workspace page header — breadcrumbs, a large two-tone greeting, and a right-column CTA (here the CtaPill hero). Combines Subtle + CtaPill.",
		content: (
			<Demo label="Workspace header">
				<BrandPageHeaderDemo />
			</Demo>
		),
	},

	// ── Delivery (the signature GS delivery UI + job modals) ──
	{
		id: "delivery-status",
		group: "Delivery",
		title: "Delivery status module",
		subtitle:
			"The signature black status surface — white-on-dark header, muted status line, an optional green progress track and trailing “ready” pills.",
		content: (
			<Demo label="Job status">
				<div className="flex w-full max-w-md flex-col gap-4">
					<DeliveryStatusModule
						heading="Rendering outputs"
						headingMeta="60 %"
						statusText="Generating print-ready PDFs…"
						progress={0.6}
					/>
					<DeliveryStatusModule heading="Files ready" headingMeta="3 ready" statusText="All outputs generated.">
						<DeliveryStatusPill>PNG</DeliveryStatusPill>
						<DeliveryStatusPill>PDF/X-4</DeliveryStatusPill>
						<DeliveryStatusPill>ZIP</DeliveryStatusPill>
					</DeliveryStatusModule>
				</div>
			</Demo>
		),
	},
	{
		id: "delivery-modals",
		group: "Delivery",
		title: "Delivery modals",
		subtitle:
			"Presentational job modals — Download (PNG/PDF), Send to print (validated spec) and Publish (destination + channel). Controlled open state; strings via labels.",
		content: (
			<Demo label="Open a modal">
				<DownloadModalDemo />
				<SendToPrintModalDemo />
				<PublishModalDemo />
			</Demo>
		),
	},
	{
		id: "approval-modals",
		group: "Delivery",
		title: "Approval modals",
		subtitle:
			"Task approval (optional note) and Request changes (required note — confirm stays disabled until non-empty). Both delegate the action via onConfirm.",
		content: (
			<Demo label="Approve / request changes">
				<TaskApprovalModalDemo />
				<RequestChangesModalDemo />
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

const GROUP_ORDER = [
	"Forms",
	"Date & time",
	"Focus fields",
	"Modals",
	"Actions",
	"Overlays",
	"Navigation",
	"Content",
	"Iconography",
	"Product patterns",
	"Delivery",
	"Tokens",
];

// Canvas background options — the surfaces a component realistically sits on.
// "Dark" flips the whole page to the dark token set via [data-theme="dark"]
// (landed with the dark theme block in @podoba/tokens), so `--color-surface` &
// friends resolve to their dark values — including react-aria portals on <html>.
const BACKGROUNDS = [
	{ id: "surface", label: "White", v: "--color-surface" },
	{ id: "surface-card", label: "Cream", v: "--color-surface-card" },
	{ id: "surface-muted", label: "Muted", v: "--color-surface-muted" },
	{ id: "dark", label: "Dark", v: "--color-surface" },
] as const;

export function App() {
	const [bg, setBg] = useState<(typeof BACKGROUNDS)[number]["id"]>("surface");
	const [query, setQuery] = useState("");
	const [active, setActive] = useState(SECTIONS[0].id);
	const canvasRef = useRef<HTMLDivElement>(null);

	// "Dark" flips the whole document (chrome + canvas + react-aria portals) to the
	// dark token set; the other backgrounds stay on the light set.
	useEffect(() => {
		const root = document.documentElement;
		if (bg === "dark") root.dataset.theme = "dark";
		else delete root.dataset.theme;
		return () => {
			delete root.dataset.theme;
		};
	}, [bg]);

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
						<span className="text-heading5 font-medium text-fg">podoba</span>
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
							<span className="px-3 pb-1 text-micro font-medium uppercase tracking-wider text-fg-subtle">
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
				{/* `relative` establishes a containing block so react-aria's hidden
				    position:absolute field sentinels anchor here and are clipped by
				    overflow — otherwise they anchor to <html> and inflate page scroll. */}
				<div
					ref={canvasRef}
					className="relative flex-1 overflow-y-auto transition-colors"
					style={{ background: `var(--color-${bg})` }}
				>
					<div className="mx-auto flex max-w-5xl flex-col gap-24 px-10 py-16">
						{SECTIONS.map((s) => (
							<section key={s.id} id={s.id} data-section className="flex scroll-mt-8 flex-col gap-8">
								<div className="flex flex-col gap-1.5">
									<span className="text-micro font-medium uppercase tracking-wider text-fg-subtle">{s.group}</span>
									<h2 className="text-heading3 font-medium text-fg">{s.title}</h2>
									{s.subtitle ? <p className="max-w-2xl text-sm leading-relaxed text-fg-muted">{s.subtitle}</p> : null}
								</div>
								<div className="flex flex-col gap-12">{s.content}</div>
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
