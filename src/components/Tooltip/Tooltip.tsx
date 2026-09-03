import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '../../utils/cn'

import styles from './Tooltip.module.css'

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left'

export interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'content'> {
  content: ReactNode
  side?: TooltipSide
  children: ReactNode
}

export function Tooltip({ content, side = 'top', className, children, ...rest }: TooltipProps) {
  return (
    <span className={cn(styles.wrapper, className)} {...rest}>
      {children}
      <span role="tooltip" className={cn(styles.bubble, styles[side])}>
        {content}
      </span>
    </span>
  )
}
