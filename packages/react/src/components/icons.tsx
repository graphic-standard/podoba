import type { SVGProps } from 'react'

/**
 * Icon set — the design system's curated line icons. One `<XxxIcon>` per glyph, all
 * on a shared 24×24 grid, `currentColor`, 2px round stroke. Size via `className`
 * (`h-4 w-4`, …) or width/height; colour via `text-*`. This replaces the ad-hoc inline
 * `<svg>`s scattered across the app so every icon reads as one family.
 *
 * Fill-based glyphs (Play, Triangle) set `fill="currentColor" stroke="none"`; the rest
 * are stroked. Add a glyph here (not inline) when a new one is needed.
 */
export type IconProps = SVGProps<SVGSVGElement>

const STROKE: IconProps = {
	width: 24,
	height: 24,
	viewBox: '0 0 24 24',
	fill: 'none',
	stroke: 'currentColor',
	strokeWidth: 2,
	strokeLinecap: 'round',
	strokeLinejoin: 'round',
	'aria-hidden': true,
}
const FILL: IconProps = {
	width: 24,
	height: 24,
	viewBox: '0 0 24 24',
	fill: 'currentColor',
	stroke: 'none',
	'aria-hidden': true,
}

// --- navigation / chevrons ---
export const ChevronDownIcon = (p: IconProps) => (
	<svg {...STROKE} {...p}><path d="M6 9l6 6 6-6" /></svg>
)
export const ChevronUpIcon = (p: IconProps) => (
	<svg {...STROKE} {...p}><path d="M18 15l-6-6-6 6" /></svg>
)
export const ChevronRightIcon = (p: IconProps) => (
	<svg {...STROKE} {...p}><path d="M9 6l6 6-6 6" /></svg>
)
export const ChevronLeftIcon = (p: IconProps) => (
	<svg {...STROKE} {...p}><path d="M15 6l-6 6 6 6" /></svg>
)
export const ArrowRightIcon = (p: IconProps) => (
	<svg {...STROKE} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
)

// --- actions ---
export const CloseIcon = (p: IconProps) => (
	<svg {...STROKE} {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>
)
export const CheckIcon = (p: IconProps) => (
	<svg {...STROKE} {...p}><path d="M20 6L9 17l-5-5" /></svg>
)
export const PlusIcon = (p: IconProps) => (
	<svg {...STROKE} {...p}><path d="M12 5v14M5 12h14" /></svg>
)
export const MinusIcon = (p: IconProps) => (
	<svg {...STROKE} {...p}><path d="M5 12h14" /></svg>
)
export const SearchIcon = (p: IconProps) => (
	<svg {...STROKE} {...p}>
		<circle cx="11" cy="11" r="7" />
		<path d="M21 21l-4.3-4.3" />
	</svg>
)
export const PlayIcon = (p: IconProps) => (
	<svg {...FILL} {...p}><path d="M8 5v14l11-7z" /></svg>
)
export const MenuIcon = (p: IconProps) => (
	<svg {...STROKE} {...p}><path d="M4 6h16M4 12h16M4 18h16" /></svg>
)
export const ExternalLinkIcon = (p: IconProps) => (
	<svg {...STROKE} {...p}>
		<path d="M15 3h6v6M21 3l-9 9M10 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
	</svg>
)
export const ExpandIcon = (p: IconProps) => (
	<svg {...STROKE} {...p}><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
)

// --- theme ---
export const SunIcon = (p: IconProps) => (
	<svg {...STROKE} {...p}>
		<circle cx="12" cy="12" r="4" />
		<path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
	</svg>
)
export const MoonIcon = (p: IconProps) => (
	<svg {...STROKE} {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
)

// --- objects ---
export const FileTextIcon = (p: IconProps) => (
	<svg {...STROKE} {...p}>
		<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
		<path d="M14 3v5h5M9 13h6M9 17h4" />
	</svg>
)
export const FolderIcon = (p: IconProps) => (
	<svg {...STROKE} {...p}>
		<path d="M3 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
	</svg>
)
export const ImageIcon = (p: IconProps) => (
	<svg {...STROKE} {...p}>
		<rect x="3" y="4" width="18" height="16" rx="2" />
		<circle cx="8.5" cy="9.5" r="1.5" />
		<path d="M4 17l5-4 4 3 3-2 4 3" />
	</svg>
)
export const CalendarIcon = (p: IconProps) => (
	<svg {...STROKE} {...p}>
		<rect x="3" y="5" width="18" height="16" rx="2" />
		<path d="M16 3v4M8 3v4M3 10h18" />
	</svg>
)
export const TrashIcon = (p: IconProps) => (
	<svg {...STROKE} {...p}>
		<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M10 11v6M14 11v6" />
	</svg>
)
export const StarIcon = (p: IconProps) => (
	<svg {...STROKE} {...p}>
		<path d="M12 3l2.7 5.5 6 .9-4.4 4.2 1 6L12 17l-5.4 2.8 1-6L3.2 9.4l6-.9z" />
	</svg>
)
export const UserIcon = (p: IconProps) => (
	<svg {...STROKE} {...p}>
		<circle cx="12" cy="8" r="4" />
		<path d="M4 20a8 8 0 0 1 16 0" />
	</svg>
)
export const UploadIcon = (p: IconProps) => (
	<svg {...STROKE} {...p}><path d="M12 16V4M8 8l4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>
)
export const DownloadIcon = (p: IconProps) => (
	<svg {...STROKE} {...p}><path d="M12 4v12M8 12l4 4 4-4M4 18v0a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2" /></svg>
)
