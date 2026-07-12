/**
 * uic — a small, self-contained component factory combining:
 *   - clsx (conditional class composition)
 *   - cva (class-variance-authority — type-safe variants)
 *   - tailwind-merge (dedupe conflicting Tailwind utilities)
 *   - Radix Slot (the `asChild` pattern for string elements)
 *
 * Ported from Contember's `uic` helper, but with the two `@contember/*`
 * dependencies inlined so this package stays dependency-light:
 *   - `dataAttribute(v)` (was `@contember/utilities`) — boolean → ''/undefined,
 *     null/undefined passthrough, everything else → String(v). Used to emit
 *     `data-*` attributes for variant-driven CSS hooks.
 *   - `useStableMemo(obj)` (was `@contember/react-utils`'s `useObjectMemo`) —
 *     memoizes the variant object keyed on a shallow JSON signature so the
 *     className recompute only runs when a variant value actually changes.
 *
 * Signature (matches the source — `baseClass` / `displayName` naming kept):
 *   uic(Component, {
 *     baseClass?, variants, defaultVariants?, compoundVariants?,
 *     variantsAsDataAttrs?, passVariantProps?, defaultProps?,
 *     displayName?, style?
 *   })
 * Returns a `forwardRef` component with type-safe variant props plus
 * `asChild` (Slot) support when `Component` is a string element.
 *
 * Uses `createElement` (not JSX) so this stays a `.ts` file.
 */
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { type ClassValue, clsx } from 'clsx'
import {
	type ComponentProps,
	type ComponentRef,
	createElement,
	type CSSProperties,
	type ElementType,
	forwardRef,
	type ReactNode,
	useMemo,
	useRef,
} from 'react'
import { extendTailwindMerge } from 'tailwind-merge'

// tailwind-merge configured for OUR theme extensions (packages/ui/tailwind.config.ts).
// Default tailwind-merge only recognises stock scale keys — without this,
// `text-compact` (custom fontSize) would be classified as a text COLOR and
// wrongly deduped against `text-fg-*`, and `px-nav-x` (custom spacing) would
// not participate in padding conflict resolution at all.
const twMerge = extendTailwindMerge({
	extend: {
		classGroups: {
			'font-size': [
				{
					text: [
						// Size-only text ramp (must be registered or they'd be treated as
						// text COLORs and wrongly merged against `text-fg-*`).
						'micro',
						'caption',
						'label',
						'compact',
						'callout',
						'body',
						'subtitle',
						'title',
						'headline',
						'display',
						// Heading ramp (size + line-height).
						'heading1',
						'heading2',
						'heading3',
						'heading4',
						'heading5',
					],
				},
			],
		},
		theme: {
			spacing: ['nav-x'],
			// Custom card/panel radius key (rounded-panel) → dedupes against other
			// rounded-* utilities. xl/2xl are stock keys tailwind-merge already knows.
			radius: ['panel'],
		},
	},
})

// --- inlined `dataAttribute` (was @contember/utilities) ---------------------
type DataAttrValue = boolean | string | number | undefined | null
const dataAttribute = (value: DataAttrValue): string | undefined => {
	if (typeof value === 'boolean') {
		return value ? '' : undefined
	}
	if (value === undefined || value === null) {
		return undefined
	}
	return String(value)
}

// --- inlined `useObjectMemo` (was @contember/react-utils) --------------------
// Returns a stable reference for `obj` that only changes when its shallow JSON
// signature changes, so a downstream `useMemo` keyed on it stays cheap.
const useStableMemo = <T extends object>(obj: T): T => {
	const signature = JSON.stringify(obj)
	const ref = useRef<{ signature: string; value: T }>({ signature, value: obj })
	if (ref.current.signature !== signature) {
		ref.current = { signature, value: obj }
	}
	return ref.current.value
}

// --- variant typing (verbatim from source) ----------------------------------
type StringToBoolean<T> = T extends 'true' | 'false' ? boolean : T
type ConfigSchema = Record<string, Record<string, ClassValue>>

export type ConfigVariants<T extends ConfigSchema | undefined> = T extends ConfigSchema
	? {
			[Variant in keyof T]?: StringToBoolean<keyof T[Variant]> | null | undefined
	  }
	: {}

type ConfigVariantsMulti<T extends ConfigSchema | undefined> = T extends ConfigSchema
	? {
			[Variant in keyof T]?: StringToBoolean<keyof T[Variant]> | StringToBoolean<keyof T[Variant]>[] | undefined
	  }
	: {}

type DataAttr<T extends ConfigSchema | undefined> = T extends ConfigSchema ? `data-${keyof T & string}` : never

type AnyComponent = (props: Record<string, unknown>) => ReactNode

type Config<T extends ConfigSchema | undefined, El extends ElementType> = {
	baseClass?: ClassValue
	variants?: T
	passVariantProps?: string[]
	defaultProps?: Partial<
		ComponentProps<El> & {
			[K in `data-${string}`]?: DataAttrValue
		}
	>
	defaultVariants?: ConfigVariants<T>
	compoundVariants?: ((ConfigVariants<T> | ConfigVariantsMulti<T>) & { className?: string })[]
	variantsAsDataAttrs?: (keyof ConfigVariants<T>)[]
	displayName?: string
	style?: CSSProperties
}

export type NoInfer<T> = T & { [K in keyof T]: T[K] }

export const uiconfig = <T extends ConfigSchema | undefined>(config: Config<T, AnyComponent>) => config

export const uic = <El extends ElementType, Variants extends ConfigSchema | undefined = undefined>(
	Component: El,
	config: Config<Variants, NoInfer<El>>,
) => {
	// cva's generics are keyed on the concrete variant schema; `uic` is generic
	// over an unknown schema, so we widen to `ConfigSchema` via `unknown` (never
	// `any`) and call the result with a plain variant record below.
	type Cva = (props?: Record<string, unknown>) => string
	const cls = cva(config?.baseClass, {
		variants: config?.variants,
		defaultVariants: config?.defaultVariants,
		compoundVariants: config?.compoundVariants,
	} as unknown as Parameters<typeof cva>[1]) as unknown as Cva
	const passVariantProps = config?.passVariantProps ? new Set(config.passVariantProps) : undefined

	const component = forwardRef<
		ComponentRef<El>,
		ComponentProps<El> & {
			asChild?: boolean
			children?: ReactNode
			className?: string
		} & ConfigVariants<Variants>
	>((props, ref) => {
		const { children, ...rest } = props as Record<string, unknown> & {
			className?: string
			children?: ReactNode
		}
		const classNameProp = rest.className as string | undefined
		delete rest.className

		const variants: Record<string, unknown> = {}
		for (const key in config?.variants) {
			variants[key] = rest[key]
			if (key in rest && !passVariantProps?.has(key)) {
				delete rest[key]
			}
		}
		const variantsMemoized = useStableMemo(variants)

		const dataAttrs: Partial<Record<DataAttr<Variants>, string | undefined>> = {}
		if (config?.variantsAsDataAttrs && config.variants) {
			for (const key of config.variantsAsDataAttrs) {
				const keyAsString = key.toString()
				const variantValue =
					(props as Record<string, DataAttrValue>)[keyAsString] ??
					(config.defaultVariants?.[key] as DataAttrValue)
				dataAttrs[`data-${keyAsString}` as DataAttr<Variants>] = dataAttribute(variantValue)
			}
		}

		const inlineStyle = rest.style as CSSProperties | undefined
		const style = useMemo(
			() => (config?.style ? { ...config.style, ...inlineStyle } : inlineStyle),
			[inlineStyle],
		)
		const finalClassName = useMemo(
			() => twMerge(clsx(cls(variantsMemoized), classNameProp)),
			[variantsMemoized, classNameProp],
		)

		let FinalComponent: ElementType = Component
		if (props.asChild && typeof Component === 'string') {
			FinalComponent = Slot
			delete rest.asChild
		}

		return createElement(
			FinalComponent,
			{
				ref,
				className: finalClassName,
				...config.defaultProps,
				...dataAttrs,
				...rest,
				style,
			},
			children,
		)
	})
	component.displayName = config?.displayName ?? 'uic'

	return component
}
