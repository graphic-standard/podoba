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

/** Field label, shared by every labelled form control (gs 17px/20px field label). */
export const fieldLabelClass = 'text-panel-heading font-medium text-fg'

/** Label, control, description and error stack. */
export const fieldStackClass = 'flex flex-col gap-3'

/** Outlined control heights. `md` is the default, so every outlined field in a
 * form is the same 40px box unless the consumer opts into another size. */
export const FIELD_SIZES = ['sm', 'md', 'lg', 'tall'] as const
export type FieldSize = (typeof FIELD_SIZES)[number]
export const fieldSizeClasses: Record<FieldSize, string> = {
	sm: 'h-8',
	md: 'h-10',
	lg: 'h-12',
	tall: 'h-control-tall',
}

// The outlined skin, split by where its state lives. Every class is spelled out
// in full so Tailwind's scanner sees it; don't build these from fragments.
const outlinedBase =
	'border border-border bg-surface text-small text-fg ' +
	'outline-none transition-colors duration-200 motion-reduce:transition-none placeholder:text-fg-muted ' +
	'data-[hovered]:border-fg-subtle ' +
	'data-[disabled]:bg-surface-muted data-[disabled]:opacity-60 data-[disabled]:pointer-events-none'
const outlinedFocus = {
	// A focusable element (input, trigger button) marks itself focused.
	self: 'data-[focused]:border-brand-green data-[focused]:ring-2 data-[focused]:ring-ring',
	// A wrapper (Group, DateInput) marks focus on any child.
	within: 'data-[focus-within]:border-brand-green data-[focus-within]:ring-2 data-[focus-within]:ring-ring',
}
const outlinedInvalid = {
	self: 'data-[invalid]:border-danger data-[invalid]:ring-2 data-[invalid]:ring-danger',
	// Invalid is owned by the field root (which carries `group`).
	group: 'group-data-[invalid]:border-danger group-data-[invalid]:ring-2 group-data-[invalid]:ring-danger',
}

/** Bordered white field skin, the default appearance of every form control.
 * Pick where focus and invalid state are exposed for the element being styled. */
export const outlinedFieldClasses = ({
	focus = 'self',
	invalid = 'self',
}: { focus?: keyof typeof outlinedFocus; invalid?: keyof typeof outlinedInvalid } = {}) =>
	`${outlinedBase} ${outlinedFocus[focus]} ${outlinedInvalid[invalid]}`
