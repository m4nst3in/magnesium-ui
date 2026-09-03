import { type ButtonHTMLAttributes, type HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import styles from './Pagination.module.css'

function getPages(current: number, total: number, sibling = 1): (number | 'ellipsis')[] {
  const pages: (number | 'ellipsis')[] = []
  const left = Math.max(2, current - sibling)
  const right = Math.min(total - 1, current + sibling)

  pages.push(1)
  if (left > 2) pages.push('ellipsis')
  for (let i = left; i <= right; i++) pages.push(i)
  if (right < total - 1) pages.push('ellipsis')
  if (total > 1) pages.push(total)

  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  return pages
}

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  page: number
  total: number
  onChange: (page: number) => void
  siblingCount?: number
  showPrevNext?: boolean
}

export function Pagination({
  page,
  total,
  onChange,
  siblingCount = 1,
  showPrevNext = true,
  className,
  ...rest
}: PaginationProps) {
  if (total <= 1) return null
  const current = Math.min(total, Math.max(1, page))
  const pages = getPages(current, total, siblingCount)

  return (
    <nav aria-label="Paginação" className={cn(styles.nav, className)} {...rest}>
      <ul className={styles.list}>
        {showPrevNext && (
          <li>
            <button
              type="button"
              className={cn(styles.item, styles.navBtn)}
              disabled={current === 1}
              aria-label="Página anterior"
              onClick={() => onChange(current - 1)}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10 3L5 8L10 13" />
              </svg>
              <span className={styles.navLabel}>Anterior</span>
            </button>
          </li>
        )}

        {pages.map((p, idx) =>
          p === 'ellipsis' ? (
            <li key={`e-${idx}`} aria-hidden="true" className={cn(styles.item, styles.ellipsis)}>
              <span className={styles.dots}>…</span>
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                aria-label={`Página ${p}`}
                aria-current={p === current ? 'page' : undefined}
                className={cn(styles.item, p === current && styles.active)}
                onClick={() => onChange(p)}
              >
                {p}
              </button>
            </li>
          ),
        )}

        {showPrevNext && (
          <li>
            <button
              type="button"
              className={cn(styles.item, styles.navBtn)}
              disabled={current === total}
              aria-label="Próxima página"
              onClick={() => onChange(current + 1)}
            >
              <span className={styles.navLabel}>Próxima</span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 3L11 8L6 13" />
              </svg>
            </button>
          </li>
        )}
      </ul>
    </nav>
  )
}

export type PaginationItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
}

export function PaginationItem({ active, className, ...rest }: PaginationItemProps) {
  return <button type="button" className={cn(styles.item, active && styles.active, className)} aria-current={active ? 'page' : undefined} {...rest} />
}
