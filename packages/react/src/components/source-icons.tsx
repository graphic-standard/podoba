import type { IconProps } from './icons'

/**
 * Original Manager glyphs that the curated 24px line set in `icons.tsx` has no
 * equivalent for. The Radix ones are Radix Icons 1.3.2 (MIT) on their 15px grid,
 * filled with `currentColor`, exactly as the Manager rendered them (the document
 * library Scope / Role / Status column headers). `SwitchViewIcon` is the Manager's
 * 16px "switch view" burst shown on a selected switchable section tab.
 *
 * All are decorative (`aria-hidden`); size via width/height or `className`.
 */

/** Radix `LayersIcon` (document library "Scope" header). */
export const LayersIcon = (props: IconProps) => (
	<svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true" {...props}>
		<path
			d="M7.75432 0.819537C7.59742 0.726821 7.4025 0.726821 7.24559 0.819537L1.74559 4.06954C1.59336 4.15949 1.49996 4.32317 1.49996 4.5C1.49996 4.67683 1.59336 4.84051 1.74559 4.93046L7.24559 8.18046C7.4025 8.27318 7.59742 8.27318 7.75432 8.18046L13.2543 4.93046C13.4066 4.84051 13.5 4.67683 13.5 4.5C13.5 4.32317 13.4066 4.15949 13.2543 4.06954L7.75432 0.819537ZM7.49996 7.16923L2.9828 4.5L7.49996 1.83077L12.0171 4.5L7.49996 7.16923ZM1.5695 7.49564C1.70998 7.2579 2.01659 7.17906 2.25432 7.31954L7.49996 10.4192L12.7456 7.31954C12.9833 7.17906 13.2899 7.2579 13.4304 7.49564C13.5709 7.73337 13.4921 8.03998 13.2543 8.18046L7.75432 11.4305C7.59742 11.5232 7.4025 11.5232 7.24559 11.4305L1.74559 8.18046C1.50786 8.03998 1.42901 7.73337 1.5695 7.49564ZM1.56949 10.4956C1.70998 10.2579 2.01658 10.1791 2.25432 10.3195L7.49996 13.4192L12.7456 10.3195C12.9833 10.1791 13.2899 10.2579 13.4304 10.4956C13.5709 10.7334 13.4921 11.04 13.2543 11.1805L7.75432 14.4305C7.59742 14.5232 7.4025 14.5232 7.24559 14.4305L1.74559 11.1805C1.50785 11.04 1.42901 10.7334 1.56949 10.4956Z"
			fill="currentColor"
			fillRule="evenodd"
			clipRule="evenodd"
		/>
	</svg>
)

/** Radix `BadgeIcon` (document library "Role" header). */
export const BadgeIcon = (props: IconProps) => (
	<svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true" {...props}>
		<path
			d="M3.5 6H11.5C12.3284 6 13 6.67157 13 7.5C13 8.32843 12.3284 9 11.5 9H3.5C2.67157 9 2 8.32843 2 7.5C2 6.67157 2.67157 6 3.5 6ZM1 7.5C1 6.11929 2.11929 5 3.5 5H11.5C12.8807 5 14 6.11929 14 7.5C14 8.88071 12.8807 10 11.5 10H3.5C2.11929 10 1 8.88071 1 7.5ZM4.5 7C4.22386 7 4 7.22386 4 7.5C4 7.77614 4.22386 8 4.5 8H10.5C10.7761 8 11 7.77614 11 7.5C11 7.22386 10.7761 7 10.5 7H4.5Z"
			fill="currentColor"
			fillRule="evenodd"
			clipRule="evenodd"
		/>
	</svg>
)

/** Radix `CheckCircledIcon` (document library "Status" header). */
export const CheckCircledIcon = (props: IconProps) => (
	<svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true" {...props}>
		<path
			d="M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1575 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM10.1589 5.53774C10.3178 5.31191 10.2636 5.00001 10.0378 4.84109C9.81194 4.68217 9.50004 4.73642 9.34112 4.96225L6.51977 8.97154L5.35681 7.78706C5.16334 7.59002 4.84677 7.58711 4.64973 7.78058C4.45268 7.97404 4.44978 8.29061 4.64325 8.48765L6.22658 10.1003C6.33054 10.2062 6.47617 10.2604 6.62407 10.2483C6.77197 10.2363 6.90686 10.1591 6.99226 10.0377L10.1589 5.53774Z"
			fill="currentColor"
			fillRule="evenodd"
			clipRule="evenodd"
		/>
	</svg>
)

/** Manager "switch view" burst (16px grid, 1.5px round stroke). */
export const SwitchViewIcon = (props: IconProps) => (
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
		<path d="M8 2V6M8 10V14M2 8H6M10 8H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
		<path
			d="M11.657 4.343L13.071 2.929M2.929 13.071L4.343 11.657M13.071 13.071L11.657 11.657M4.343 4.343L2.929 2.929"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
		/>
	</svg>
)
