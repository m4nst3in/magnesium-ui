import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import styles from './Switch.module.css'

export interface SwitchProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean
  onCheckedChange?: (checked: boolean) => void
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { checked, onCheckedChange, className, onClick, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={cn(styles.switch, checked && styles.checked, className)}
      onClick={(e) => {
        onCheckedChange?.(!checked)
        onClick?.(e)
      }}
      {...rest}
    >
      <span className={styles.thumb} />
    </button>
  )
})
