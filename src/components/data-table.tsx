'use client'

import React from 'react'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  SortDescriptor,
  Spinner,
  Pagination,
  Input
} from '@nextui-org/react'

interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  sortDescriptor?: SortDescriptor
  onSortChange?: (descriptor: SortDescriptor) => void
  filterValue?: string
  onFilterChange?: (value: string) => void
  filterPlaceholder?: string
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  rowsPerPage?: number
  selectionMode?: 'none' | 'single' | 'multiple'
  selectedKeys?: Set<string>
  onSelectionChange?: (keys: Set<string>) => void
  emptyContent?: string
  loadingContent?: React.ReactNode
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  isLoading = false,
  sortDescriptor,
  onSortChange,
  filterValue,
  onFilterChange,
  filterPlaceholder = 'Search...',
  page = 1,
  totalPages = 1,
  onPageChange,
  rowsPerPage = 10,
  selectionMode = 'none',
  selectedKeys,
  onSelectionChange,
  emptyContent = 'No data found',
  loadingContent
}: DataTableProps<T>) {
  const topContent = React.useMemo(() => {
    if (!onFilterChange) return null

    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder={filterPlaceholder}
            value={filterValue}
            onClear={() => onFilterChange('')}
            onValueChange={onFilterChange}
            size="sm"
          />
        </div>
      </div>
    )
  }, [filterValue, filterPlaceholder, onFilterChange])

  const bottomContent = React.useMemo(() => {
    if (totalPages <= 1) return null

    return (
      <div className="flex w-full justify-center">
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={totalPages}
          onChange={onPageChange}
        />
      </div>
    )
  }, [page, totalPages, onPageChange])

  const renderCell = React.useCallback((item: T, columnKey: React.Key) => {
    const column = columns.find(col => col.key === columnKey)
    
    if (column?.render) {
      return column.render(item)
    }
    
    const cellValue = (item as any)[columnKey as string]
    
    return cellValue !== null && cellValue !== undefined ? String(cellValue) : '-'
  }, [columns])

  return (
    <Table
      aria-label="Data table with sorting and filtering"
      isHeaderSticky
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      classNames={{
        wrapper: 'max-h-[600px]',
      }}
      selectedKeys={selectedKeys}
      selectionMode={selectionMode}
      sortDescriptor={sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      onSelectionChange={(keys) => {
        if (onSelectionChange && keys !== 'all') {
          onSelectionChange(keys as Set<string>)
        }
      }}
      onSortChange={onSortChange}
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn
            key={column.key}
            allowsSorting={column.sortable}
          >
            {column.label}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        emptyContent={emptyContent}
        items={data}
        isLoading={isLoading}
        loadingContent={loadingContent || <Spinner />}
      >
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}