import { useRef, useState } from 'react'

import { Button } from './button'
import { Slider } from './slider'

/** Every visible and accessible string comes from the host application (Podoba ships no copy). */
export interface AudioPlayerLabels {
	play: string
	pause: string
	/** Accessible name of the position slider. */
	position: string
	/** Visible label and accessible name of the volume slider. */
	volume: string
}

export interface AudioPlayerProps {
	src: string
	/** Accessible name of the whole player, e.g. the file name. */
	name: string
	labels: AudioPlayerLabels
	/**
	 * Called once when the source cannot load (the media `error` event) or the browser
	 * refuses playback (`NotAllowedError`, e.g. an autoplay policy). Not called when the
	 * user pauses before playback started, which also rejects the pending `play()`.
	 */
	onError?: () => void
}

/** `m:ss`, or `h:mm:ss` from one hour; anything that is not a finite, non-negative number reads as 0. */
export function formatAudioTime(value: number): string {
	const seconds = Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0
	const hours = Math.floor(seconds / 3600)
	const minutes = Math.floor(seconds / 60) % 60
	const remainder = String(seconds % 60).padStart(2, '0')
	return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${remainder}` : `${minutes}:${remainder}`
}

/**
 * AudioPlayer: accessible playback for one audio file, built from Podoba controls.
 * A play/pause button, the elapsed time, a position slider, the duration and a
 * volume slider. Label-driven: the host passes every string. The position slider is
 * disabled until the browser knows the duration.
 *
 * Changing `src` on a mounted player resets it (the media `emptied` event), so a
 * host can reuse one player for a list of files.
 *
 * iOS Safari keeps `HTMLMediaElement.volume` read-only, so there the volume slider
 * moves without changing the loudness; the device buttons control it.
 */
export function AudioPlayer({ src, name, labels, onError }: AudioPlayerProps) {
	const audio = useRef<HTMLAudioElement>(null)
	const [playing, setPlaying] = useState(false)
	const [position, setPosition] = useState(0)
	const [duration, setDuration] = useState(0)
	const [volume, setVolume] = useState(1)
	const toggle = () => {
		const element = audio.current
		if (!element) return
		if (element.paused) {
			void element.play().catch((error: unknown) => {
				setPlaying(false)
				// A load failure also rejects play(), but the media `error` event already
				// reported it; a pause before playback started rejects with AbortError.
				// Only a refusal by the browser is news to the host.
				if ((error as { name?: unknown } | null)?.name === 'NotAllowedError') onError?.()
			})
		} else element.pause()
	}
	return (
		<div role="group" aria-label={name} className="w-full max-w-lg rounded-lg bg-surface p-6 text-fg">
			<audio
				ref={audio}
				src={src}
				preload="metadata"
				onError={() => onError?.()}
				onPlay={() => setPlaying(true)}
				onPause={() => setPlaying(false)}
				onEnded={() => setPlaying(false)}
				// A new source resets the element without firing pause or durationchange.
				onEmptied={() => {
					setPlaying(false)
					setPosition(0)
					setDuration(0)
				}}
				onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)}
				onDurationChange={(event) =>
					setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)
				}
			/>
			<div className="flex items-center gap-4">
				<Button variant="primary" size="sm" onPress={toggle}>
					{playing ? labels.pause : labels.play}
				</Button>
				<span className="shrink-0 text-label tabular-nums">{formatAudioTime(position)}</span>
				<Slider
					label={labels.position}
					size="sm"
					className="min-w-0 flex-1"
					minValue={0}
					maxValue={duration || 1}
					step={0.1}
					value={Math.min(position, duration || 1)}
					isDisabled={!duration}
					onChange={(value) => {
						if (audio.current) audio.current.currentTime = value
						setPosition(value)
					}}
				/>
				<span className="shrink-0 text-label tabular-nums">{formatAudioTime(duration)}</span>
			</div>
			<div className="mt-4 flex items-center gap-4">
				{/* The slider carries the same text as its screen-reader label. */}
				<span aria-hidden="true" className="text-label">
					{labels.volume}
				</span>
				<Slider
					label={labels.volume}
					size="sm"
					className="w-28"
					minValue={0}
					maxValue={1}
					step={0.01}
					value={volume}
					formatOptions={{ style: 'percent' }}
					onChange={(value) => {
						if (audio.current) audio.current.volume = value
						setVolume(value)
					}}
				/>
			</div>
		</div>
	)
}
