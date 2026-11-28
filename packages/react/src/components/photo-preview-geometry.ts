/**
 * Geometry for `PhotoPreview`: the photo fitted inside the frame with a 32px inset, and
 * the scale that makes it cover the frame edge to edge. `null` while a size is unknown.
 */
export function photoPreviewGeometry(width: number, height: number, imageWidth: number, imageHeight: number) {
	if (![width, height, imageWidth, imageHeight].every((value) => Number.isFinite(value) && value > 0)) return null
	const inset = 32
	const contain = Math.min(Math.max(1, width - inset * 2) / imageWidth, Math.max(1, height - inset * 2) / imageHeight)
	const cover = Math.max(width / imageWidth, height / imageHeight)
	return { width: imageWidth * contain, height: imageHeight * contain, coverScale: cover / contain }
}

/** Keep a zoomed photo covering the frame: it pans only as far as its cropped edges. */
export function clampPhotoPan(x: number, y: number, frameWidth: number, frameHeight: number, imageWidth: number, imageHeight: number) {
	const maxX = Math.max(0, (imageWidth - frameWidth) / 2)
	const maxY = Math.max(0, (imageHeight - frameHeight) / 2)
	return { x: maxX ? Math.max(-maxX, Math.min(maxX, x)) : 0, y: maxY ? Math.max(-maxY, Math.min(maxY, y)) : 0 }
}
