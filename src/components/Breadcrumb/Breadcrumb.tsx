import { forwardRef, type HTMLAttributes, type AnchorHTMLAttributes, type LiHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import styles from './Breadcrumb.module.css'

export type BreadcrumbProps = HTMLAttributes<HTMLElement>

export const BreadcrumbRoot = forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb(
  { className, ...rest },
  ref,
) {
  return <nav ref={ref as never} aria-label="Breadcrumb" className={cn(styles.nav, className)} {...rest} />
})

export type BreadcrumbListProps = HTMLAttributes<HTMLOListElement>

export const BreadcrumbList = forwardRef<HTMLOListElement, BreadcrumbListProps>(function BreadcrumbList(
  { className, ...rest },
  ref,
) {
  return <ol ref={ref} className={cn(styles.list, className)} {...rest} />
})

export type BreadcrumbItemProps = LiHTMLAttributes<HTMLLIElement>

export const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(function BreadcrumbItem(
  { className, ...rest },
  ref,
) {
  return <li ref={ref} className={cn(styles.item, className)} {...rest} />
})

export type BreadcrumbLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  current?: boolean
}

export const BreadcrumbLink = forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(function BreadcrumbLink(
  { className, current, 'aria-current': ariaCurrent, children, ...rest },
  ref,
) {
  return (
    <a
      ref={ref}
      className={cn(styles.link, current && styles.current, className)}
      aria-current={current ? 'page' : ariaCurrent}
      {...rest}
    >
      {children}
    </a>
  )
})

export type BreadcrumbPageProps = HTMLAttributes<HTMLSpanElement>

export const BreadcrumbPage = forwardRef<HTMLSpanElement, BreadcrumbPageProps>(function BreadcrumbPage(
  { className, ...rest },
  ref,
) {
  return <span ref={ref} aria-current="page" className={cn(styles.page, className)} {...rest} />
})

export type BreadcrumbSeparatorProps = HTMLAttributes<HTMLSpanElement>

export function BreadcrumbSeparator({ className, children, ...rest }: BreadcrumbSeparatorProps) {
  return (
    <span aria-hidden="true" className={cn(styles.separator, className)} {...rest}>
      {children ?? (
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
          <path d="M6 3L10 8L6 13" />
        </svg>
      )}
    </span>
  )
}

export type BreadcrumbEllipsisProps = HTMLAttributes<HTMLSpanElement>

export function BreadcrumbEllipsis({ className, ...rest }: BreadcrumbEllipsisProps) {
  return (
    <span aria-hidden="true" className={cn(styles.ellipsis, className)} {...rest}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <circle cx="4" cy="8" r="1.3" />
        <circle cx="8" cy="8" r="1.3" />
        <circle cx="12" cy="8" r="1.3" />
      </svg>
      <span className={styles.srOnly}>Mais</span>
    </span>
  )
}

export const Breadcrumb = Object.assign(BreadcrumbRoot, {
  List: BreadcrumbList,
  Item: BreadcrumbItem,
  Link: BreadcrumbLink,
  Page: BreadcrumbPage,
  Separator: BreadcrumbSeparator,
  Ellipsis: BreadcrumbEllipsis,
})
