import {
  forwardRef,
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from 'react'

import { cn } from '../../utils/cn'

import styles from './Table.module.css'

export type TableProps = HTMLAttributes<HTMLTableElement>

export const TableRoot = forwardRef<HTMLTableElement, TableProps>(function Table(
  { className, ...rest },
  ref
) {
  return (
    <div className={styles.scroll}>
      <table ref={ref} className={cn(styles.table, className)} {...rest} />
    </div>
  )
})

export type TableHeaderProps = HTMLAttributes<HTMLTableSectionElement>

export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  function TableHeader({ className, ...rest }, ref) {
    return <thead ref={ref} className={cn(styles.header, className)} {...rest} />
  }
)

export type TableBodyProps = HTMLAttributes<HTMLTableSectionElement>

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(function TableBody(
  { className, ...rest },
  ref
) {
  return <tbody ref={ref} className={cn(styles.body, className)} {...rest} />
})

export type TableRowProps = HTMLAttributes<HTMLTableRowElement> & {
  selected?: boolean
  interactive?: boolean
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { className, selected, interactive, tabIndex, onKeyDown, ...rest },
  ref
) {
  const isInteractive = interactive ?? !!rest.onClick
  return (
    <tr
      ref={ref}
      className={cn(styles.row, className)}
      data-selected={selected ? 'true' : undefined}
      data-interactive={isInteractive ? 'true' : undefined}
      tabIndex={isInteractive ? (tabIndex ?? 0) : tabIndex}
      onKeyDown={(e) => {
        if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          ;(e.currentTarget as HTMLTableRowElement).click()
        }
        onKeyDown?.(e)
      }}
      {...rest}
    />
  )
})

export type TableThProps = ThHTMLAttributes<HTMLTableCellElement> & {
  numeric?: boolean
}

export const TableTh = forwardRef<HTMLTableCellElement, TableThProps>(function TableTh(
  { className, numeric, ...rest },
  ref
) {
  return (
    <th
      ref={ref}
      className={cn(styles.th, className)}
      data-numeric={numeric ? 'true' : undefined}
      {...rest}
    />
  )
})

export type TableTdProps = TdHTMLAttributes<HTMLTableCellElement> & {
  numeric?: boolean
}

export const TableTd = forwardRef<HTMLTableCellElement, TableTdProps>(function TableTd(
  { className, numeric, ...rest },
  ref
) {
  return (
    <td
      ref={ref}
      className={cn(styles.td, className)}
      data-numeric={numeric ? 'true' : undefined}
      {...rest}
    />
  )
})

export type TableCaptionProps = HTMLAttributes<HTMLTableCaptionElement>

export const TableCaption = forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  function TableCaption({ className, ...rest }, ref) {
    return <caption ref={ref} className={cn(styles.caption, className)} {...rest} />
  }
)

export const Table = Object.assign(TableRoot, {
  Header: TableHeader,
  Body: TableBody,
  Row: TableRow,
  Th: TableTh,
  Td: TableTd,
  Caption: TableCaption,
})
