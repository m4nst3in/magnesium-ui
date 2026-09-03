import type { HTMLAttributes } from 'react'

import { cn } from '../../utils/cn'

import styles from './Progress.module.css'

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number
}

export function Progress({ value = 0, className, ...rest }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className={cn(styles.track, className)}
      {...rest}
    >
      <div className={styles.fill} style={{ width: `${clamped}%` }} />
    </div>
  )
}
