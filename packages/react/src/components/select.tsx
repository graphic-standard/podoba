import { createContext, useContext, type CSSProperties, type ReactNode } from 'react'
import {
	Button as RACButton,
	FieldError,
	Label,
	ListBox,
	ListBoxItem,
	type ListBoxItemProps,
	Popover,
	Select as RACSelect,
	type SelectProps as RACSelectProps,
	SelectValue,
	Text,
} from 'react-aria-components'
import { uic } from '../utils/uic'
import { useInFocusOverlay } from './focus-context'
import type { FieldAppearance } from './field-appearance'

const SelectAppearanceContext = createContext<FieldAppearance>('outlined')
const filledPopoverStyle: CSSProperties & { '--select-popup-max-width': string } = {
	'--select-popup-max-width': 'calc(100vw - var(--spacing) * 6)',
}

/**
 * Select — accessible dropdown built on React Aria Components `Select`.
 *
 * RAC handles the listbox ARIA pattern, keyboard navigation, typeahead and
 * focus management. Styling via `uic`. Pass options as `SelectItem` children.
 *
 * Re-skinned to gs-platform's designer spec (Figma GraphicStandard 1.5, node
 * 2115-4271 — `Select.module.scss`): a tall (58px) filled trigger matching our
 * `Input` / `Textarea` so the form controls stay consistent. gs token map:
 * hover border #aba89c → fg-subtle · text #0d0d0d → fg · placeholder → fg-muted ·
 * 8px radius → rounded-lg · 6px item radius → rounded-md · error → danger.
 */
const SelectTrigger = uic(RACButton, {
	displayName: 'SelectTrigger',
	// Filled follows the Manager's borderless control; outlined preserves the
	// existing default for consumers which have not opted into that appearance.
	baseClass:
		'flex w-full items-center justify-between gap-2.5 rounded-lg px-5 text-small text-fg outline-none transition-colors',
	variants: {
		appearance: {
			filled: 'min-h-control-tall border-0 bg-surface-card py-5 font-normal leading-4.5 duration-200 motion-reduce:transition-none ' +
				'data-[hovered]:bg-surface-muted group-data-[open]:bg-surface-card ' +
				'data-[focus-visible]:outline-solid data-[focus-visible]:outline-2 data-[focus-visible]:outline-ring data-[focus-visible]:outline-offset-2 ' +
				'group-data-[invalid]:ring-1 group-data-[invalid]:ring-danger ' +
				'data-[disabled]:bg-surface-card data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed',
			outlined: 'h-control-tall border border-border bg-surface ' +
		'data-[hovered]:border-fg-subtle ' +
		'data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring ' +
		'group-data-[invalid]:border-danger group-data-[invalid]:ring-2 group-data-[invalid]:ring-danger ' +
		'data-[disabled]:bg-surface-muted data-[disabled]:opacity-60 data-[disabled]:pointer-events-none',
		},
	},
	defaultVariants: { appearance: 'outlined' },
})

const StyledSelectItem = uic(ListBoxItem, {
	displayName: 'SelectItem',
	// Filled highlights through weight, as in Manager. Retain a keyboard outline
	// and larger narrow-screen hit targets as explicit accessibility exceptions.
	baseClass:
		'flex cursor-pointer select-none items-center rounded-md text-small text-fg outline-none data-[disabled]:opacity-50 data-[disabled]:pointer-events-none',
	variants: {
		appearance: {
			filled: 'min-w-0 overflow-hidden px-5 py-0 font-normal leading-4.5 max-md:min-h-11 ' +
				'data-[hovered]:font-medium data-[focused]:font-medium data-[selected]:font-medium ' +
				'data-[focus-visible]:outline-solid data-[focus-visible]:outline-2 data-[focus-visible]:outline-ring data-[focus-visible]:-outline-offset-2',
			outlined: 'px-3 py-2 ' +
		'data-[hovered]:bg-surface-muted data-[focused]:bg-surface-muted data-[selected]:font-medium ' +
		'data-[disabled]:opacity-50 data-[disabled]:pointer-events-none',
		},
	},
	defaultVariants: { appearance: 'outlined' },
}) as (props: ListBoxItemProps & { appearance?: FieldAppearance }) => ReactNode

export const SelectItem = (props: ListBoxItemProps): ReactNode => {
	const appearance = useContext(SelectAppearanceContext)
	if (appearance === 'outlined') return <StyledSelectItem {...props} appearance={appearance} />
	// Manager's ItemText is a single ellipsized line. Keep the full value in the
	// label/textValue so keyboard search and assistive technology don't see a cut-off label.
	const { children, textValue, ...rest } = props
	return <StyledSelectItem {...rest} appearance={appearance} textValue={textValue ?? (typeof children === 'string' ? children : undefined)}>
		{state => <Text slot="label" className="min-w-0 truncate">{typeof children === 'function' ? children(state) : children}</Text>}
	</StyledSelectItem>
}

const SelectListBox = uic(ListBox, {
	displayName: 'SelectListBox',
	baseClass: 'flex flex-col overflow-auto overscroll-contain outline-none',
	variants: { appearance: { outlined: 'max-h-72 gap-0.5 p-1', filled: 'gap-3 px-0 py-5' } },
	defaultVariants: { appearance: 'outlined' },
})
const SelectPopover = uic(Popover, {
	displayName: 'SelectPopover',
	baseClass: 'overflow-hidden rounded-lg bg-surface-card shadow-lg',
	variants: { appearance: {
		outlined: 'min-w-(--trigger-width)',
		filled: 'w-(--trigger-width) max-w-(--select-popup-max-width)',
	} },
	defaultVariants: { appearance: 'outlined' },
})

export type SelectProps<T extends object> = RACSelectProps<T> & {
	appearance?: FieldAppearance
	/** Keep the accessible label without reserving an empty label row. */
	isLabelHidden?: boolean
	/** Visible label (required for accessibility). */
	label: ReactNode
	description?: ReactNode
	errorMessage?: string
	/**
	 * Placeholder shown while nothing is selected. REQUIRED — `@app/ui` ships no
	 * i18n, so the consumer passes a translated string (otherwise RAC would fall
	 * back to its own hardcoded English "Select an item").
	 */
	placeholder: string
	children: ReactNode
	/** Optional class for the Select root. */
	rootClassName?: string
	/** Optional class for the trigger (for product-specific composition). */
	triggerClassName?: string
}

export const Select = <T extends object>({
	label,
	description,
	errorMessage,
	placeholder,
	children,
	rootClassName,
	triggerClassName,
	appearance = 'outlined',
	isLabelHidden = false,
	...props
}: SelectProps<T>) => {
	// In a focus overlay, show the options inline (seamless) instead of a popover.
	const inFocus = useInFocusOverlay()
	const listbox = (
		<SelectListBox appearance={appearance} style={appearance === 'filled' ? { maxHeight: 'inherit' } : undefined}>
			{children}
		</SelectListBox>
	)
	const desc = description ? (
		<Text slot="description" className="text-label text-fg-muted">
			{description}
		</Text>
	) : null
	const err = <FieldError className="text-label text-danger">{errorMessage}</FieldError>

	return (
		<SelectAppearanceContext.Provider value={appearance}>
		<RACSelect {...props} placeholder={placeholder} className={`group flex flex-col gap-3 ${rootClassName ?? ''}`}>
			<Label className={isLabelHidden ? 'sr-only' : 'text-panel-heading font-medium text-fg'}>{label}</Label>
			{inFocus ? (
				<>
					{listbox}
					{desc}
					{err}
				</>
			) : (
				<>
					<SelectTrigger className={triggerClassName} appearance={appearance}>
						<SelectValue className="data-[placeholder]:text-fg-muted" />
						{/* gs chevron: 9.5px caret, dark (neutral-400 → fg), non-interactive. */}
						<svg
							width="9.5"
							height="9.5"
							viewBox="0 0 12 12"
							fill="none"
							aria-hidden="true"
							className="pointer-events-none shrink-0 text-fg"
						>
							<path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</SelectTrigger>
					{desc}
					{err}
					{/* Filled uses the trigger width and Manager's 4px popup offset. */}
					<SelectPopover appearance={appearance} offset={appearance === 'filled' ? 4 : undefined}
						containerPadding={appearance === 'filled' ? 12 : undefined}
						style={appearance === 'filled' ? filledPopoverStyle : undefined}>
						{listbox}
					</SelectPopover>
				</>
			)}
		</RACSelect>
		</SelectAppearanceContext.Provider>
	)
}
