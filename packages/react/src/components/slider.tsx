import type { ReactNode } from 'react'
import { Label, Slider as RACSlider, type SliderProps as RACSliderProps, SliderThumb, SliderTrack } from 'react-aria-components'

/**
 * Slider — a draggable value selector (single value or a range when `value`/
 * `defaultValue` is a two-number array). Built on React Aria Components `Slider`
 * (keyboard support, RTL, ARIA). The filled portion is brand-green and each
 * thumb carries its current value next to it (respects `formatOptions`).
 * `orientation="vertical"` renders a 12rem tall track with the minimum at the
 * bottom and the value label to the right of each thumb.
 */
export type SliderProps<T extends number | number[]> = RACSliderProps<T> & {
	/** Visible label (required for accessibility). */
	label: ReactNode
	/** Hide the value label next to each thumb. */
	hideValue?: boolean
}

export const Slider = <T extends number | number[]>({ label, hideValue, ...props }: SliderProps<T>) => (
	<RACSlider {...props} className="flex flex-col gap-1.5 data-[disabled]:opacity-50">
		<Label className="text-heading5 font-medium text-fg">{label}</Label>
		<SliderTrack
			className={({ orientation }) =>
				orientation === 'vertical'
					? 'relative flex h-48 w-6 justify-center'
					: // mt-6 leaves room for the value label that sits above each thumb.
						'relative mt-6 flex h-6 w-full items-center'
			}
		>
			{({ state }) => {
				const isVertical = state.orientation === 'vertical'
				const start = state.values.length > 1 ? state.getThumbPercent(0) : 0
				const end = state.getThumbPercent(state.values.length - 1)
				return (
					<>
						<div className={`rounded-full bg-surface-muted ${isVertical ? 'h-full w-1.5' : 'h-1.5 w-full'}`} />
						<div
							className={`absolute rounded-full bg-brand-green ${isVertical ? 'w-1.5' : 'h-1.5'}`}
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
								className={`${isVertical ? 'left-1/2' : 'top-1/2'} h-4 w-4 rounded-full border-2 border-fg bg-surface outline-none transition-transform data-[dragging]:scale-110 data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring`}
							>
								{hideValue ? null : (
									<span
										className={`pointer-events-none absolute whitespace-nowrap text-label font-medium tabular-nums text-fg ${isVertical ? 'top-1/2 left-full ml-2 -translate-y-1/2' : '-top-6 left-1/2 -translate-x-1/2'}`}
									>
										{state.getThumbValueLabel(i)}
									</span>
								)}
							</SliderThumb>
						))}
					</>
				)
			}}
		</SliderTrack>
	</RACSlider>
)
