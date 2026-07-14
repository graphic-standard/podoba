import { createContext, useContext } from 'react'

/**
 * Signals that a field is being rendered inside an active FocusField overlay, so
 * the field can present an enhanced "focus" view (e.g. DatePicker shows the
 * calendar inline/open instead of behind a popover). Default `false`.
 */
export const FocusOverlayContext = createContext(false)

/** True when a field is rendered inside an active FocusField overlay. */
export const useInFocusOverlay = (): boolean => useContext(FocusOverlayContext)
