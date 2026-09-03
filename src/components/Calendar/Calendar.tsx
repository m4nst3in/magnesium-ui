import { useEffect, useMemo, useState } from 'react'

import { cn } from '../../utils/cn'
import { Button } from '../Button/Button'
import { Input } from '../Input/Input'

import styles from './Calendar.module.css'

/* Helpers — extracted from DatePicker, English */

const weekdayLabelsCache = new Map<string, string[]>()
function weekdayLabels(locale: string): string[] {
  let labels = weekdayLabelsCache.get(locale)
  if (!labels) {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: 'short' })
    labels = Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2023, 0, 1 + i)))
    weekdayLabelsCache.set(locale, labels)
  }
  return labels
}

const monthLabelsCache = new Map<string, string[]>()
function monthLabels(locale: string): string[] {
  let labels = monthLabelsCache.get(locale)
  if (!labels) {
    const fmt = new Intl.DateTimeFormat(locale, { month: 'long' })
    labels = Array.from({ length: 12 }, (_, i) => {
      const label = fmt.format(new Date(2023, i, 1))
      return label.charAt(0).toUpperCase() + label.slice(1)
    })
    monthLabelsCache.set(locale, labels)
  }
  return labels
}

function isSameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  return (
    !!a &&
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function addMonths(d: Date, delta: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1)
}

/* Types */

export type DateRange = {
  from?: Date
  to?: Date
}

export interface CalendarProps {
  value?: Date
  defaultValue?: Date
  onChange?: (date: Date | undefined) => void
  locale?: string
  minDate?: Date
  maxDate?: Date
  disabledDates?: Date[]
  mode?: 'single' | 'range'
  selected?: Date | DateRange
  onSelect?: (date: Date | DateRange | undefined) => void
  numberOfMonths?: 1 | 2
  className?: string
}

export interface DateRangePickerPreset {
  label: string
  value?: DateRange
  range?: DateRange
}

export interface DateRangePickerProps {
  value?: DateRange
  defaultValue?: DateRange
  onChange?: (range: DateRange | undefined) => void
  placeholder?: string
  presets?: DateRangePickerPreset[]
  locale?: string
  minDate?: Date
  maxDate?: Date
  numberOfMonths?: 1 | 2
  className?: string
}

/* Calendar */

export function Calendar({
  value,
  defaultValue,
  onChange,
  locale = 'en-US',
  minDate,
  maxDate,
  disabledDates,
  mode = 'single',
  selected,
  onSelect,
  numberOfMonths = 1,
  className,
}: CalendarProps) {
  const isRangeMode = mode === 'range'

  const controlledSingle: Date | undefined =
    value !== undefined ? value : selected instanceof Date ? selected : undefined

  const controlledRange: DateRange | undefined = isRangeMode
    ? ((selected as DateRange | undefined) ?? (value as unknown as DateRange | undefined))
    : undefined

  const [internalSingle, setInternalSingle] = useState<Date | undefined>(
    () => defaultValue ?? undefined
  )
  const [internalRange, setInternalRange] = useState<DateRange | undefined>(() => {
    if (isRangeMode && selected && !(selected instanceof Date)) return selected as DateRange
    if (isRangeMode && defaultValue) return { from: defaultValue, to: undefined }
    return undefined
  })

  const [viewDate, setViewDate] = useState<Date>(() => {
    const base =
      controlledSingle ??
      controlledRange?.from ??
      controlledRange?.to ??
      internalSingle ??
      internalRange?.from ??
      defaultValue ??
      new Date()
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })

  const currentSingle: Date | undefined = controlledSingle ?? internalSingle
  const currentRange: DateRange | undefined = controlledRange ?? internalRange

  const today = useMemo(() => new Date(), [])

  const months = useMemo(() => {
    const count = numberOfMonths === 2 ? 2 : 1
    return Array.from({ length: count }, (_, i) => addMonths(viewDate, i))
  }, [viewDate, numberOfMonths])

  const labels = useMemo(() => weekdayLabels(locale), [locale])
  const mLabels = useMemo(() => monthLabels(locale), [locale])

  const isDisabled = (d: Date): boolean => {
    if (minDate) {
      const min = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())
      const cur = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      if (cur < min) return true
    }
    if (maxDate) {
      const max = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())
      const cur = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      if (cur > max) return true
    }
    if (disabledDates?.some((dd) => isSameDay(dd, d))) return true
    return false
  }

  const handleSingleSelect = (date: Date) => {
    if (isDisabled(date)) return
    const isSame = isSameDay(currentSingle, date)
    const next = isSame ? undefined : date
    const isControlled = value !== undefined || selected instanceof Date
    if (!isControlled) setInternalSingle(next)
    onChange?.(next)
    onSelect?.(next)
  }

  const handleRangeSelect = (date: Date) => {
    if (isDisabled(date)) return
    const cur = currentRange
    let next: DateRange | undefined
    if (!cur?.from || (cur.from && cur.to)) {
      next = { from: date, to: undefined }
    } else if (cur.from && !cur.to) {
      if (isSameDay(cur.from, date)) {
        next = undefined
      } else if (date < cur.from) {
        next = { from: date, to: cur.from }
      } else {
        next = { from: cur.from, to: date }
      }
    } else {
      next = { from: date, to: undefined }
    }
    const isControlled = controlledRange !== undefined
    if (!isControlled) setInternalRange(next)
    onSelect?.(next)
  }

  const handleDayClick = (date: Date) => {
    if (isRangeMode) handleRangeSelect(date)
    else handleSingleSelect(date)
  }

  const goPrev = () => setViewDate((v) => addMonths(v, -1))
  const goNext = () => setViewDate((v) => addMonths(v, 1))

  return (
    <div className={cn(styles.calendar, className)} role="application" aria-label="Calendar">
      <div className={styles.header}>
        <button
          type="button"
          aria-label="Previous month"
          className={styles.navButton}
          onClick={goPrev}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className={styles.headerLabel}>
          {months.map((m) => (
            <span key={m.toISOString()} className={styles.monthLabel}>
              {capitalize(mLabels[m.getMonth()])} {m.getFullYear()}
            </span>
          ))}
        </div>
        <button type="button" aria-label="Next month" className={styles.navButton} onClick={goNext}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M6 4L10 8L6 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className={cn(styles.months, numberOfMonths === 2 && styles.monthsTwo)}>
        {months.map((monthDate) => {
          const year = monthDate.getFullYear()
          const monthIdx = monthDate.getMonth()
          const firstWeekday = new Date(year, monthIdx, 1).getDay()
          const days: Date[] = Array.from(
            { length: 42 },
            (_, i) => new Date(year, monthIdx, 1 - firstWeekday + i)
          )
          return (
            <div key={monthDate.toISOString()} className={styles.month}>
              <div className={styles.weekdays} role="row">
                {labels.map((w) => (
                  <div
                    key={w + monthDate.toISOString()}
                    className={styles.weekday}
                    role="columnheader"
                  >
                    {w.slice(0, 2)}
                  </div>
                ))}
              </div>
              <div className={styles.days} role="grid">
                {days.map((d) => {
                  const outside = d.getMonth() !== monthIdx
                  const disabled = isDisabled(d)
                  const isToday = isSameDay(d, today)
                  const isSelectedSingle = !isRangeMode && isSameDay(d, currentSingle)
                  const isRangeStart = isRangeMode && isSameDay(d, currentRange?.from)
                  const isRangeEnd = isRangeMode && isSameDay(d, currentRange?.to)
                  const isRangeSelected = isRangeStart || isRangeEnd
                  const isRangeMiddle =
                    isRangeMode &&
                    currentRange?.from &&
                    currentRange?.to &&
                    d > currentRange.from &&
                    d < currentRange.to
                  return (
                    <button
                      key={d.toISOString()}
                      type="button"
                      role="gridcell"
                      aria-selected={
                        isSelectedSingle || isRangeSelected || !!isRangeMiddle ? true : undefined
                      }
                      aria-disabled={disabled ? true : undefined}
                      disabled={disabled}
                      className={cn(
                        styles.day,
                        outside && styles.dayOutside,
                        disabled && styles.dayDisabled,
                        isToday && styles.dayToday,
                        isSelectedSingle && styles.daySelected,
                        isRangeSelected && styles.daySelected,
                        isRangeMiddle && styles.dayRangeMiddle
                      )}
                      onClick={() => handleDayClick(d)}
                    >
                      {d.getDate()}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* DateRangePicker */

export function DateRangePicker({
  value,
  defaultValue,
  onChange,
  placeholder = 'Select date range',
  presets,
  locale = 'en-US',
  minDate,
  maxDate,
  numberOfMonths = 2,
  className,
}: DateRangePickerProps) {
  const isControlled = value !== undefined
  const [internal, setInternal] = useState<DateRange | undefined>(() => defaultValue)
  const [draft, setDraft] = useState<DateRange | undefined>(() => value ?? defaultValue)

  useEffect(() => {
    if (isControlled) setDraft(value)
  }, [isControlled, value])

  const displayRange: DateRange | undefined = isControlled ? value : internal

  const handleSelect = (next: Date | DateRange | undefined) => {
    setDraft(next as DateRange | undefined)
  }

  const handleApply = () => {
    const next = draft
    if (!isControlled) setInternal(next)
    onChange?.(next)
  }

  const handleCancel = () => {
    setDraft(displayRange)
  }

  const handlePreset = (preset: DateRangePickerPreset) => {
    const range = preset.value ?? preset.range ?? {}
    setDraft(range)
  }

  const fromText = draft?.from ? draft.from.toLocaleDateString(locale) : ''
  const toText = draft?.to ? draft.to.toLocaleDateString(locale) : ''

  const hasValue = !!(displayRange?.from || displayRange?.to)
  const displayPlaceholder = hasValue
    ? `${displayRange?.from ? displayRange.from.toLocaleDateString(locale) : ''} — ${displayRange?.to ? displayRange.to.toLocaleDateString(locale) : ''}`.trim()
    : placeholder

  return (
    <div className={cn(styles.rangePicker, className)}>
      <div className={styles.rangeHeader}>
        <span className={styles.rangePlaceholder}>{displayPlaceholder}</span>
      </div>
      <div className={styles.rangeBody}>
        {presets && presets.length > 0 && (
          <div className={styles.presets} role="list">
            {presets.map((p) => {
              const normRange = p.value ?? p.range
              const isActive =
                !!draft?.from &&
                !!draft?.to &&
                !!normRange?.from &&
                !!normRange?.to &&
                isSameDay(draft.from, normRange.from) &&
                isSameDay(draft.to, normRange.to)
              return (
                <button
                  key={p.label}
                  type="button"
                  role="listitem"
                  className={cn(styles.presetButton, isActive && styles.presetActive)}
                  onClick={() => handlePreset(p)}
                >
                  {p.label}
                </button>
              )
            })}
          </div>
        )}
        <div className={styles.rangeCalendarWrap}>
          <Calendar
            mode="range"
            locale={locale}
            minDate={minDate}
            maxDate={maxDate}
            selected={draft}
            onSelect={handleSelect}
            numberOfMonths={numberOfMonths}
          />
          <div className={styles.rangeInputs}>
            <Input
              placeholder="Start date"
              value={fromText}
              onChange={(e) => {
                const v = e.target.value
                if (!v) setDraft((prev) => ({ ...prev, from: undefined }))
                else {
                  const parsed = new Date(v)
                  if (!isNaN(parsed.getTime())) setDraft((prev) => ({ ...prev, from: parsed }))
                }
              }}
              aria-label="Start date"
            />
            <span className={styles.rangeSeparator}>—</span>
            <Input
              placeholder="End date"
              value={toText}
              onChange={(e) => {
                const v = e.target.value
                if (!v) setDraft((prev) => ({ ...prev, to: undefined }))
                else {
                  const parsed = new Date(v)
                  if (!isNaN(parsed.getTime())) setDraft((prev) => ({ ...prev, to: parsed }))
                }
              }}
              aria-label="End date"
            />
          </div>
        </div>
      </div>
      <div className={styles.rangeFooter}>
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={handleApply}>
          Apply
        </Button>
      </div>
    </div>
  )
}

export default Calendar
