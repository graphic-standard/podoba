import {
	Button,
	Card,
	Checkbox,
	Heading,
	Input,
	Radio,
	RadioGroup,
	Select,
	SelectItem,
	Separator,
	Switch,
	Tab,
	TabList,
	TabPanel,
	Tabs,
	Text,
	Textarea,
} from "@podoba/react";
import type { ReactNode } from "react";

// ── gallery chrome ──────────────────────────────────────────────────────────
// A tiny local framework: `Section` groups a component's demos, `Demo` labels a
// single specimen. Deliberately plain — the point is to see the real components,
// not to build a design tool.

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
	return (
		<section className="flex flex-col gap-5 border-b border-border py-10">
			<div className="flex flex-col gap-1">
				<h2 className="text-heading3 font-semibold text-fg">{title}</h2>
				{subtitle ? <p className="text-sm text-fg-muted">{subtitle}</p> : null}
			</div>
			<div className="flex flex-col gap-6">{children}</div>
		</section>
	);
}

function Demo({ label, children }: { label: string; children: ReactNode }) {
	return (
		<div className="flex flex-col gap-2">
			<span className="text-micro font-medium uppercase tracking-wide text-fg-subtle">{label}</span>
			<div className="flex flex-wrap items-start gap-4">{children}</div>
		</div>
	);
}

const SWATCHES: { name: string; var: string }[] = [
	{ name: "surface", var: "--color-surface" },
	{ name: "surface-card", var: "--color-surface-card" },
	{ name: "surface-muted", var: "--color-surface-muted" },
	{ name: "brand-green", var: "--color-brand-green" },
	{ name: "fg", var: "--color-fg" },
	{ name: "fg-muted", var: "--color-fg-muted" },
	{ name: "fg-subtle", var: "--color-fg-subtle" },
	{ name: "border", var: "--color-border" },
	{ name: "danger", var: "--color-danger" },
	{ name: "success", var: "--color-success" },
];

export function App() {
	return (
		<main className="mx-auto flex max-w-3xl flex-col px-6 pb-24">
			<header className="flex flex-col gap-2 py-12">
				<h1 className="text-heading1 font-semibold text-fg">podoba · gallery</h1>
				<p className="text-body text-fg-muted">
					Every <code className="rounded bg-surface-muted px-1 py-0.5 text-sm">@podoba/react</code> primitive, live
					from source. Edit a component and it hot-reloads here.
				</p>
			</header>

			{/* ── Fields: the focus of the recent fix ── */}
			<Section
				title="Text fields"
				subtitle="Active fields now use a white fill so they read as editable — including inside a Card (which shares the cream surface)."
			>
				<Demo label="On the page (white surface)">
					<div className="w-72">
						<Input label="Label" placeholder="Type here…" />
					</div>
					<div className="w-72">
						<Input label="With description" placeholder="you@example.com" description="We'll never share it." />
					</div>
				</Demo>

				<Demo label="Inside a Card (cream surface) — the fix in action">
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
			</Section>

			<Section title="Select" subtitle="Trigger matched to the text fields (white fill + border).">
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
			</Section>

			<Section title="Buttons">
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
			</Section>

			<Section title="Selection controls">
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
			</Section>

			<Section title="Typography" subtitle="The Text / Heading type ramp.">
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
			</Section>

			<Section title="Layout">
				<Demo label="Card variants">
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
				<Demo label="Separator">
					<div className="w-72">
						<Text size="compact">Above</Text>
						<Separator className="my-3" />
						<Text size="compact">Below</Text>
					</div>
				</Demo>
				<Demo label="Tabs">
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
			</Section>

			<Section title="Tokens" subtitle="Core colour swatches.">
				<Demo label="Colours">
					{SWATCHES.map((s) => (
						<div key={s.name} className="flex w-28 flex-col gap-1">
							<div
								className="h-12 w-full rounded-md border border-border"
								style={{ background: `var(${s.var})` }}
							/>
							<span className="text-micro text-fg-muted">{s.name}</span>
						</div>
					))}
				</Demo>
			</Section>
		</main>
	);
}
