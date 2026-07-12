import type { ReactNode } from 'react'
import { Switch as RACSwitch, type SwitchProps as RACSwitchProps } from 'react-aria-components'

/**
 * Switch — labelled on/off toggle.
 *
 * Ported 1:1 from gs-platform's `Switch` (44×24 track, off = `surface-muted`,
 * on = filled `fg`, 20px white thumb translating 2px→22px, 200ms transition).
 * Built on React Aria Components `Switch` (renders the `<label>` + hidden native
 * checkbox with `role="switch"`, full keyboard + ARIA). The track / thumb are
 * styled `<span>`s driven by `group-data-[…]` hooks. Styling = Tailwind +
 * `@app/tokens`.
 */
export type SwitchProps = Omit<RACSwitchProps, 'children'> & {
	/** Visible label rendered next to the track. */
	children?: ReactNode
}

export const Switch = ({ children, ...props }: SwitchProps) => (
	<RACSwitch
		{...props}
		className="group flex cursor-pointer select-none items-center gap-3 text-sm text-fg data-[disabled]:cursor-not-allowed"
	>
		{/* gs token map: off track #eceae1 → surface-muted · on track #0d0d0d → fg ·
		    thumb #ffffff → surface. gs hovers the track at opacity .9 (not a border). */}
		<span
			className={
				'flex h-6 w-11 shrink-0 items-center rounded-full bg-surface-muted px-0.5 ' +
				'transition-colors duration-200 ' +
				'group-data-[selected]:bg-fg ' +
				'group-data-[hovered]:opacity-90 ' +
				'group-data-[focus-visible]:ring-2 group-data-[focus-visible]:ring-ring group-data-[focus-visible]:ring-offset-2 ' +
				'group-data-[disabled]:opacity-50'
			}
		>
			<span className="h-5 w-5 translate-x-0 rounded-full bg-surface transition-transform duration-200 group-data-[selected]:translate-x-5" />
		</span>
		{children}
	</RACSwitch>
)
