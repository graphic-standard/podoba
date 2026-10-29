import { ZoomableImage } from './zoomable-image'
const src =
	'data:image/svg+xml,' +
	encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600"><rect width="400" height="600" fill="white"/><text x="30" y="100">Artwork</text></svg>',
	)
export const examples = {
	default: () => (
		<div className="h-96">
			<ZoomableImage src={src} alt="Artwork page" label="Zoom with wheel or plus and minus; pan with arrow keys" />
		</div>
	),
	variants: () => (
		<div className="h-96">
			<ZoomableImage
				src={src}
				alt="Artwork page"
				label="Rule source"
				region={{ x: 0.05, y: 0.1, width: 0.8, height: 0.15 }}
				regionLabel="Rule source area"
			/>
		</div>
	),
	states: () => (
		<div className="h-48">
			<ZoomableImage src={src} alt="Compact artwork page" label="Compact rule source" />
		</div>
	),
}
export const meta = {
	category: 'Composite',
	description: 'Accessible image stage with initial region focus, wheel zoom and pointer pan.',
}
