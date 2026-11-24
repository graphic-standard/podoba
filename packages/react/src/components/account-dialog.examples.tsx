import { useState } from 'react'
import {
	AccountButton,
	AccountDialog,
	AccountDialogName,
	AccountPreferenceCard,
	type AccountApp,
	type AccountDialogLabels,
	type AccountDialogUser,
} from './account-dialog'
import { Button } from './button'
import { Switch } from './switch'
import { Text } from './text'

// Synthetic artwork only: simple SVG shapes as data URLs, no product illustrations.
const svg = (body: string) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">${body}</svg>`)}`

const FIGURE = svg(
	'<circle cx="200" cy="150" r="70" fill="#f2c9a0"/><path d="M80 400c0-80 50-140 120-140s120 60 120 140z" fill="#2f3e46"/><path d="M135 120c10-50 120-60 130 0-30-20-100-20-130 0z" fill="#3a2a1f"/>',
)
const PICTURE = svg('<rect width="400" height="400" rx="200" fill="#c7d8c4"/><circle cx="200" cy="160" r="70" fill="#f2c9a0"/><path d="M80 400c0-80 50-140 120-140s120 60 120 140z" fill="#2f3e46"/>')
const poster = (fill: string, accent: string) =>
	svg(`<rect x="90" y="70" width="220" height="160" rx="18" fill="${fill}"/><circle cx="160" cy="140" r="34" fill="${accent}"/><rect x="210" y="120" width="70" height="14" rx="7" fill="${accent}"/><rect x="210" y="150" width="50" height="14" rx="7" fill="${accent}" opacity=".5"/>`)

const user: AccountDialogUser = { name: 'Alex Novak', picture: PICTURE, figure: FIGURE, background: '#c7d8c4' }

const labels: AccountDialogLabels = {
	close: 'Close',
	apps: 'Your apps',
	preferences: 'Settings',
	soon: 'Coming soon',
	signOut: 'Sign out',
	version: 'App version',
}

const greeting = (
	<>
		<AccountDialogName>Alex</AccountDialogName>, everything you need
		<br />
		is right here.
	</>
)

function apps(current: string, linked: boolean): AccountApp[] {
	const target = (path: string) => (linked ? { href: `#${path}` } : { onPress: () => {} })
	return [
		{ id: 'studio', name: 'Studio', description: 'Work with your brand.', ...target('studio'), artwork: { poster: poster('#e7e3d8', '#8aa38a') } },
		{ id: 'sites', name: 'Sites', description: 'Edit your websites.', ...target('sites'), artwork: { poster: poster('#dfe6ee', '#6b8bb0') } },
		{ id: 'partners', name: 'Partners', description: 'Manage clients and brands.', ...target('partners'), lockedLabel: 'Admins only', artwork: { poster: poster('#eadfe8', '#a5789a') } },
		{ id: 'print', name: 'Print', description: 'Send ideas to print.', soon: true },
	].map((app) => ({ ...app, current: app.id === current, autoFocus: app.id === current }))
}

function ThemePreference() {
	const [dark, setDark] = useState(false)
	return (
		<AccountPreferenceCard title="Appearance" hint="Choose a light or a dark interface.">
			<Switch isSelected={dark} onChange={setDark}>
				Dark mode
			</Switch>
		</AccountPreferenceCard>
	)
}

function Harness({ children }: { children: (props: { isOpen: boolean; onOpenChange: (open: boolean) => void }) => React.ReactNode }) {
	const [open, setOpen] = useState(false)
	return (
		<>
			<AccountButton user={user} label="Account" onPress={() => setOpen(true)} />
			{open ? children({ isOpen: open, onOpenChange: setOpen }) : null}
		</>
	)
}

/** The suite's own app: apps open in place, three preferences, an editable avatar. */
function SuiteExample() {
	return (
		<Harness>
			{(state) => (
				<AccountDialog
					{...state}
					user={user}
					title={greeting}
					heroAction={<Button variant="secondary" size="sm">Edit avatar</Button>}
					apps={apps('studio', false)}
					preferences={
						<>
							<ThemePreference />
							<AccountPreferenceCard title="Language" hint="Choose the interface language.">
								<Text size="small">English</Text>
							</AccountPreferenceCard>
							<AccountPreferenceCard title="Workspace" hint="Northwind Studio">
								<Text size="small">Switch workspace</Text>
							</AccountPreferenceCard>
						</>
					}
					onSignOut={() => state.onOpenChange(false)}
					version="1.42.0"
					labels={labels}
				/>
			)}
		</Harness>
	)
}

/** An editor elsewhere: apps are links, the profile is edited in the suite, extra rows in the footer. */
function EditorExample() {
	return (
		<Harness>
			{(state) => (
				<AccountDialog
					{...state}
					user={user}
					title={greeting}
					subtitle="alex@example.com · Roles: Editor"
					apps={apps('sites', true).filter((app) => app.id !== 'partners')}
					preferences={<ThemePreference />}
					actions={[
						{ id: 'profile', label: 'Profile and settings', href: '#profile' },
						{ id: 'schema', label: 'Content structure', onPress: () => state.onOpenChange(false) },
					]}
					onSignOut={() => state.onOpenChange(false)}
					labels={labels}
				/>
			)}
		</Harness>
	)
}

/** No illustrated avatar yet: initials on a neutral hero. */
function InitialsExample() {
	return (
		<Harness>
			{(state) => (
				<AccountDialog
					{...state}
					user={{ name: 'Alex Novak' }}
					title={greeting}
					apps={apps('sites', true)}
					onSignOut={() => state.onOpenChange(false)}
					labels={labels}
				/>
			)}
		</Harness>
	)
}

/** An app card that drills into a list inside the dialog. */
function PanelExample() {
	const [panel, setPanel] = useState(false)
	return (
		<Harness>
			{(state) => (
				<AccountDialog
					{...state}
					user={user}
					title={greeting}
					apps={apps('studio', false).map((app) => (app.id === 'sites' ? { ...app, onPress: () => setPanel(true) } : app))}
					panelTitle="Sites"
					panel={
						panel ? (
							<div className="flex flex-col gap-6 p-5">
								<div className="flex items-center justify-between gap-3">
									<Button variant="secondary" autoFocus onPress={() => setPanel(false)}>Back</Button>
									<h2 className="text-heading2 font-medium text-fg">Sites</h2>
									<span />
								</div>
								<Text tone="muted">northwind.example · harbour.example</Text>
							</div>
						) : undefined
					}
					onSignOut={() => state.onOpenChange(false)}
					labels={labels}
				/>
			)}
		</Harness>
	)
}

export const examples = {
	suite: () => <SuiteExample />,
	editor: () => <EditorExample />,
	initials: () => <InitialsExample />,
	panel: () => <PanelExample />,
}
export const meta = {
	category: 'Composite',
	description:
		'The window behind the avatar, shared by every app of the suite: illustrated hero, greeting, app cards (links or buttons, hover artwork), preference cards, extra sections and footer rows.',
}
