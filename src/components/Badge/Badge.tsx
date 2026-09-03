import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import styles from './Badge.module.css'

export type BadgeVariant = 'neutral' | 'brand' | 'success' | 'warning' | 'danger'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  dot?: boolean
  pulse?: boolean
}

export function Badge({
  variant = 'neutral',
  dot = false,
  pulse = false,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span className={cn(styles.badge, styles[variant], className)} {...rest}>
      {dot && <span className={cn(styles.dot, pulse && styles.pulse)} aria-hidden="true" />}
      {children}
    </span>
  )
}
