import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../utils/cn'
import styles from './Toast.module.css'

export type ToastVariant = 'info' | 'success' | 'warning' | 'danger'

export interface ToastOptions {
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

interface ToastItem extends ToastOptions {
  id: number
  leaving?: boolean
}

const MAX_TOASTS = 4
const DEFAULT_DURATION = 5000
const EXIT_MS = 180

const ToastContext = createContext<{ toast: (options: ToastOptions) => void } | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast precisa estar dentro de <ToastProvider>')
  return ctx
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)
  const leavingIds = useRef(new Set<number>())

  const remove = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id))
  }, [])

  const dismiss = useCallback(
    (id: number) => {
      if (leavingIds.current.has(id)) return
      leavingIds.current.add(id)
      setToasts((current) =>
        current.map((item) => (item.id === id ? { ...item, leaving: true } : item)),
      )
      window.setTimeout(() => {
        leavingIds.current.delete(id)
        remove(id)
      }, EXIT_MS)
    },
    [remove],
  )

  const toast = useCallback((options: ToastOptions) => {
    const id = ++counter.current
    setToasts((current) => [...current, { ...options, id }])
  }, [])

  useEffect(() => {
    const alive = toasts.filter((item) => !item.leaving)
    if (alive.length > MAX_TOASTS) {
      alive.slice(0, alive.length - MAX_TOASTS).forEach((item) => dismiss(item.id))
    }
  }, [toasts, dismiss])

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className={styles.viewport}>
          {toasts.map((item) => (
            <ToastCard key={item.id} toast={item} onDismiss={dismiss} />
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  const total = toast.duration ?? DEFAULT_DURATION
  const [remaining, setRemaining] = useState(total)
  const [paused, setPaused] = useState(false)
  const startedAt = useRef(Date.now())

  useEffect(() => {
    if (paused || toast.leaving || remaining <= 0) return
    startedAt.current = Date.now()
    const timer = window.setTimeout(() => onDismiss(toast.id), remaining)
    return () => window.clearTimeout(timer)
  }, [paused, remaining, toast.id, onDismiss, toast.leaving])

  const pause = () => {
    setRemaining((current) => Math.max(0, current - (Date.now() - startedAt.current)))
    setPaused(true)
  }

  return (
    <div
      role="status"
      className={cn(
        styles.toast,
        styles[toast.variant ?? 'info'],
        toast.leaving && styles.leaving,
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={styles.titleRow}>
        <span className={styles.dot} aria-hidden="true" />
        <p className={styles.title}>{toast.title}</p>
        <button
          type="button"
          className={styles.close}
          onClick={() => onDismiss(toast.id)}
          aria-label="Fechar"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M3 3l6 6m0-6l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {toast.description && <p className={styles.description}>{toast.description}</p>}
    </div>
  )
}
