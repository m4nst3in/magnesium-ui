import { cn } from '../../utils/cn'
import styles from './Spinner.module.css'

export interface SpinnerProps {
  size?: number
  className?: string
}

export function Spinner({ size = 16, className }: SpinnerProps) {
  return (
    <svg
      className={cn(styles.spinner, className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label="Carregando"
    >
      <circle className={styles.track} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <circle
        className={styles.arc}
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        pathLength="100"
      />
    </svg>
  )
}
