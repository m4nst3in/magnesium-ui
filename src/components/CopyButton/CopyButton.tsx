import { forwardRef, useRef, useState, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import styles from './CopyButton.module.css'

export type CopyButtonSize = 'sm' | 'md'

export interface CopyButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  value: string
  timeout?: number
  size?: CopyButtonSize
  onCopy?: () => void
}

export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(function CopyButton(
  { value, timeout = 1800, size = 'sm', onCopy, className, onClick, 'aria-label': ariaLabel, ...rest },
  ref,
) {
  const [copied, setCopied] = useState(false)
  const tRef = useRef<number>(0)

  const handleClick: ButtonHTMLAttributes<HTMLButtonElement>['onClick'] = (e) => {
    onClick?.(e)
    if (e.defaultPrevented) return
    const text = value ?? ''
    const doCopy = () => {
      setCopied(true)
      onCopy?.()
      window.clearTimeout(tRef.current)
      tRef.current = window.setTimeout(() => setCopied(false), timeout)
    }
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(doCopy).catch(() => {

        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        ta.remove()
        doCopy()
      })
    } else {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
      doCopy()
    }
  }

  return (
    <button
      ref={ref}
      type="button"
      aria-label={ariaLabel ?? (copied ? 'Copiado' : 'Copiar')}
      data-copied={copied ? 'true' : undefined}
      className={cn(styles.button, styles[size], copied && styles.copied, className)}
      onClick={handleClick}
      {...rest}
    >
      <span className={styles.iconWrap} aria-hidden="true">
        <svg
          className={cn(styles.icon, styles.copyIcon)}
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3.2" y="3.2" width="8.2" height="8.2" rx="1.4" />
          <path d="M6 3.2V2.6A1.3 1.3 0 0 1 7.3 1.3H11.5A1.3 1.3 0 0 1 12.8 2.6V6.8A1.3 1.3 0 0 1 11.5 8.1H11.1" />
        </svg>
        <svg
          className={cn(styles.icon, styles.checkIcon)}
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3.5 8.2L6.2 11L12.8 4.6" />
        </svg>
      </span>
    </button>
  )
})
