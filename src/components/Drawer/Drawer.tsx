import { type MouseEvent, type ReactNode, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { lockBodyScroll, unlockBodyScroll } from '../../utils/bodyScrollLock'
import { cn } from '../../utils/cn'

import styles from './Drawer.module.css'

export type DrawerSide = 'left' | 'right' | 'top' | 'bottom'

export interface DrawerProps {
  open: boolean
  onClose: () => void
  side?: DrawerSide
  title?: ReactNode
  description?: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children: ReactNode
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

const SIZE_MAP: Record<DrawerSide, Record<string, string>> = {
  left: { sm: styles.smH, md: styles.mdH, lg: styles.lgH },
  right: { sm: styles.smH, md: styles.mdH, lg: styles.lgH },
  top: { sm: styles.smV, md: styles.mdV, lg: styles.lgV },
  bottom: { sm: styles.smV, md: styles.mdV, lg: styles.lgV },
}

export function Drawer({
  open,
  onClose,
  side = 'right',
  title,
  description,
  footer,
  size = 'md',
  className,
  children,
}: DrawerProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)
  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(open)

  useEffect(() => {
    if (open) {
      setMounted(true)
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
      return () => cancelAnimationFrame(id)
    }
    if (mounted) {
      setVisible(false)
      const t = window.setTimeout(() => setMounted(false), 320)
      return () => window.clearTimeout(t)
    }
  }, [open, mounted])

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null

    const sheet = sheetRef.current
    const focusables = sheet?.querySelectorAll<HTMLElement>(FOCUSABLE)
    const first = focusables && focusables.length > 0 ? focusables[0] : null
    ;(first ?? sheet)?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
      if (e.key === 'Tab' && sheet) {
        const nodes = Array.from(sheet.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (el) => el.offsetParent !== null
        )
        if (nodes.length === 0) {
          e.preventDefault()
          return
        }
        const firstEl = nodes[0]
        const lastEl = nodes[nodes.length - 1]
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault()
          lastEl.focus()
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault()
          firstEl.focus()
        }
      }
    }
    document.addEventListener('keydown', onKeyDown)

    lockBodyScroll()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      unlockBodyScroll()
      queueMicrotask(() => previouslyFocused.current?.focus?.())
    }
  }, [onClose])

  if (!mounted) return null

  const handleOverlayMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  const sizeClass = SIZE_MAP[side][size] ?? ''

  return createPortal(
    <div
      className={cn(styles.overlay, visible && styles.overlayVisible)}
      onMouseDown={handleOverlayMouseDown}
      aria-hidden={!visible ? true : undefined}
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
        aria-describedby={description ? 'drawer-desc' : undefined}
        tabIndex={-1}
        data-side={side}
        data-visible={visible ? 'true' : 'false'}
        className={cn(
          styles.sheet,
          styles[side],
          sizeClass,
          visible && styles.sheetVisible,
          className
        )}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {(title || description) && (
          <div className={styles.header}>
            <div className={styles.heading}>
              {title && (
                <h2 id="drawer-title" className={styles.title}>
                  {title}
                </h2>
              )}
              {description && (
                <p id="drawer-desc" className={styles.description}>
                  {description}
                </p>
              )}
            </div>
            <button type="button" className={styles.close} onClick={onClose} aria-label="Fechar">
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              >
                <path d="M4 4L12 12M12 4L4 12" />
              </svg>
            </button>
          </div>
        )}
        {!title && !description && (
          <button
            type="button"
            className={cn(styles.close, styles.closeAbs)}
            onClick={onClose}
            aria-label="Fechar"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            >
              <path d="M4 4L12 12M12 4L4 12" />
            </svg>
          </button>
        )}
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body
  )
}

export const Sheet = Drawer
export type SheetProps = DrawerProps
export type SheetSide = DrawerSide
