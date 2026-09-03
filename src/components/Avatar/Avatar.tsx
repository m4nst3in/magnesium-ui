import { type HTMLAttributes, useState } from 'react'

import { cn } from '../../utils/cn'

import styles from './Avatar.module.css'

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  src?: string
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Avatar({ src, alt = '', fallback, size = 'md', className, ...rest }: AvatarProps) {
  const [failed, setFailed] = useState(false)
  const showImg = Boolean(src) && !failed

  return (
    <span
      className={cn(styles.avatar, styles[size], className)}
      role={showImg ? undefined : 'img'}
      aria-label={showImg ? undefined : alt || fallback}
      {...rest}
    >
      {showImg ? (
        <img src={src} alt={alt} className={styles.img} onError={() => setFailed(true)} />
      ) : (
        <span className={styles.fallback} aria-hidden="true">
          {fallback}
        </span>
      )}
    </span>
  )
}
