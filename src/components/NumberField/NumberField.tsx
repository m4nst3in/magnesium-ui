import {
  forwardRef,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'

import { cn } from '../../utils/cn'

import styles from './NumberField.module.css'

export interface NumberFieldProps {
  value?: number
  defaultValue?: number
  onValueChange?: (v: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  label?: string
  hint?: string
  error?: string
  placeholder?: string
  formatOptions?: Intl.NumberFormatOptions
  id?: string
  className?: string
}

function clamp(n: number, min: number | undefined, max: number | undefined) {
  let v = n
  if (min !== undefined) v = Math.max(min, v)
  if (max !== undefined) v = Math.min(max, v)
  return v
}

function decimalsOf(n: number) {
  const s = String(n)
  const i = s.indexOf('.')
  return i === -1 ? 0 : s.length - i - 1
}

function snap(n: number, min: number | undefined, max: number | undefined, step: number) {
  const clamped = clamp(n, min, max)
  const base = min ?? 0
  const steps = Math.round((clamped - base) / step)
  const v = base + steps * step
  const d = Math.max(decimalsOf(step), decimalsOf(base))
  const fixed = Number(v.toFixed(d))
  return clamp(fixed, min, max)
}

export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(function NumberField(
  {
    value,
    defaultValue,
    onValueChange,
    min,
    max,
    step = 1,
    disabled,
    label,
    hint,
    error,
    placeholder,
    formatOptions,
    id,
    className,
  },
  ref
) {
  const autoId = useId()
  const inputId = id ?? autoId
  const messageId = error || hint ? `${inputId}-msg` : undefined

  const isControlled = value !== undefined

  const clampSnap = useCallback((n: number) => snap(n, min, max, step), [min, max, step])

  const [internal, setInternal] = useState<number | undefined>(() => {
    if (defaultValue !== undefined) return clampSnap(defaultValue)
    return undefined
  })

  const current: number | undefined = isControlled
    ? value !== undefined
      ? clampSnap(value)
      : undefined
    : internal !== undefined
      ? clampSnap(internal)
      : undefined

  const formatter = useMemo(() => {
    if (formatOptions) return new Intl.NumberFormat(undefined, formatOptions)
    return null
  }, [formatOptions])

  const formatValue = useCallback(
    (n: number) => {
      if (formatter) return formatter.format(n)
      return String(n)
    },
    [formatter]
  )

  const [editing, setEditing] = useState(false)
  const [rawInput, setRawInput] = useState('')

  const commit = useCallback(
    (next: number) => {
      const snapped = clampSnap(next)
      if (!isControlled) setInternal(snapped)
      onValueChange?.(snapped)
    },
    [isControlled, clampSnap, onValueChange]
  )

  const currentRef = useRef<number | undefined>(current)
  currentRef.current = current

  const getAtLimits = () => {
    const cur = currentRef.current
    if (cur === undefined) return { atMin: false, atMax: false }
    return {
      atMin: min !== undefined ? cur <= min : false,
      atMax: max !== undefined ? cur >= max : false,
    }
  }

  const stepBy = useCallback(
    (delta: number) => {
      if (disabled) return
      const cur = currentRef.current
      const base = cur ?? min ?? 0

      let nextRaw: number
      if (cur === undefined) {
        nextRaw = base

        if (min === undefined) nextRaw = base + delta
      } else {
        nextRaw = base + delta
      }
      const next = clampSnap(nextRaw)

      const { atMin, atMax } = getAtLimits()
      if ((delta < 0 && atMin) || (delta > 0 && atMax)) return
      if (cur !== undefined && next === cur) {
        return
      }
      if (!isControlled) setInternal(next)
      onValueChange?.(next)
    },
    [disabled, min, clampSnap, isControlled, onValueChange, getAtLimits]
  )

  const intervalRef = useRef<number | null>(null)

  const clearIntervalRef = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => clearIntervalRef, [clearIntervalRef])

  const handleStepperPointerDown = (dir: 1 | -1) => {
    if (disabled) return
    const delta = dir * step
    stepBy(delta)
    clearIntervalRef()
    intervalRef.current = window.setInterval(() => {
      stepBy(delta)
    }, 120)
  }

  const handlePointerUp = () => {
    clearIntervalRef()
  }

  const handleInputFocus = () => {
    setEditing(true)
    setRawInput(current !== undefined ? String(current) : '')
  }

  const handleInputBlur = () => {
    setEditing(false)
    const trimmed = rawInput.trim()
    if (trimmed === '' || trimmed === '-' || trimmed === '.' || trimmed === '-.') {
      if (!isControlled) {
        if (trimmed === '') setInternal(undefined)
      }
      return
    }

    const normalized = trimmed.replace(/[^0-9.-]/g, '')
    const parsed = Number.parseFloat(normalized)
    if (Number.isNaN(parsed)) return
    commit(parsed)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRawInput(e.target.value)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return
    let delta: number | null = null
    switch (e.key) {
      case 'ArrowUp':
        delta = step
        break
      case 'ArrowDown':
        delta = -step
        break
      case 'PageUp':
        delta = step * 10
        break
      case 'PageDown':
        delta = -step * 10
        break
      case 'Home':
        e.preventDefault()
        if (min !== undefined) {
          commit(min)
        } else {
        }
        return
      case 'End':
        e.preventDefault()
        if (max !== undefined) {
          commit(max)
        }
        return
      default:
        return
    }
    if (delta !== null) {
      e.preventDefault()
      stepBy(delta)
    }
  }

  const { atMin, atMax } = (() => {
    if (current === undefined) return { atMin: false, atMax: false }
    return {
      atMin: min !== undefined ? current <= min : false,
      atMax: max !== undefined ? current >= max : false,
    }
  })()

  const displayValue = editing ? rawInput : current !== undefined ? formatValue(current) : ''

  return (
    <div className={cn(styles.field, className)}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className={styles.control}>
        <button
          type="button"
          className={styles.stepper}
          aria-label="Decrease"
          disabled={disabled || atMin}
          onPointerDown={() => handleStepperPointerDown(-1)}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
          tabIndex={-1}
        >
          −
        </button>
        <input
          ref={ref}
          id={inputId}
          className={cn(styles.input, error && styles.invalid)}
          type="text"
          inputMode="numeric"
          role="spinbutton"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={current}
          aria-invalid={error ? true : undefined}
          aria-describedby={messageId}
          placeholder={placeholder}
          disabled={disabled}
          value={displayValue}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          className={styles.stepper}
          aria-label="Increase"
          disabled={disabled || atMax}
          onPointerDown={() => handleStepperPointerDown(1)}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
          tabIndex={-1}
        >
          +
        </button>
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
})
