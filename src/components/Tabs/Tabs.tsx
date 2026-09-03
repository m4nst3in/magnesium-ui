import {
  type ButtonHTMLAttributes,
  createContext,
  type HTMLAttributes,
  type KeyboardEvent,
  useContext,
  useId,
} from 'react'

import { cn } from '../../utils/cn'

import styles from './Tabs.module.css'

interface TabsContextValue {
  value: string
  setValue: (value: string) => void
  baseId: string
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabs() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Componentes Tabs.* precisam estar dentro de <Tabs>')
  return ctx
}

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  value: string
  onValueChange?: (value: string) => void
}

function TabsRoot({ value, onValueChange, className, children, ...rest }: TabsProps) {
  const baseId = useId()

  return (
    <TabsContext.Provider value={{ value, setValue: (v) => onValueChange?.(v), baseId }}>
      <div className={cn(styles.tabs, className)} {...rest}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className, onKeyDown, ...rest }: HTMLAttributes<HTMLDivElement>) {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e)
    if (e.defaultPrevented) return
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return

    const triggers = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'))
    const current = triggers.indexOf(document.activeElement as HTMLButtonElement)
    if (current === -1) return

    e.preventDefault()
    const next =
      triggers[(current + (e.key === 'ArrowRight' ? 1 : -1) + triggers.length) % triggers.length]
    next.focus()
    next.click()
  }

  return (
    <div
      role="tablist"
      className={cn(styles.list, className)}
      onKeyDown={handleKeyDown}
      {...rest}
    />
  )
}

export interface TabsTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

export function TabsTrigger({ value, className, ...rest }: TabsTriggerProps) {
  const { value: active, setValue, baseId } = useTabs()
  const selected = active === value

  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-trigger-${value}`}
      aria-selected={selected}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={selected ? 0 : -1}
      className={cn(styles.trigger, selected && styles.active, className)}
      onClick={() => setValue(value)}
      {...rest}
    />
  )
}

export interface TabsPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: string
}

export function TabsPanel({ value, className, ...rest }: TabsPanelProps) {
  const { value: active, baseId } = useTabs()
  if (active !== value) return null

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-trigger-${value}`}
      className={cn(styles.panel, className)}
      {...rest}
    />
  )
}

export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Panel: TabsPanel,
})
