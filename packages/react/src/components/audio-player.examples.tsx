import { AudioPlayer } from './audio-player'

export const meta = { category: 'Composite', description: 'Accessible playback for one audio file, with host-provided labels.' }

const labels = { play: 'Play', pause: 'Pause', position: 'Playback position', volume: 'Volume' }

export const basic = () => <AudioPlayer src="/examples/sample.mp3" name="Brand jingle.mp3" labels={labels} />
