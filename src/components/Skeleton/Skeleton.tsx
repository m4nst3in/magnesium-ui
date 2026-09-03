import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import styles from './Skeleton.module.css'

export const Skeleton = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function Skeleton({ className, ...rest }, ref) {
    return <div ref={ref} aria-hidden="true" className={cn(styles.skeleton, className)} {...rest} />
  },
)
