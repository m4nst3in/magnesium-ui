import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { cn } from '../../utils/cn'
import styles from './Select.module.css'

export interface SelectOption {
  value: string
  label: ReactNode
}

export interface SelectProps {
  options: SelectOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  label?: string
  hint?: string
  error?: string
  placeholder?: string
  disabled?: boolean
  id?: string
  className?: string
}

export function Select({
  options,
  value,
  defaultValue,
  onValueChange,
  label,
  hint,
  error,
  placeholder,
  disabled,
  id,
  className,
}: SelectProps) {
  const autoId = useId()
  const rootId = id ?? autoId
  const listboxId = `${rootId}-listbox`

  const [open, setOpen] = useState(false)
  const [internal, setInternal] = useState(defaultValue ?? '')
  const [activeIndex, setActiveIndex] = useState(-1)

  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const isControlled = value !== undefined
  const current = isControlled ? value : internal
  const selected = options.find((opt) => opt.value === current) ?? null

  const select = (optionValue: string) => {
    if (!isControlled) setInternal(optionValue)
    onValueChange?.(optionValue)
    setOpen(false)
    triggerRef.current?.focus()
  }

  const openMenu = () => {
    if (disabled || options.length === 0) return
    const idx = options.findIndex((opt) => opt.value === current)
    setActiveIndex(idx >= 0 ? idx : 0)
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
    if (open) listRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open || activeIndex < 0) return
    listRef.current
      ?.querySelectorAll<HTMLElement>('[role="option"]')
      [activeIndex]?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  const onListKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' || e.key === 'Tab') {
      setOpen(false)
      triggerRef.current?.focus()
      return
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (activeIndex >= 0 && activeIndex < options.length) select(options[activeIndex].value)
      return
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const delta = e.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((i) => {
        const next = i + delta
        if (next < 0) return options.length - 1
        if (next >= options.length) return 0
        return next
      })
      return
    }
    if (e.key === 'Home') {
      e.preventDefault()
      setActiveIndex(0)
    }
    if (e.key === 'End') {
      e.preventDefault()
      setActiveIndex(options.length - 1)
    }
  }

  const messageId = error || hint ? `${rootId}-msg` : undefined

  return (
    <div ref={rootRef} className={cn(styles.field, className)}>
      {label && (
        <label className={styles.label} htmlFor={rootId} id={`${rootId}-label`}>
          {label}
        </label>
      )}
      <div className={styles.selectWrap}>
        <button
          ref={triggerRef}
          type="button"
          id={rootId}
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
          <div
            ref={listRef}
            id={listboxId}
            role="listbox"
            tabIndex={-1}
            aria-labelledby={label ? `${rootId}-label` : undefined}
            aria-activedescendant={activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined}
            className={styles.menu}
            onKeyDown={onListKeyDown}
          >
            {options.map((opt, i) => (
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
                  <svg className={styles.check} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
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
            ))}
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
