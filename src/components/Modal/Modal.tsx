import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../utils/cn'
import { lockBodyScroll, unlockBodyScroll } from '../../utils/bodyScrollLock'
import styles from './Modal.module.css'
export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children: ReactNode
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Modal({ open, onClose, title, footer, size = 'md', className, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    previouslyFocused.current = document.activeElement as HTMLElement | null

    const dialog = dialogRef.current
    const focusables = dialog?.querySelectorAll<HTMLElement>(FOCUSABLE)
    const first = focusables && focusables.length > 0 ? focusables[0] : null
    ;(first ?? dialog)?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !dialog) return

      const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (items.length === 0) {
        e.preventDefault()
        dialog.focus()
        return
      }

      const active = document.activeElement as HTMLElement | null
      if (e.shiftKey) {
        if (active === items[0] || active === dialog) {
          e.preventDefault()
          items[items.length - 1].focus()
        }
      } else if (active === items[items.length - 1]) {
        e.preventDefault()
        items[0].focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)

    lockBodyScroll()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      unlockBodyScroll()
      queueMicrotask(() => previouslyFocused.current?.focus?.())
    }
  }, [open, onClose])

  if (!open) return null

  const handleOverlayMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  return createPortal(
    <div className={styles.overlay} onMouseDown={handleOverlayMouseDown}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(styles.modal, styles[size], className)}
      >
        <div className={styles.header}>
          {title && <h2 className={styles.title}>{title}</h2>}
          <button type="button" className={styles.close} onClick={onClose} aria-label="Fechar">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3.5 3.5l7 7m0-7l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
