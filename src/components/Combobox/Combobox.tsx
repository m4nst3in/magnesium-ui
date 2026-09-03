import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { cn } from '../../utils/cn'
import styles from './Combobox.module.css'

export interface ComboboxOption {
  value: string
  label: ReactNode
}

export interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  label?: string
  hint?: string
  error?: string
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  id?: string
  className?: string
}

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

export function Combobox({
  options,
  value,
  defaultValue,
  onValueChange,
  label,
  hint,
  error,
  placeholder,
  searchPlaceholder = 'Buscar…',
  emptyMessage = 'Nenhum resultado',
  disabled,
  id,
  className,
}: ComboboxProps) {
  const autoId = useId()
  const rootId = id ?? autoId
  const listboxId = `${rootId}-listbox`

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [internal, setInternal] = useState(defaultValue ?? '')
  const [activeIndex, setActiveIndex] = useState(-1)

  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const isControlled = value !== undefined
  const current = isControlled ? value : internal
  const selected = options.find((opt) => opt.value === current) ?? null
  const filtered = query
    ? options.filter(
        (opt) =>
          normalize(String(opt.label)).includes(normalize(query)) ||
          normalize(opt.value).includes(normalize(query)),
      )
    : options

  const select = (optionValue: string) => {
    if (!isControlled) setInternal(optionValue)
    onValueChange?.(optionValue)
    setOpen(false)
    triggerRef.current?.focus()
  }

  const openMenu = () => {
    if (disabled) return
    setQuery('')
    const idx = options.findIndex((opt) => opt.value === current)
    setActiveIndex(options.length > 0 ? (idx >= 0 ? idx : 0) : -1)
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
    if (open) searchRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open || activeIndex < 0) return
    listRef.current
      ?.querySelectorAll<HTMLElement>('[role="option"]')
      [activeIndex]?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  const onSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setOpen(false)
      triggerRef.current?.focus()
      return
    }
    if (e.key === 'Tab') {
      setOpen(false)
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && activeIndex < filtered.length) select(filtered[activeIndex].value)
      return
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (filtered.length === 0) return
      const delta = e.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((i) => {
        const base = i < 0 ? (delta > 0 ? -1 : 0) : i
        const next = base + delta
        if (next < 0) return filtered.length - 1
        if (next >= filtered.length) return 0
        return next
      })
      return
    }
    if (e.key === 'Home') {
      e.preventDefault()
      setActiveIndex(filtered.length > 0 ? 0 : -1)
    }
    if (e.key === 'End') {
      e.preventDefault()
      setActiveIndex(filtered.length - 1)
    }
  }

  const messageId = error || hint ? `${rootId}-msg` : undefined

  return (
    <div ref={rootRef} className={cn(styles.field, className)}>
      {label && (
        <label className={styles.label} htmlFor={`${rootId}-search`} id={`${rootId}-label`}>
          {label}
        </label>
      )}
      <div className={styles.selectWrap}>
        <button
          ref={triggerRef}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={open ? listboxId : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={messageId}
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
          <span className={cn(styles.valueText, !selected && styles.placeholder)}>
            {selected ? selected.label : (placeholder ?? 'Selecione…')}
          </span>
          <svg
            className={cn(styles.chevron, open && styles.chevronOpen)}
            width="12"
            height="12"
            viewBox="0 0 12 12"
            aria-hidden="true"
          >
            <path
              d="M2 4l4 4 4-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {open && (
          <div className={styles.menu}>
            <input
              ref={searchRef}
              type="text"
              className={cn(styles.search, error && styles.invalidSearch)}
              placeholder={searchPlaceholder}
              value={query}
              role="combobox"
              aria-expanded
              aria-haspopup="listbox"
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={
                activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
              }
              aria-labelledby={label ? `${rootId}-label` : undefined}
              aria-invalid={error ? true : undefined}
              onChange={(e) => {
                setQuery(e.target.value)
                setActiveIndex(0)
              }}
              onKeyDown={onSearchKeyDown}
            />
            <div ref={listRef} role="listbox" id={listboxId} className={styles.list}>
              {filtered.length === 0 ? (
                <div className={styles.emptyRow}>{emptyMessage}</div>
              ) : (
                filtered.map((opt, i) => (
                  <div
                    key={opt.value}
                    id={`${listboxId}-opt-${i}`}
                    role="option"
                    aria-selected={opt.value === current}
                    className={cn(styles.option, i === activeIndex && styles.active)}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => select(opt.value)}
                  >
                    <span>{opt.label}</span>
                    {opt.value === current && (
                      <svg
                        className={styles.check}
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M3 7.5l2.5 2.5L11 4.5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                ))
              )}
            </div>
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
