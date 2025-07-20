'use client'

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Spinner,
  getKeyValue,
  SortDescriptor,
  Selection,
  Input,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  User,
} from '@nextui-org/react'
import { useCallback, useMemo, useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid'

export interface Column<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  emptyMessage?: string
  searchable?: boolean
  searchPlaceholder?: string
  onRowAction?: (item: T) => void
  selectionMode?: 'none' | 'single' | 'multiple'
  onSelectionChange?: (keys: Selection) => void
  actions?: Array<{
    key: string
    label: string
    onClick: (selectedItems: T[]) => void
    color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  }>
  rowsPerPage?: number
  renderCell?: (item: T, columnKey: string) => React.ReactNode
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  searchable = true,
  searchPlaceholder = 'Search...',
  onRowAction,
  selectionMode = 'none',
  onSelectionChange,
  actions = [],
  rowsPerPage = 10,
  renderCell,
}: DataTableProps<T>) {
  const [filterValue, setFilterValue] = useState('')
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]))
  const [page, setPage] = useState(1)
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: columns[0]?.key as string,
    direction: 'ascending',
  })

  const hasSearchFilter = Boolean(filterValue)

  const filteredItems = useMemo(() => {
    let filteredData = [...data]

    if (hasSearchFilter) {
      filteredData = filteredData.filter((item) =>
        columns.some((column) => {
          const value = getKeyValue(item, column.key)
          return value?.toString().toLowerCase().includes(filterValue.toLowerCase())
        })
      )
    }

    return filteredData
  }, [data, filterValue, hasSearchFilter, columns])

  const pages = Math.ceil(filteredItems.length / rowsPerPage)

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage

    return filteredItems.slice(start, end)
  }, [page, filteredItems, rowsPerPage])

  const sortedItems = useMemo(() => {
    return [...items].sort((a: T, b: T) => {
      const first = a[sortDescriptor.column as keyof T]
      const second = b[sortDescriptor.column as keyof T]
      const cmp = first < second ? -1 : first > second ? 1 : 0

      return sortDescriptor.direction === 'descending' ? -cmp : cmp
    })
  }, [sortDescriptor, items])

  const selectedItems = useMemo(() => {
    if (selectedKeys === 'all') return data
    return data.filter((item) => (selectedKeys as Set<string>).has(item.id))
  }, [selectedKeys, data])

  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterValue(value)
      setPage(1)
    } else {
      setFilterValue('')
    }
  }, [])

  const onClear = useCallback(() => {
    setFilterValue('')
    setPage(1)
  }, [])

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          {searchable && (
            <Input
              isClearable
              className="w-full sm:max-w-[44%]"
              placeholder={searchPlaceholder}
              startContent={<MagnifyingGlassIcon className="h-4 w-4" />}
              value={filterValue}
              onClear={() => onClear()}
              onValueChange={onSearchChange}
            />
          )}
          <div className="flex gap-3">
            {selectionMode !== 'none' && selectedItems.length > 0 && actions.length > 0 && (
              <Dropdown>
                <DropdownTrigger>
                  <Button 
                    endContent={<ChevronDownIcon className="h-4 w-4" />} 
                    variant="flat"
                  >
                    Actions
                  </Button>
                </DropdownTrigger>
                <DropdownMenu 
                  aria-label="Actions"
                  onAction={(key) => {
                    const action = actions.find((a) => a.key === key)
                    if (action) {
                      action.onClick(selectedItems)
                    }
                  }}
                >
                  {actions.map((action) => (
                    <DropdownItem
                      key={action.key}
                      color={action.color}
                    >
                      {action.label}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            )}
          </div>
        </div>
        {selectionMode !== 'none' && selectedItems.length > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-default-400 text-small">
              {selectedItems.length} of {filteredItems.length} selected
            </span>
          </div>
        )}
      </div>
    )
  }, [
    filterValue,
    searchPlaceholder,
    onSearchChange,
    onClear,
    searchable,
    selectionMode,
    selectedItems,
    actions,
    filteredItems.length,
  ])

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === 'all'
            ? 'All items selected'
            : `${selectedKeys.size} of ${filteredItems.length} selected`}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <span className="text-small text-default-400">
            {`${(page - 1) * rowsPerPage + 1}-${Math.min(
              page * rowsPerPage,
              filteredItems.length
            )} of ${filteredItems.length}`}
          </span>
        </div>
      </div>
    )
  }, [selectedKeys, page, pages, filteredItems.length, rowsPerPage])

  const defaultRenderCell = useCallback((item: T, columnKey: string) => {
    const column = columns.find((col) => col.key === columnKey)
    if (column?.render) {
      return column.render(item)
    }
    return getKeyValue(item, columnKey)
  }, [columns])

  return (
    <Table
      aria-label="Data table"
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
        setSelectedKeys(keys)
        onSelectionChange?.(keys)
      }}
      onSortChange={setSortDescriptor}
      onRowAction={onRowAction}
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn
            key={column.key}
            align={column.key === 'actions' ? 'center' : 'start'}
            allowsSorting={column.sortable}
          >
            {column.label}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        emptyContent={loading ? <Spinner /> : emptyMessage}
        items={sortedItems}
        loadingContent={<Spinner />}
        loadingState={loading ? 'loading' : 'idle'}
      >
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => (
              <TableCell>
                {renderCell ? renderCell(item, columnKey as string) : defaultRenderCell(item, columnKey as string)}
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}