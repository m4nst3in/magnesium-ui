import { useId, useState, type ReactNode } from 'react'
import { cn } from '../../utils/cn'
import styles from './RadioGroup.module.css'

export interface RadioOption {
  value: string
  label: ReactNode
}

export interface RadioGroupProps {
  options: RadioOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  label?: string
  hint?: string
  error?: string
  disabled?: boolean
  className?: string
}

export function RadioGroup({
  options,
  value,
  defaultValue,
  onValueChange,
  label,
  hint,
  error,
  disabled,
  className,
}: RadioGroupProps) {
  const autoId = useId()
  const name = `radio-${autoId}`
  const labelId = `${autoId}-label`
  const messageId = error || hint ? `${autoId}-msg` : undefined

  const [internal, setInternal] = useState(defaultValue)
  const current = value !== undefined ? value : internal

  const select = (optionValue: string) => {
    if (value === undefined) setInternal(optionValue)
    onValueChange?.(optionValue)
  }

  return (
    <div
      role="radiogroup"
      aria-labelledby={label ? labelId : undefined}
      aria-invalid={error ? true : undefined}
      aria-describedby={messageId}
      className={cn(styles.field, className)}
    >
      {label && (
        <span id={labelId} className={styles.label}>
          {label}
        </span>
      )}
      <div className={styles.options}>
        {options.map((opt) => (
          <label key={opt.value} className={cn(styles.item, disabled && styles.disabledItem)}>
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={current === opt.value}
              disabled={disabled}
              onChange={() => select(opt.value)}
              className={styles.input}
            />
            <span className={styles.radio} aria-hidden="true">
              <span className={styles.inner} />
            </span>
            <span className={styles.optionLabel}>{opt.label}</span>
          </label>
        ))}
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
