import {
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'

import { cn } from '../../utils/cn'

import styles from './Slider.module.css'

type SliderValue = number | [number, number]

export interface SliderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  value?: SliderValue

  defaultValue?: SliderValue
  onValueChange?: (value: SliderValue) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  label?: string
  hint?: string
  error?: string

  showValue?: boolean
  formatValue?: (value: number) => string
  id?: string
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function decimalsOf(n: number) {
  const s = String(n)
  const i = s.indexOf('.')
  return i === -1 ? 0 : s.length - i - 1
}

function snap(n: number, min: number, max: number, step: number) {
  const clamped = clamp(n, min, max)
  const steps = Math.round((clamped - min) / step)
  const v = steps * step + min
  const d = Math.max(decimalsOf(step), decimalsOf(min))
  return Number(clamp(v, min, max).toFixed(d))
}

export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(
  {
    value,
    defaultValue,
    onValueChange,
    min = 0,
    max = 100,
    step = 1,
    disabled,
    label,
    hint,
    error,
    showValue,
    formatValue = String,
    id,
    className,
    ...rest
  },
  ref
) {
  const autoId = useId()
  const sliderId = id ?? autoId
  const messageId = error || hint ? `${sliderId}-msg` : undefined
  const labelId = label ? `${sliderId}-label` : undefined

  const isControlled = value !== undefined
  const isRange = Array.isArray(value ?? defaultValue)

  const clampSnap = useCallback((n: number) => snap(n, min, max, step), [min, max, step])

  const [internal, setInternal] = useState<SliderValue>(() => {
    if (isRange) {
      if (Array.isArray(defaultValue)) {
        const a = clampSnap(defaultValue[0])
        const b = clampSnap(defaultValue[1])
        return a <= b ? [a, b] : [b, a]
      }

      const span = max - min
      return [clampSnap(min + span * 0.25), clampSnap(min + span * 0.75)]
    }
    if (typeof defaultValue === 'number') return clampSnap(defaultValue)
    return clampSnap(min)
  })

  let current: SliderValue
  if (isControlled) {
    if (Array.isArray(value)) {
      const a = clampSnap(value[0])
      const b = clampSnap(value[1])
      current = a <= b ? [a, b] : [b, a]
    } else {
      current = clampSnap(value as number)
    }
  } else {
    if (Array.isArray(internal)) {
      const a = clampSnap(internal[0])
      const b = clampSnap(internal[1])
      current = a <= b ? [a, b] : [b, a]
    } else {
      current = clampSnap(internal as number)
    }
  }

  const isRangeCurrent = Array.isArray(current)
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const draggingRef = useRef(false)
  const rafRef = useRef<number>(0)
  const pendingRef = useRef<SliderValue | null>(null)

  const commit = useCallback(
    (next: SliderValue) => {
      if (!isControlled) setInternal(next)
      onValueChange?.(next)
    },
    [isControlled, onValueChange]
  )

  const flush = useCallback(() => {
    rafRef.current = 0
    if (pendingRef.current !== null) {
      const v = pendingRef.current
      pendingRef.current = null
      commit(v)
    }
  }, [commit])

  const schedule = useCallback(
    (v: SliderValue) => {
      pendingRef.current = v
      if (!rafRef.current) rafRef.current = requestAnimationFrame(flush)
    },
    [flush]
  )

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    },
    []
  )
  const valueFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current
      if (!track) return min
      const rect = track.getBoundingClientRect()
      const ratio = (clientX - rect.left) / rect.width
      const raw = min + ratio * (max - min)
      return clampSnap(raw)
    },
    [min, max, clampSnap]
  )

  const handleTrackPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (disabled) return
      const nextVal = valueFromClientX(e.clientX)
      if (isRangeCurrent) {
        const cur = current as [number, number]
        const d0 = Math.abs(cur[0] - nextVal)
        const d1 = Math.abs(cur[1] - nextVal)

        let idx: number
        if (d0 === d1) idx = activeIndex
        else idx = d0 <= d1 ? 0 : 1
        setActiveIndex(idx)
        const next: [number, number] =
          idx === 0 ? [clamp(nextVal, min, cur[1]), cur[1]] : [cur[0], clamp(nextVal, cur[0], max)]

        const snapped: [number, number] =
          idx === 0
            ? [snap(next[0], min, cur[1], step), cur[1]]
            : [cur[0], snap(next[1], cur[0], max, step)]
        commit(snapped)
      } else {
        commit(nextVal)
      }
      draggingRef.current = true
      setDragging(true)
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    },
    [disabled, valueFromClientX, isRangeCurrent, current, activeIndex, min, max, step, commit]
  )

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current || disabled) return
      const nextVal = valueFromClientX(e.clientX)
      if (isRangeCurrent) {
        const cur = current as [number, number]
        if (activeIndex === 0) {
          const v = clampSnap(Math.min(nextVal, cur[1]))
          schedule([v, cur[1]])
        } else {
          const v = clampSnap(Math.max(nextVal, cur[0]))
          schedule([cur[0], v])
        }
      } else {
        schedule(nextVal)
      }
    },
    [disabled, valueFromClientX, isRangeCurrent, current, activeIndex, clampSnap, schedule]
  )

  const handlePointerUp = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      draggingRef.current = false
      setDragging(false)

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = 0
      }
      if (pendingRef.current !== null) {
        const v = pendingRef.current
        pendingRef.current = null
        commit(v)
      }
      try {
        ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
      } catch {}
    },
    [commit]
  )

  const handleSingleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return
      const cur = current as number
      let next = cur
      const bigStep = step * 10
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          next = clampSnap(cur + (e.shiftKey ? bigStep : step))
          break
        case 'ArrowLeft':
        case 'ArrowDown':
          next = clampSnap(cur - (e.shiftKey ? bigStep : step))
          break
        case 'Home':
          next = min
          break
        case 'End':
          next = max
          break
        case 'PageUp':
          next = clampSnap(cur + bigStep)
          break
        case 'PageDown':
          next = clampSnap(cur - bigStep)
          break
        default:
          return
      }
      e.preventDefault()
      commit(next)
    },
    [disabled, current, clampSnap, min, max, step, commit]
  )

  const handleRangeKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>, index: number) => {
      if (disabled) return
      const cur = current as [number, number]
      let delta = 0
      const bigStep = step * 10
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          delta = e.shiftKey ? bigStep : step
          break
        case 'ArrowLeft':
        case 'ArrowDown':
          delta = e.shiftKey ? -bigStep : -step
          break
        case 'Home':
          e.preventDefault()
          commit(index === 0 ? [min, cur[1]] : [cur[0], cur[0]])
          return
        case 'End':
          e.preventDefault()
          commit(index === 0 ? [cur[1], cur[1]] : [cur[0], max])
          return
        case 'PageUp':
          delta = bigStep
          break
        case 'PageDown':
          delta = -bigStep
          break
        default:
          return
      }
      e.preventDefault()
      if (index === 0) {
        const v = clampSnap(clamp(cur[0] + delta, min, cur[1]))
        commit([v, cur[1]])
      } else {
        const v = clampSnap(clamp(cur[1] + delta, cur[0], max))
        commit([cur[0], v])
      }
    },
    [disabled, current, clampSnap, min, max, step, commit]
  )

  const toPct = useCallback((v: number) => ((v - min) / (max - min)) * 100, [min, max])

  const singlePct = !isRangeCurrent ? toPct(current as number) : 0
  const rangePcts = isRangeCurrent
    ? ((current as [number, number]).map(toPct) as [number, number])
    : ([0, 0] as [number, number])
  const fillLeft = isRangeCurrent ? rangePcts[0] : 0
  const fillWidth = isRangeCurrent ? rangePcts[1] - rangePcts[0] : singlePct

  return (
    <div ref={ref} className={cn(styles.field, className)} {...rest}>
      {(label || showValue) && (
        <div className={styles.header}>
          {label && (
            <span id={labelId} className={styles.label}>
              {label}
            </span>
          )}
          {showValue && (
            <span className={cn(styles.value, error && styles.valueError)} aria-hidden="true">
              {isRangeCurrent
                ? `${formatValue((current as [number, number])[0])} — ${formatValue((current as [number, number])[1])}`
                : formatValue(current as number)}
            </span>
          )}
        </div>
      )}

      <div
        className={cn(
          styles.slider,
          disabled && styles.sliderDisabled,
          error && styles.sliderError
        )}
      >
        {}
        <div
          ref={trackRef}
          className={cn(styles.track, dragging && styles.trackDragging)}
          onPointerDown={handleTrackPointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div
            className={styles.fill}
            style={{ left: `${fillLeft}%`, width: `${fillWidth}%` }}
            aria-hidden="true"
          />

          {!isRangeCurrent ? (
            <div
              id={sliderId}
              role="slider"
              tabIndex={disabled ? -1 : 0}
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={current as number}
              aria-valuetext={formatValue(current as number)}
              aria-labelledby={labelId}
              aria-describedby={messageId}
              aria-invalid={error ? true : undefined}
              aria-disabled={disabled}
              className={cn(styles.thumb, dragging && styles.thumbDragging)}
              style={{ left: `${singlePct}%` }}
              onKeyDown={handleSingleKeyDown}
              onPointerDown={() => setActiveIndex(0)}
            >
              <span className={styles.bubble}>{formatValue(current as number)}</span>
            </div>
          ) : (
            <>
              <div
                id={`${sliderId}-thumb-0`}
                role="slider"
                tabIndex={disabled ? -1 : 0}
                aria-valuemin={min}
                aria-valuemax={(current as [number, number])[1]}
                aria-valuenow={(current as [number, number])[0]}
                aria-valuetext={formatValue((current as [number, number])[0])}
                aria-labelledby={labelId}
                aria-describedby={messageId}
                aria-invalid={error ? true : undefined}
                aria-disabled={disabled}
                className={cn(styles.thumb, activeIndex === 0 && dragging && styles.thumbDragging)}
                style={{ left: `${rangePcts[0]}%` }}
                onKeyDown={(e) => handleRangeKeyDown(e, 0)}
                onPointerDown={() => setActiveIndex(0)}
                onFocus={() => setActiveIndex(0)}
              >
                <span className={styles.bubble}>
                  {formatValue((current as [number, number])[0])}
                </span>
              </div>
              <div
                id={`${sliderId}-thumb-1`}
                role="slider"
                tabIndex={disabled ? -1 : 0}
                aria-valuemin={(current as [number, number])[0]}
                aria-valuemax={max}
                aria-valuenow={(current as [number, number])[1]}
                aria-valuetext={formatValue((current as [number, number])[1])}
                aria-labelledby={labelId}
                aria-describedby={messageId}
                aria-invalid={error ? true : undefined}
                aria-disabled={disabled}
                className={cn(styles.thumb, activeIndex === 1 && dragging && styles.thumbDragging)}
                style={{ left: `${rangePcts[1]}%` }}
                onKeyDown={(e) => handleRangeKeyDown(e, 1)}
                onPointerDown={() => setActiveIndex(1)}
                onFocus={() => setActiveIndex(1)}
              >
                <span className={styles.bubble}>
                  {formatValue((current as [number, number])[1])}
                </span>
              </div>
            </>
          )}
        </div>
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
