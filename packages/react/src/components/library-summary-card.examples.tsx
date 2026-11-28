import { LibrarySummaryCard } from './library-summary-card'

// Synthetic artwork, inline so the gallery needs no files.
const photo = `data:image/svg+xml,${encodeURIComponent(
	'<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a7bd5"/><stop offset="1" stop-color="#f7b733"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/><circle cx="560" cy="220" r="90" fill="#fff" opacity=".55"/></svg>',
)}`
const logo = `data:image/svg+xml,${encodeURIComponent(
	'<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80"><rect x="4" y="4" width="72" height="72" rx="16" fill="#111"/><text x="92" y="52" font-family="sans-serif" font-size="32" font-weight="700" fill="#111">Acme</text></svg>',
)}`

const cell = 'h-[280px] w-full min-w-0 md:h-[380px]'

export const examples = {
	photo: () => (
		<div className={cell}>
			<LibrarySummaryCard title="Images" file={{ name: 'Court at dusk', src: photo, contentType: 'image/png', filename: 'court.png' }} footer="12 other files" onPress={() => {}} />
		</div>
	),
	logo: () => (
		<div className={cell}>
			<LibrarySummaryCard title="Logos" file={{ name: 'Acme logo', src: logo, contentType: 'image/svg+xml', filename: 'acme.svg' }} footer="No other files" onPress={() => {}} />
		</div>
	),
	document: () => (
		<div className={cell}>
			<LibrarySummaryCard
				title="Documents"
				file={{ name: 'Season schedule 2026', contentType: 'application/pdf', filename: 'schedule-2026.pdf' }}
				fileTitle={
					<span className="text-fg-muted">
						Your latest document is <span className="text-fg">Season schedule 2026</span>.
					</span>
				}
				footer="More files available"
				onPress={() => {}}
			/>
		</div>
	),
	recent: () => (
		<div className={cell}>
			<LibrarySummaryCard
				title="Recently added"
				documentLayout="centered"
				file={{ name: 'Members', contentType: 'text/csv', filename: 'members.csv' }}
				footer="Added 1 Mar 2026"
				onPress={() => {}}
			/>
		</div>
	),
	empty: () => (
		<div className={cell}>
			<LibrarySummaryCard
				title="Videos"
				emptyTitle={
					<span className="text-fg-muted">
						No <span className="text-fg">videos</span> yet.
					</span>
				}
				onPress={() => {}}
			/>
		</div>
	),
}
export const meta = {
	category: 'Display',
	description: 'One tile of a library overview: the latest file of a group as a cover image or video, an inset SVG, or a document line. Text comes in as props.',
}
