import { type ReactNode, useId, useMemo, useState } from 'react'

import { Badge } from '../Badge/Badge'
import { Checkbox } from '../Checkbox/Checkbox'
import { Input } from '../Input/Input'
import { Pagination } from '../Pagination/Pagination'
import { Select } from '../Select/Select'
import { Table } from '../Table/Table'

import styles from './DataTable.module.css'

export interface DataTableSorting {
  id: string
  desc: boolean
}

export interface DataTableColumn<T extends Record<string, unknown>> {
  id: string
  header: ReactNode
  accessorKey?: keyof T
  accessorFn?: (row: T) => ReactNode
  cell?: (info: { row: T; value: unknown; rowId: string }) => ReactNode
  sortable?: boolean
  filterable?: boolean
}

export interface DataTablePaginationState {
  pageIndex: number
  pageSize: number
  total?: number
  onPageChange?: (pageIndex: number) => void
  onPageSizeChange?: (pageSize: number) => void
  /** alias for pageIndex (1-based page not recommended, prefer pageIndex) */
  page?: number
}

export interface DataTableRowSelectionState {
  selectedRowIds: Record<string, boolean>
  onSelectionChange?: (next: Record<string, boolean>) => void
}

export interface DataTableProps<T extends Record<string, unknown>> {
  columns: DataTableColumn<T>[]
  data: T[]
  sorting?: DataTableSorting | null
  onSortingChange?: (sorting: DataTableSorting | null) => void
  /** alias for onSortingChange */
  onSort?: (sorting: DataTableSorting | null) => void
  globalFilter?: string
  onGlobalFilterChange?: (value: string) => void
  pagination?: DataTablePaginationState
  rowSelection?: DataTableRowSelectionState
  getRowId?: (row: T, index: number) => string
  className?: string
  'aria-label'?: string
}

function getValueForColumn<T extends Record<string, unknown>>(
  row: T,
  col: DataTableColumn<T>
): unknown {
  if (col.accessorFn) {
    const v = col.accessorFn(row)
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return v
    if (v == null) return v
    // For ReactNode, stringify for filter/sort fallback
    return v
  }
  if (col.accessorKey !== undefined) return row[col.accessorKey]
  return undefined
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  sorting: controlledSorting,
  onSortingChange,
  onSort,
  globalFilter: controlledFilter,
  onGlobalFilterChange,
  pagination,
  rowSelection,
  getRowId,
  className,
  'aria-label': ariaLabel = 'Data table',
}: DataTableProps<T>) {
  const autoId = useId()

  const [internalSorting, setInternalSorting] = useState<DataTableSorting | null>(null)
  const [internalFilter, setInternalFilter] = useState('')
  const [internalPageIndex, setInternalPageIndex] = useState(0)
  const [internalPageSize, setInternalPageSize] = useState(10)

  const isSortingControlled = controlledSorting !== undefined
  const currentSorting: DataTableSorting | null = isSortingControlled
    ? (controlledSorting ?? null)
    : internalSorting

  const isFilterControlled = controlledFilter !== undefined
  const currentFilter = isFilterControlled ? (controlledFilter ?? '') : internalFilter

  const hasPaginationProp = pagination !== undefined
  const paginationPageIndex =
    pagination?.pageIndex ?? (pagination?.page != null ? pagination.page - 1 : undefined)
  const currentPageIndex = hasPaginationProp ? (paginationPageIndex ?? 0) : internalPageIndex
  const currentPageSize = hasPaginationProp ? (pagination?.pageSize ?? 10) : internalPageSize

  const resolveRowId = (row: T, index: number): string => {
    if (getRowId) return getRowId(row, index)
    const maybeId = (row as Record<string, unknown>)['id']
    if (typeof maybeId === 'string' || typeof maybeId === 'number') return String(maybeId)
    return `${autoId}-${index}`
  }

  const handleSortingChange = (next: DataTableSorting | null) => {
    if (onSortingChange) onSortingChange(next)
    else if (onSort) onSort(next)
    else setInternalSorting(next)
    // if controlled, also update? we also call onSort alias if both present
    if (onSortingChange && onSort) onSort(next)
  }

  const handleFilterChange = (value: string) => {
    if (isFilterControlled) onGlobalFilterChange?.(value)
    else setInternalFilter(value)
    if (isFilterControlled && onGlobalFilterChange) {
      // already called
    } else if (!isFilterControlled && onGlobalFilterChange) {
      onGlobalFilterChange(value)
    }
    // reset to first page on filter change
    if (hasPaginationProp) pagination?.onPageChange?.(0)
    else setInternalPageIndex(0)
  }

  const handlePageChange = (nextUiPage: number) => {
    const nextIndex = nextUiPage - 1
    if (hasPaginationProp) pagination?.onPageChange?.(nextIndex)
    else setInternalPageIndex(nextIndex)
  }

  const handlePageSizeChange = (value: string) => {
    const nextSize = Number(value)
    if (hasPaginationProp) {
      pagination?.onPageSizeChange?.(nextSize)
      pagination?.onPageChange?.(0)
    } else {
      setInternalPageSize(nextSize)
      setInternalPageIndex(0)
    }
  }

  // Filtering
  const filteredData = useMemo(() => {
    const q = currentFilter.trim().toLowerCase()
    if (!q) return data
    const filterableCols = columns.filter((c) => c.filterable)
    const colsToFilter = filterableCols.length > 0 ? filterableCols : columns
    return data.filter((row) =>
      colsToFilter.some((col) => {
        const raw = getValueForColumn(row, col)
        let str: string
        if (raw == null) str = ''
        else if (typeof raw === 'string') str = raw
        else if (typeof raw === 'number' || typeof raw === 'boolean') str = String(raw)
        else if (raw instanceof Date) str = raw.toISOString()
        else {
          try {
            const s = String(raw)
            str = s === '[object Object]' ? '' : s
          } catch {
            str = ''
          }
        }
        return str.toLowerCase().includes(q)
      })
    )
  }, [data, columns, currentFilter])

  // Sorting
  const sortedData = useMemo(() => {
    if (!currentSorting) return filteredData
    const col = columns.find((c) => c.id === currentSorting.id)
    if (!col || !col.sortable) return filteredData
    const copy = [...filteredData]
    copy.sort((a, b) => {
      const va = getValueForColumn(a, col)
      const vb = getValueForColumn(b, col)
      let cmp: number
      if (va == null && vb == null) cmp = 0
      else if (va == null) cmp = -1
      else if (vb == null) cmp = 1
      else if (typeof va === 'number' && typeof vb === 'number') cmp = va - vb
      else if (va instanceof Date && vb instanceof Date) cmp = va.getTime() - vb.getTime()
      else {
        const aStr =
          va == null
            ? ''
            : typeof va === 'string'
              ? va
              : typeof va === 'number' || typeof va === 'boolean'
                ? String(va)
                : va instanceof Date
                  ? va.toISOString()
                  : (() => {
                      try {
                        const s = String(va)
                        return s === '[object Object]' ? '' : s
                      } catch {
                        return ''
                      }
                    })()
        const bStr =
          vb == null
            ? ''
            : typeof vb === 'string'
              ? vb
              : typeof vb === 'number' || typeof vb === 'boolean'
                ? String(vb)
                : vb instanceof Date
                  ? vb.toISOString()
                  : (() => {
                      try {
                        const s = String(vb)
                        return s === '[object Object]' ? '' : s
                      } catch {
                        return ''
                      }
                    })()
        const aNum = Number(aStr)
        const bNum = Number(bStr)
        const bothNumeric =
          !Number.isNaN(aNum) && !Number.isNaN(bNum) && aStr.trim() !== '' && bStr.trim() !== ''
        cmp = bothNumeric
          ? aNum - bNum
          : aStr.localeCompare(bStr, undefined, { numeric: true, sensitivity: 'base' })
      }
      return currentSorting.desc ? -cmp : cmp
    })
    return copy
  }, [filteredData, columns, currentSorting])

  const totalRows = pagination?.total ?? sortedData.length
  const totalPages = Math.max(1, Math.ceil(totalRows / currentPageSize))

  // clamp page index
  const clampedPageIndex = Math.min(Math.max(0, currentPageIndex), Math.max(0, totalPages - 1))

  const paginatedData = useMemo(() => {
    const start = clampedPageIndex * currentPageSize
    return sortedData.slice(start, start + currentPageSize)
  }, [sortedData, clampedPageIndex, currentPageSize])

  // Selection
  const selectedRowIds = rowSelection?.selectedRowIds ?? {}
  const selectedCount = useMemo(
    () => Object.values(selectedRowIds).filter(Boolean).length,
    [selectedRowIds]
  )
  const hasSelection = rowSelection !== undefined

  const paginatedIds = useMemo(
    () =>
      paginatedData.map((row, idx) => resolveRowId(row, clampedPageIndex * currentPageSize + idx)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paginatedData, clampedPageIndex, currentPageSize, autoId, getRowId, data]
  )

  const isAllSelected = paginatedIds.length > 0 && paginatedIds.every((id) => selectedRowIds[id])
  const isSomeSelected = paginatedIds.some((id) => selectedRowIds[id]) && !isAllSelected

  const toggleAll = (checked: boolean) => {
    if (!rowSelection) return
    const next = { ...selectedRowIds }
    for (const id of paginatedIds) {
      if (checked) next[id] = true
      else delete next[id]
    }
    rowSelection.onSelectionChange?.(next)
  }

  const toggleRow = (id: string, checked: boolean) => {
    if (!rowSelection) return
    const next = { ...selectedRowIds }
    if (checked) next[id] = true
    else delete next[id]
    rowSelection.onSelectionChange?.(next)
  }

  const handleSortClick = (col: DataTableColumn<T>) => {
    if (!col.sortable) return
    const isActive = currentSorting?.id === col.id
    const next: DataTableSorting | null = isActive
      ? { id: col.id, desc: !currentSorting.desc }
      : { id: col.id, desc: false }
    handleSortingChange(next)
  }

  const pageSizeOptions = [
    { value: '5', label: '5' },
    { value: '10', label: '10' },
    { value: '20', label: '20' },
  ]

  return (
    <div className={styles.wrapper + (className ? ` ${className}` : '')}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Input
            placeholder="Search..."
            value={currentFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            aria-label="Search"
          />
        </div>
        <div className={styles.toolbarRight}>
          <span className={styles.count} aria-live="polite">
            {sortedData.length} {sortedData.length === 1 ? 'row' : 'rows'}
          </span>
          {hasSelection && selectedCount > 0 && (
            <Badge variant="neutral">{selectedCount} selected</Badge>
          )}
        </div>
      </div>

      <div className={styles.tableWrap}>
        <Table aria-label={ariaLabel} className={styles.table}>
          <Table.Header>
            <Table.Row>
              {hasSelection && (
                <Table.Th className={styles.checkTh} aria-label="Select all">
                  <Checkbox
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) (el as HTMLInputElement).indeterminate = isSomeSelected
                    }}
                    onChange={(e) => toggleAll(e.target.checked)}
                    aria-label="Select all rows"
                  />
                </Table.Th>
              )}
              {columns.map((col) => {
                const active = currentSorting?.id === col.id
                const ariaSort: 'none' | 'ascending' | 'descending' = !active
                  ? 'none'
                  : currentSorting?.desc
                    ? 'descending'
                    : 'ascending'
                return (
                  <Table.Th
                    key={col.id}
                    aria-sort={col.sortable ? ariaSort : undefined}
                    className={styles.th}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        className={styles.sortButton}
                        onClick={() => handleSortClick(col)}
                        aria-label={`Sort by ${col.id} ${active ? (currentSorting?.desc ? 'descending' : 'ascending') : ''}`}
                      >
                        <span>{col.header}</span>
                        <span
                          className={active ? styles.sortIconActive : styles.sortIcon}
                          aria-hidden="true"
                        >
                          {active ? (currentSorting?.desc ? '▼' : '▲') : '↕'}
                        </span>
                      </button>
                    ) : (
                      col.header
                    )}
                  </Table.Th>
                )
              })}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {paginatedData.length === 0 ? (
              <Table.Row>
                <Table.Td colSpan={columns.length + (hasSelection ? 1 : 0)}>
                  <div className={styles.empty}>No results.</div>
                </Table.Td>
              </Table.Row>
            ) : (
              paginatedData.map((row, rowIdx) => {
                const globalIdx = clampedPageIndex * currentPageSize + rowIdx
                const rowId = resolveRowId(row, globalIdx)
                const isSelected = !!selectedRowIds[rowId]
                return (
                  <Table.Row key={rowId} selected={isSelected}>
                    {hasSelection && (
                      <Table.Td className={styles.checkTd}>
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => toggleRow(rowId, e.target.checked)}
                          aria-label={`Select row ${rowId}`}
                        />
                      </Table.Td>
                    )}
                    {columns.map((col) => {
                      const rawValue = getValueForColumn(row, col)
                      const content = col.cell
                        ? col.cell({ row, value: rawValue, rowId })
                        : col.accessorFn
                          ? (rawValue as ReactNode)
                          : (rawValue as ReactNode)
                      return <Table.Td key={col.id}>{content ?? null}</Table.Td>
                    })}
                  </Table.Row>
                )
              })
            )}
          </Table.Body>
        </Table>
      </div>

      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          <span className={styles.rowsPerPageLabel}>Rows per page</span>
          <Select
            options={pageSizeOptions}
            value={String(currentPageSize)}
            onValueChange={handlePageSizeChange}
            aria-label="Rows per page"
          />
          {hasSelection && selectedCount > 0 && (
            <span className={styles.selectedBadgeWrap}>
              <Badge variant="brand">{selectedCount} selected</Badge>
            </span>
          )}
        </div>
        <div className={styles.footerRight}>
          <Pagination
            page={clampedPageIndex + 1}
            total={totalPages}
            onChange={handlePageChange}
            siblingCount={1}
          />
        </div>
      </div>
    </div>
  )
}

export default DataTable
