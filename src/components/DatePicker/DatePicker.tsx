import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react'

import { cn } from '../../utils/cn'

import styles from './DatePicker.module.css'

export interface DatePickerProps {
  value?: Date
  defaultValue?: Date
  onChange?: (date: Date) => void
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  disabled?: boolean
  locale?: string
  className?: string
}

type PickerView = 'days' | 'months' | 'years'

const weekdayLabelsCache = new Map<string, string[]>()

function weekdayLabels(locale: string) {
  let labels = weekdayLabelsCache.get(locale)
  if (!labels) {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: 'short' })
    labels = Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2023, 0, 1 + i)))
    weekdayLabelsCache.set(locale, labels)
  }
  return labels
}

const monthLabelsCache = new Map<string, string[]>()

function monthLabels(locale: string) {
  let labels = monthLabelsCache.get(locale)
  if (!labels) {
    const fmt = new Intl.DateTimeFormat(locale, { month: 'short' })
    labels = Array.from({ length: 12 }, (_, i) => {
      const label = fmt.format(new Date(2023, i, 1))
      return label.charAt(0).toUpperCase() + label.slice(1)
    })
    monthLabelsCache.set(locale, labels)
  }
  return labels
}

const isoKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
const isSameDay = (a: Date | null | undefined, b: Date | null | undefined) =>
  !!a &&
  !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function DatePicker({
  value,
  defaultValue,
  onChange,
  label,
  placeholder = 'Selecione uma data…',
  hint,
  error,
  disabled,
  locale = 'pt-BR',
  className,
}: DatePickerProps) {
  const autoId = useId()
  const messageId = error || hint ? `${autoId}-msg` : undefined

  const [open, setOpen] = useState(false)
  const [view, setView] = useState<PickerView>('days')
  const [internal, setInternal] = useState<Date | null>(defaultValue ?? null)
  const [viewMonth, setViewMonth] = useState(() => {
    const base = value ?? defaultValue ?? new Date()
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })

  const rootRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dayRefs = useRef(new Map<string, HTMLButtonElement>())

  const isControlled = value !== undefined
  const current = isControlled ? value : internal

  const select = (date: Date) => {
    if (!isControlled) setInternal(date)
    onChange?.(date)
    setOpen(false)
    setView('days')
    triggerRef.current?.focus()
  }

  const openMenu = () => {
    if (disabled) return
    const base = current ?? new Date()
    setViewMonth(new Date(base.getFullYear(), base.getMonth(), 1))
    setView('days')
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: globalThis.MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  useEffect(() => {
    if (!open || view !== 'days') return
    menuRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus()
  }, [open, view])

  const navigate = (delta: number) => {
    setViewMonth((vm) => {
      if (view === 'days') return new Date(vm.getFullYear(), vm.getMonth() + delta, 1)
      if (view === 'months') return new Date(vm.getFullYear() + delta, vm.getMonth(), 1)
      return new Date(vm.getFullYear() + delta * 12, vm.getMonth(), 1)
    })
  }

  const moveFocus = (from: Date, deltaDays: number) => {
    const next = new Date(from.getFullYear(), from.getMonth(), from.getDate() + deltaDays)
    if (
      next.getMonth() !== viewMonth.getMonth() ||
      next.getFullYear() !== viewMonth.getFullYear()
    ) {
      setViewMonth(new Date(next.getFullYear(), next.getMonth(), 1))
    }
    const key = isoKey(next)
    requestAnimationFrame(() => dayRefs.current.get(key)?.focus())
  }

  const onMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
      return
    }
    if (e.key === 'Tab' || view !== 'days') return

    const key = document.activeElement?.getAttribute('data-key')
    if (!key) return

    const [y, m, d] = key.split('-').map(Number)
    const from = new Date(y, m, d)
    const jumps: Record<string, number> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: 7,
      ArrowUp: -7,
    }

    if (e.key in jumps) {
      e.preventDefault()
      moveFocus(from, jumps[e.key])
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      select(from)
    } else if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault()
      moveFocus(from, e.key === 'PageUp' ? -30 : 30)
    }
  }

  const viewYear = viewMonth.getFullYear()
  const viewMonthIdx = viewMonth.getMonth()
  const firstWeekday = new Date(viewYear, viewMonthIdx, 1).getDay()
  const days: Date[] = []
  for (let i = 0; i < 42; i++) {
    days.push(new Date(viewYear, viewMonthIdx, 1 - firstWeekday + i))
  }

  const today = new Date()
  const focusKey = current ? isoKey(current) : isoKey(new Date())
  const decadeStart = viewYear - (viewYear % 12)

  const headerLabel =
    view === 'days'
      ? capitalize(viewMonth.toLocaleDateString(locale, { month: 'long', year: 'numeric' }))
      : view === 'months'
        ? String(viewYear)
        : `${decadeStart} – ${decadeStart + 11}`

  const headerAction = view === 'days' ? 'months' : view === 'months' ? 'years' : 'months'

  return (
    <div ref={rootRef} className={cn(styles.field, className)}>
      {label && (
        <span id={`${autoId}-label`} className={styles.label}>
          {label}
        </span>
      )}
      <div className={styles.selectWrap}>
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-invalid={error ? true : undefined}
          aria-describedby={messageId}
          aria-labelledby={label ? `${autoId}-label ${autoId}-value` : `${autoId}-value`}
          disabled={disabled}
          className={cn(styles.trigger, error && styles.invalid, open && styles.open)}
          onClick={() => (open ? setOpen(false) : openMenu())}
          onKeyDown={(e) => {
            if (!open && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
              e.preventDefault()
              openMenu()
            }
          }}
        >
          <span
            id={`${autoId}-value`}
            className={cn(styles.valueText, !current && styles.placeholder)}
          >
            {current ? current.toLocaleDateString(locale) : placeholder}
          </span>
          <svg
            className={styles.icon}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M16 3v4M8 3v4M3 11h18" />
          </svg>
        </button>

        {open && (
          <div
            ref={menuRef}
            role="dialog"
            aria-label={headerLabel}
            className={styles.menu}
            onKeyDown={onMenuKeyDown}
          >
            <div className={styles.header}>
              <button
                type="button"
                className={styles.navBtn}
                onClick={() => navigate(-1)}
                aria-label="Anterior"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path
                    d="M8 2L4 6l4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                className={styles.headerBtn}
                onClick={() => setView(headerAction as PickerView)}
              >
                {headerLabel}
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path
                    d="M2 4l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                className={styles.navBtn}
                onClick={() => navigate(1)}
                aria-label="Próximo"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path
                    d="M4 2l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {view === 'days' && (
              <>
                <div className={styles.weekdays} aria-hidden="true">
                  {weekdayLabels(locale).map((w, i) => (
                    <span key={`${w}-${i}`} className={styles.weekday}>
                      {w}
                    </span>
                  ))}
                </div>
                <div className={styles.grid}>
                  {days.map((day) => {
                    const key = isoKey(day)
                    const selected = isSameDay(day, current)
                    const isToday = isSameDay(day, today)
                    const muted = day.getMonth() !== viewMonthIdx
                    const autofocus = key === focusKey || undefined

                    return (
                      <button
                        key={key}
                        ref={(el) => {
                          if (el) dayRefs.current.set(key, el)
                          else dayRefs.current.delete(key)
                        }}
                        type="button"
                        data-key={key}
                        data-autofocus={autofocus}
                        aria-selected={selected}
                        tabIndex={-1}
                        className={cn(
                          styles.day,
                          muted && styles.muted,
                          isToday && !selected && styles.today,
                          selected && styles.selected
                        )}
                        onClick={() => select(day)}
                      >
                        {day.getDate()}
                      </button>
                    )
                  })}
                </div>
              </>
            )}

            {view === 'months' && (
              <div className={styles.pickerGrid}>
                {monthLabels(locale).map((name, i) => {
                  const isSelected =
                    !!current && current.getFullYear() === viewYear && current.getMonth() === i
                  const isThisMonth = today.getFullYear() === viewYear && today.getMonth() === i
                  return (
                    <button
                      key={name}
                      type="button"
                      tabIndex={-1}
                      className={cn(
                        styles.cellBtn,
                        isSelected && styles.cellSelected,
                        isThisMonth && !isSelected && styles.cellToday
                      )}
                      onClick={() => {
                        setViewMonth(new Date(viewYear, i, 1))
                        setView('days')
                      }}
                    >
                      {name}
                    </button>
                  )
                })}
              </div>
            )}

            {view === 'years' && (
              <div className={styles.pickerGrid}>
                {Array.from({ length: 12 }, (_, i) => {
                  const year = decadeStart + i
                  const isSelected = !!current && current.getFullYear() === year
                  const isThisYear = today.getFullYear() === year
                  return (
                    <button
                      key={year}
                      type="button"
                      tabIndex={-1}
                      className={cn(
                        styles.cellBtn,
                        isSelected && styles.cellSelected,
                        isThisYear && !isSelected && styles.cellToday
                      )}
                      onClick={() => {
                        setViewMonth(new Date(year, viewMonthIdx, 1))
                        setView('months')
                      }}
                    >
                      {year}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
      {error ? (
        <p id={messageId} className={styles.error}>
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}
