export const FIELD_APPEARANCES = ['outlined', 'filled'] as const
export type FieldAppearance = (typeof FIELD_APPEARANCES)[number]

/** Borderless Manager field skin. Hover yields to focus; focus uses an offset
 * outline instead of combining the browser outline with a second inset ring.
 * Placeholder/error colors retain the library's accessible semantic tokens.
 */
export const filledFieldClasses =
	'border-0 bg-surface-card text-small font-normal leading-4.5 text-fg ' +
	'outline-none transition-colors duration-200 motion-reduce:transition-none placeholder:text-fg-muted placeholder:font-normal ' +
	'data-[hovered]:bg-surface-muted data-[focused]:bg-surface-card ' +
	// `outline-none` above zeroes Tailwind v4's `--tw-outline-style`, so the focus
	// width alone would still resolve to `outline-style: none`. Restate the solid
	// style or the gs 2px focus outline never paints (WCAG 2.4.7).
	'focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 ' +
	'data-[invalid]:ring-1 data-[invalid]:ring-danger data-[invalid]:outline-danger ' +
	'data-[disabled]:bg-surface-muted data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed'

/** gs `.helperText` (`--font-size-label-2`): 14px/18px under a field. The source ink
 * `#7d786f` fails WCAG AA, so it keeps the readable `fg-muted`. */
export const fieldDescriptionClass = 'text-small text-fg-muted'

/** gs `.errorText`: 16px, line-height normal, error red (`danger`, 4.83:1 on white). */
export const fieldErrorClass = 'text-body leading-[normal] text-danger'
