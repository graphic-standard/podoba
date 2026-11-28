import { createContext } from 'react'

/**
 * The corner row of a `LibraryAssetPreview`. Artwork inside the stage can portal its own
 * controls there (e.g. a crop toolbar), next to the carousel and expand buttons.
 * `null` outside a stage, or before the row has mounted.
 */
export const PreviewControlsContext = createContext<HTMLElement | null>(null)
