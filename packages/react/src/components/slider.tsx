import type { ReactNode } from 'react'
import { Label, Slider as RACSlider, type SliderProps as RACSliderProps, SliderThumb, SliderTrack } from 'react-aria-components'

export const SLIDER_SIZES = ['md', 'sm'] as const
export type SliderSize = (typeof SLIDER_SIZES)[number]
export const SLIDER_TONES = ['default', 'inverted'] as const
export type SliderTone = (typeof SLIDER_TONES)[number]

/**
 * Slider — a draggable value selector (single value or a range when `value`/
 * `defaultValue` is a two-number array). Built on React Aria Components `Slider`
 * (keyboard support, RTL, ARIA). The filled portion is brand-green and each
 * thumb carries its current value next to it (respects `formatOptions`).
 * `orientation="vertical"` renders a 12rem tall track with the minimum at the
 * bottom and the value label to the right of each thumb.
 *
 * `size="sm"` is the compact toolbar slider: one 24px row, the label kept for
 * screen readers only and no value label (show your own readout beside it).
 * `tone="inverted"` draws it for a dark surface such as a `bg-brand-primary` pill.
 */
export type SliderProps<T extends number | number[]> = Omit<RACSliderProps<T>, 'className'> & {
	/** Label (required for accessibility); visually hidden when `size="sm"`. */
	label: ReactNode
	/** Hide the value label next to each thumb (always hidden when `size="sm"`). */
	hideValue?: boolean
	size?: SliderSize
	tone?: SliderTone
	/** Extra classes on the root, for layout such as a fixed width. */
	className?: string
	/**
	 * Drawn on the track between the rail and the fill, positioned absolutely
	 * against the track: e.g. a marked stretch of the range.
	 */
	trackAdornment?: ReactNode
}

const RAIL = { md: { horizontal: 'h-1.5 w-full', vertical: 'h-full w-1.5' }, sm: { horizontal: 'h-1 w-full', vertical: 'h-full w-1' } }
const FILL = { md: { horizontal: 'h-1.5', vertical: 'w-1.5' }, sm: { horizontal: 'h-1', vertical: 'w-1' } }
const THUMB_SIZE = { md: 'h-4 w-4', sm: 'h-3.5 w-3.5' }
const THUMB_TONE = {
	default: 'border-2 border-fg bg-surface data-[focus-visible]:ring-ring',
	inverted: 'bg-fg-inverted data-[focus-visible]:ring-brand-green',
}
const RAIL_TONE = { default: 'bg-surface-muted', inverted: 'bg-fg-inverted/30' }
const TEXT_TONE = { default: 'text-fg', inverted: 'text-fg-inverted' }

function trackClassName(size: SliderSize, vertical: boolean): string {
	if (vertical) return 'relative flex h-48 w-6 justify-center'
	// mt-6 leaves room for the value label that sits above each thumb.
	return size === 'sm' ? 'relative flex h-6 w-full items-center' : 'relative mt-6 flex h-6 w-full items-center'
}

export const Slider = <T extends number | number[]>({
	label,
	hideValue,
	size = 'md',
	tone = 'default',
	className,
	trackAdornment,
	...props
}: SliderProps<T>) => {
	const compact = size === 'sm'
	const showValue = !hideValue && !compact
	return (
		<RACSlider
			{...props}
			className={`flex flex-col data-[disabled]:opacity-50${compact ? '' : ' gap-1.5'}${className ? ` ${className}` : ''}`}
		>
			<Label className={compact ? 'sr-only' : `text-heading5 font-medium ${TEXT_TONE[tone]}`}>{label}</Label>
			<SliderTrack className={({ orientation }) => trackClassName(size, orientation === 'vertical')}>
				{({ state }) => {
					const isVertical = state.orientation === 'vertical'
					const axis = isVertical ? 'vertical' : 'horizontal'
					const start = state.values.length > 1 ? state.getThumbPercent(0) : 0
					const end = state.getThumbPercent(state.values.length - 1)
					return (
						<>
							<div className={`rounded-full ${RAIL_TONE[tone]} ${RAIL[size][axis]}`} />
							{trackAdornment}
							<div
								className={`absolute rounded-full bg-brand-green ${FILL[size][axis]}`}
								style={
									isVertical
										? { bottom: `${start * 100}%`, height: `${(end - start) * 100}%` }
										: { left: `${start * 100}%`, width: `${(end - start) * 100}%` }
								}
							/>
							{state.values.map((_, i) => (
								<SliderThumb
									// biome-ignore lint/suspicious/noArrayIndexKey: thumbs are positional and fixed-count
									key={i}
									index={i}
									// React Aria positions the thumb along the track (`left` or, when
									// vertical, `top`) with `translate(-50%, -50%)` but leaves the
									// cross axis unset, so center it there ourselves.
									className={`${isVertical ? 'left-1/2' : 'top-1/2'} ${THUMB_SIZE[size]} ${THUMB_TONE[tone]} rounded-full outline-none transition-transform data-[dragging]:scale-110 data-[focus-visible]:ring-2`}
								>
									{showValue ? (
										<span
											className={`pointer-events-none absolute whitespace-nowrap text-label font-medium tabular-nums ${TEXT_TONE[tone]} ${isVertical ? 'top-1/2 left-full ml-2 -translate-y-1/2' : '-top-6 left-1/2 -translate-x-1/2'}`}
										>
											{state.getThumbValueLabel(i)}
										</span>
									) : null}
								</SliderThumb>
							))}
						</>
					)
				}}
			</SliderTrack>
		</RACSlider>
	)
}
