import { type ReactNode, useState } from 'react'
import { DropZone, FileTrigger, Text } from 'react-aria-components'
import { Button } from './button'
import { useInFocusOverlay } from './focus-context'

/**
 * FileUpload — a drop zone + "choose file" trigger over React Aria Components
 * `DropZone` + `FileTrigger` (keyboard-accessible, drag-and-drop highlight).
 * Uncontrolled: it tracks selected file names for display and reports the raw
 * `File[]` via `onFiles`. Wire `onFiles` to your own upload.
 */
export type FileUploadProps = {
	label?: ReactNode
	description?: ReactNode
	/** Accepted MIME types / extensions, e.g. ["image/*"] or ["image/png", ".pdf"]. */
	accept?: string[]
	allowsMultiple?: boolean
	/** Called with the chosen files (from either the picker or a drop). */
	onFiles?: (files: File[]) => void
	className?: string
}

export const FileUpload = ({ label, description, accept, allowsMultiple, onFiles, className }: FileUploadProps) => {
	const [names, setNames] = useState<string[]>([])
	const inFocus = useInFocusOverlay()

	const handle = (files: File[]) => {
		if (files.length === 0) return
		setNames(files.map((f) => f.name))
		onFiles?.(files)
	}

	return (
		<div className={className ? `flex flex-col gap-2 ${className}` : 'flex flex-col gap-2'}>
			{label ? <span className="text-heading5 font-medium text-fg">{label}</span> : null}
			<DropZone
				onDrop={async (e) => {
					// Narrow to file items via `'getFile' in i` (avoids importing FileDropItem).
					const files = await Promise.all(e.items.flatMap((i) => ('getFile' in i ? [i.getFile()] : [])))
					handle(allowsMultiple ? files : files.slice(0, 1))
				}}
				className={
					'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-surface text-center outline-none transition-colors ' +
					(inFocus ? 'min-h-64 p-12 ' : 'p-6 ') +
					'data-[hovered]:border-fg-subtle ' +
					'data-[drop-target]:border-brand-green data-[drop-target]:bg-surface-card ' +
					'data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring'
				}
			>
				<Text slot="label" className="text-small text-fg-muted">
					Drag &amp; drop {allowsMultiple ? 'files' : 'a file'} here, or
				</Text>
				<FileTrigger
					acceptedFileTypes={accept}
					allowsMultiple={allowsMultiple}
					onSelect={(list) => handle(list ? Array.from(list) : [])}
				>
					<Button variant="secondary" size="sm">
						Choose {allowsMultiple ? 'files' : 'file'}
					</Button>
				</FileTrigger>
				{names.length > 0 ? <span className="max-w-full truncate text-label text-fg">{names.join(', ')}</span> : null}
			</DropZone>
			{description ? <span className="text-label text-fg-muted">{description}</span> : null}
		</div>
	)
}
