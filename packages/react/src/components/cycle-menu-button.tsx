import { useEffect, useRef, useState, type ReactNode } from 'react'
import { IslandToolbarButton } from './island-toolbar'
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu'

export interface CycleMenuOption {
 readonly id: string
 readonly label: string
 readonly icon?: ReactNode
 readonly isDisabled?: boolean
}
export interface CycleMenuButtonProps {
 readonly label: string
 readonly icon: ReactNode
 readonly value: string | null
 readonly options: readonly CycleMenuOption[]
 readonly onChange: (value: string) => void
 readonly isDisabled?: boolean
}

/** Short press cycles available values. Hold or Alt+ArrowDown opens the complete menu.
 * React Aria owns pointer cancellation, focus restoration and keyboard equivalence.
 * The caller supplies only values available in the current context. */
export function CycleMenuButton({ label, icon, value, options, onChange, isDisabled }: CycleMenuButtonProps) {
 const [isOpen, setOpen] = useState(false)
 const menuOpen = useRef(false)
 const ids = new Set(options.map(option => option.id))
 if (ids.size !== options.length) throw new Error('Cycle menu option identities must be unique.')
 const available = options.filter(option => !option.isDisabled)
 const selected = options.find(option => option.id === value)
 const disabled = Boolean(isDisabled || available.length === 0)
 useEffect(() => {
  if (disabled && isOpen) { menuOpen.current = false; setOpen(false) }
 }, [disabled, isOpen])
 function cycle() {
  if (disabled || menuOpen.current) return
  const index = available.findIndex(option => option.id === value)
  const next = available[(index + 1) % available.length]
  if (next && next.id !== value) onChange(next.id)
 }
 return (
  <DropdownMenuTrigger trigger="longPress" isOpen={isOpen && !disabled} onOpenChange={open => { const next = open && !disabled; menuOpen.current = next; setOpen(next) }}>
   <IslandToolbarButton label={selected ? `${label}: ${selected.label}` : label} icon={icon} isDisabled={disabled} onPress={cycle} />
   <DropdownMenu aria-label={label} selectionMode="single" selectedKeys={selected ? [selected.id] : []} onAction={key => {
    const option = available.find(item => item.id === key)
    if (!disabled && option && option.id !== value) onChange(option.id)
   }}>
    {options.map(option => <DropdownMenuItem key={option.id} id={option.id} isDisabled={disabled || option.isDisabled} textValue={option.label}>{option.icon}{option.label}</DropdownMenuItem>)}
   </DropdownMenu>
  </DropdownMenuTrigger>
 )
}
