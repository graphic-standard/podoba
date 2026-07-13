import type { ReactNode } from 'react'
import {
	Label,
	Slider as RACSlider,
	type SliderProps as RACSliderProps,
	SliderOutput,
	SliderThumb,
	SliderTrack,
} from 'react-aria-components'

/**
 * Slider — a draggable value selector (single value or a range when `value`/
 * `defaultValue` is a two-number array). Built on React Aria Components `Slider`
 * (keyboard support, RTL, ARIA). The filled portion is brand-green.
 */
export type SliderProps<T extends number | number[]> = RACSliderProps<T> & {
	/** Visible label (required for accessibility). */
	label: ReactNode
	/** Hide the numeric readout next to the label. */
	hideOutput?: boolean
}

export const Slider = <T extends number | number[]>({ label, hideOutput, ...props }: SliderProps<T>) => (
	<RACSlider {...props} className="flex flex-col gap-2 data-[disabled]:opacity-50">
		<div className="flex items-center justify-between">
			<Label className="text-heading5 font-medium text-fg">{label}</Label>
			{hideOutput ? null : <SliderOutput className="text-sm tabular-nums text-fg-muted" />}
		</div>
		<SliderTrack className="relative flex h-6 w-full items-center">
			{({ state }) => {
				const start = state.values.length > 1 ? state.getThumbPercent(0) : 0
				const end = state.getThumbPercent(state.values.length - 1)
				return (
					<>
						<div className="h-1.5 w-full rounded-full bg-surface-muted" />
						<div
							className="absolute h-1.5 rounded-full bg-brand-green"
							style={{ left: `${start * 100}%`, width: `${(end - start) * 100}%` }}
						/>
						{state.values.map((_, i) => (
							<SliderThumb
								// biome-ignore lint/suspicious/noArrayIndexKey: thumbs are positional and fixed-count
								key={i}
								index={i}
								className="h-4 w-4 rounded-full border-2 border-fg bg-surface outline-none transition-transform data-[dragging]:scale-110 data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring"
							/>
						))}
					</>
				)
			}}
		</SliderTrack>
	</RACSlider>
)
