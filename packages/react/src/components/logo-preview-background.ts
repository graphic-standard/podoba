export type LogoPreviewTone = 'light' | 'dark'

/**
 * Pick the preview surface that contrasts with a logo, from its RGBA pixels. Transparent
 * padding is ignored and partly transparent pixels count by their opacity. `null` when
 * nothing is visible.
 */
export function logoBackgroundFromPixels(pixels: Uint8ClampedArray): LogoPreviewTone | null {
	let visibleWeight = 0
	let brightness = 0
	const channel = (value: number) => {
		const c = value / 255
		return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
	}
	for (let index = 0; index + 3 < pixels.length; index += 4) {
		const opacity = pixels[index + 3]! / 255
		if (opacity < 0.05) continue
		const luminance = 0.2126 * channel(pixels[index]!) + 0.7152 * channel(pixels[index + 1]!) + 0.0722 * channel(pixels[index + 2]!)
		brightness += luminance * opacity
		visibleWeight += opacity
	}
	if (!visibleWeight) return null
	// Compare the mean luminance with the two neutral preview surfaces.
	const mean = brightness / visibleWeight
	return Math.abs(mean - 0.03) >= Math.abs(mean - 0.92) ? 'dark' : 'light'
}

/**
 * `logoBackgroundFromPixels` for a loaded image, sampled at 96×96. `null` when the image
 * has no size yet, or its pixels cannot be read (a cross-origin image without CORS).
 */
export function detectLogoBackground(image: HTMLImageElement): LogoPreviewTone | null {
	if (!image.naturalWidth || !image.naturalHeight) return null
	try {
		const canvas = document.createElement('canvas')
		canvas.width = 96
		canvas.height = 96
		const context = canvas.getContext('2d', { willReadFrequently: true })
		if (!context) return null
		context.drawImage(image, 0, 0, canvas.width, canvas.height)
		return logoBackgroundFromPixels(context.getImageData(0, 0, canvas.width, canvas.height).data)
	} catch {
		return null
	}
}
