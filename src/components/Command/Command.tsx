import {
  createContext,
  forwardRef,
  type HTMLAttributes,
  type InputHTMLAttributes,
  isValidElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'

import { lockBodyScroll, unlockBodyScroll } from '../../utils/bodyScrollLock'
import { cn } from '../../utils/cn'

import styles from './Command.module.css'

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
}

export function Kbd({ children, className, ...rest }: KbdProps) {
  return (
    <kbd className={cn(styles.kbd, className)} {...rest}>
      {children}
    </kbd>
  )
}

function getItemText(value: string | undefined, children: ReactNode): string {
  if (value !== undefined) return value
  if (typeof children === 'string') return children
  if (typeof children === 'number') return String(children)
  if (Array.isArray(children)) {
    return children.map((c) => getItemText(undefined, c)).join(' ')
  }
  if (isValidElement(children)) {
    const props = children.props as { children?: ReactNode }
    if (props.children) return getItemText(undefined, props.children)
    return ''
  }
  return ''
}

interface CommandContextValue {
  filter: string
  setFilter: (v: string) => void
  activeIndex: number
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>
  register: (id: string, text: string, onSelect?: () => void) => void
  unregister: (id: string) => void
  visibleIds: string[]
  placeholder?: string
  triggerActive: () => void
}

const CommandContext = createContext<CommandContextValue | null>(null)

function useCommandContext() {
  return useContext(CommandContext)
}

export interface CommandProps {
  open: boolean
  onClose: () => void
  placeholder?: string
  className?: string
  children: ReactNode
}

function CommandRoot({ open, onClose, placeholder, className, children }: CommandProps) {
  const [filter, setFilter] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const itemsRef = useRef<Map<string, { text: string; onSelect?: () => void }>>(new Map())
  const orderRef = useRef<string[]>([])
  const [tick, setTick] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  const register = useCallback((id: string, text: string, onSelect?: () => void) => {
    if (!orderRef.current.includes(id)) orderRef.current.push(id)
    itemsRef.current.set(id, { text, onSelect })
    setTick((v) => v + 1)
  }, [])

  const unregister = useCallback((id: string) => {
    orderRef.current = orderRef.current.filter((x) => x !== id)
    itemsRef.current.delete(id)
    setTick((v) => v + 1)
  }, [])

  const visibleIds = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return [...orderRef.current]

    void tick
    return orderRef.current.filter((id) => {
      const entry = itemsRef.current.get(id)
      const t = entry?.text ?? ''
      return t.toLowerCase().includes(q)
    })
  }, [filter, tick])

  const triggerActive = useCallback(() => {
    const id = visibleIds[activeIndex]
    if (!id) return
    const entry = itemsRef.current.get(id)
    entry?.onSelect?.()
  }, [visibleIds, activeIndex])

  useEffect(() => {
    setActiveIndex(0)
  }, [])

  useEffect(() => {
    if (activeIndex >= visibleIds.length) setActiveIndex(0)
  }, [visibleIds.length, activeIndex])

  useEffect(() => {
    if (!open) {
      setFilter('')
      setActiveIndex(0)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    previouslyFocused.current = document.activeElement as HTMLElement | null

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    lockBodyScroll()

    const t = window.setTimeout(() => {
      const input = panelRef.current?.querySelector<HTMLInputElement>('input')
      input?.focus()
    }, 0)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      unlockBodyScroll()
      window.clearTimeout(t)
      queueMicrotask(() => previouslyFocused.current?.focus?.())
    }
  }, [open, onClose])

  if (!open) return null

  const handleOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handlePanelKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const count = visibleIds.length
    if (count === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev + 1) % count)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev - 1 + count) % count)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      triggerActive()
    }
  }

  const ctx: CommandContextValue = {
    filter,
    setFilter,
    activeIndex,
    setActiveIndex,
    register,
    unregister,
    visibleIds,
    placeholder,
    triggerActive,
  }

  return createPortal(
    <div className={styles.overlay} onMouseDown={handleOverlayMouseDown}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        className={cn(styles.panel, className)}
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={handlePanelKeyDown}
      >
        <CommandContext.Provider value={ctx}>{children}</CommandContext.Provider>
      </div>
    </div>,
    document.body
  )
}

export const CommandInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function CommandInput({ placeholder, className, onChange, ...rest }, ref) {
    const ctx = useCommandContext()

    if (!ctx) {
      return (
        <input
          ref={ref}
          className={cn(styles.inputStandalone, className)}
          placeholder={placeholder}
          onChange={onChange}
          {...rest}
        />
      )
    }
    const ph = placeholder ?? ctx.placeholder ?? 'Search…'
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      ctx.setFilter(e.target.value)
      onChange?.(e)
    }
    return (
      <div className={styles.header}>
        <svg
          className={styles.searchIcon}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M7.333 12.667A5.333 5.333 0 1 0 7.333 2a5.333 5.333 0 0 0 0 10.667ZM11.5 11.5l2.5 2.5"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <input
          ref={ref}
          className={cn(styles.input, className)}
          placeholder={ph}
          value={ctx.filter}
          onChange={handleChange}
          aria-autocomplete="list"
          role="combobox"
          aria-expanded="true"
          {...rest}
        />
      </div>
    )
  }
)

export const CommandList = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CommandList({ className, children, ...rest }, ref) {
    return (
      <div ref={ref} className={cn(styles.list, className)} role="listbox" {...rest}>
        {children}
      </div>
    )
  }
)

export interface CommandEmptyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function CommandEmpty({ children, className, ...rest }: CommandEmptyProps) {
  const ctx = useCommandContext()
  if (!ctx) return null
  if (ctx.visibleIds.length !== 0) return null
  return (
    <div className={cn(styles.empty, className)} {...rest}>
      {children}
    </div>
  )
}

export interface CommandGroupProps extends HTMLAttributes<HTMLDivElement> {
  heading?: string
  children: ReactNode
}

export function CommandGroup({ heading, children, className, ...rest }: CommandGroupProps) {
  return (
    <div className={cn(styles.group, className)} {...rest}>
      {heading ? <div className={styles.groupHeading}>{heading}</div> : null}
      <div className={styles.groupItems}>{children}</div>
    </div>
  )
}

export interface CommandItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  value?: string
  onSelect?: () => void
  icon?: ReactNode
  shortcut?: ReactNode
  children: ReactNode
}

export function CommandItem({
  value,
  onSelect,
  icon,
  shortcut,
  children,
  className,
  onClick,
  ...rest
}: CommandItemProps) {
  const ctx = useCommandContext()
  const id = useId()
  const text = getItemText(value, children)

  useEffect(() => {
    if (!ctx) return
    ctx.register(id, text, onSelect)
    return () => ctx.unregister(id)
  }, [ctx, id, text, onSelect])

  if (!ctx) {
    return (
      <div role="option" className={cn(styles.item, className)} onClick={onClick} {...rest}>
        {icon ? <span className={styles.itemIcon}>{icon}</span> : null}
        <span className={styles.itemLabel}>{children}</span>
        {shortcut ? <span className={styles.itemShortcut}>{shortcut}</span> : null}
      </div>
    )
  }

  const visibleIndex = ctx.visibleIds.indexOf(id)
  const isVisible = visibleIndex !== -1
  if (!isVisible) return null

  const isActive = visibleIndex === ctx.activeIndex

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(e)
    onSelect?.()
  }

  const handleMouseEnter = () => {
    ctx.setActiveIndex(visibleIndex)
  }

  return (
    <div
      role="option"
      aria-selected={isActive}
      data-active={isActive ? 'true' : undefined}
      className={cn(styles.item, isActive && styles.active, className)}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      {...rest}
    >
      {icon ? <span className={styles.itemIcon}>{icon}</span> : null}
      <span className={styles.itemLabel}>{children}</span>
      {shortcut ? <span className={styles.itemShortcut}>{shortcut}</span> : null}
    </div>
  )
}

export function CommandSeparator({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div role="separator" className={cn(styles.separator, className)} {...rest} />
}

export const Command = Object.assign(CommandRoot, {
  Input: CommandInput,
  List: CommandList,
  Empty: CommandEmpty,
  Group: CommandGroup,
  Item: CommandItem,
  Separator: CommandSeparator,
})

export const CommandNamespace = Command
