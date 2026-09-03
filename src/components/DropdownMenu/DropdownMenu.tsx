import {
  type ButtonHTMLAttributes,
  cloneElement,
  createContext,
  type HTMLAttributes,
  isValidElement,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

import { cn } from '../../utils/cn'

import styles from './DropdownMenu.module.css'

export interface DropdownMenuProps {
  trigger: ReactElement
  align?: 'start' | 'end'
  children: ReactNode
}

const DropdownContext = createContext<{ close: () => void } | null>(null)

export function DropdownMenu({ trigger, align = 'start', children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: globalThis.MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  let triggerElement = trigger
  if (isValidElement(trigger)) {
    const originalOnClick = (trigger.props as { onClick?: (e: MouseEvent<HTMLElement>) => void })
      .onClick
    triggerElement = cloneElement(trigger, {
      onClick: (e: MouseEvent<HTMLElement>) => {
        originalOnClick?.(e)
        setOpen((v) => !v)
      },
      'aria-haspopup': 'menu',
      'aria-expanded': open,
    } as Record<string, unknown>)
  }

  return (
    <div ref={rootRef} className={styles.root}>
      {triggerElement}
      {open && (
        <DropdownContext.Provider value={{ close: () => setOpen(false) }}>
          <div role="menu" className={cn(styles.menu, styles[align])}>
            {children}
          </div>
        </DropdownContext.Provider>
      )}
    </div>
  )
}

export interface DropdownMenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export function DropdownMenuItem({ className, onClick, ...rest }: DropdownMenuItemProps) {
  const ctx = useContext(DropdownContext)

  return (
    <button
      type="button"
      role="menuitem"
      className={cn(styles.item, className)}
      onClick={(e) => {
        onClick?.(e)
        ctx?.close()
      }}
      {...rest}
    />
  )
}

export function DropdownSeparator({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div role="separator" className={cn(styles.separator, className)} {...rest} />
}

export const Dropdown = Object.assign(DropdownMenu, {
  Item: DropdownMenuItem,
  Separator: DropdownSeparator,
})
