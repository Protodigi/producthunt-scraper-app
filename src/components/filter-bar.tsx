'use client'

import React from 'react'
import {
  Card,
  CardBody,
  DateRangePicker,
  Select,
  SelectItem,
  Button,
  Chip
} from '@nextui-org/react'
import { DateValue } from '@react-types/calendar'
import { RangeValue } from '@react-types/shared'

export interface FilterOptions {
  dateRange?: RangeValue<DateValue>
  workflow?: string
  status?: string
}

interface Workflow {
  id: string
  name: string
}

interface FilterBarProps {
  workflows: Workflow[]
  statusOptions?: { value: string; label: string }[]
  filters: FilterOptions
  onFilterChange: (filters: FilterOptions) => void
  onClearFilters?: () => void
  isLoading?: boolean
}

export function FilterBar({
  workflows,
  statusOptions = [],
  filters,
  onFilterChange,
  onClearFilters,
  isLoading = false
}: FilterBarProps) {
  const activeFilterCount = React.useMemo(() => {
    let count = 0
    if (filters.dateRange) count++
    if (filters.workflow) count++
    if (filters.status) count++
    return count
  }, [filters])

  const handleDateRangeChange = (value: RangeValue<DateValue> | null) => {
    onFilterChange({
      ...filters,
      dateRange: value || undefined
    })
  }

  const handleWorkflowChange = (value: string) => {
    onFilterChange({
      ...filters,
      workflow: value || undefined
    })
  }

  const handleStatusChange = (value: string) => {
    onFilterChange({
      ...filters,
      status: value || undefined
    })
  }

  const handleClearAll = () => {
    if (onClearFilters) {
      onClearFilters()
    } else {
      onFilterChange({})
    }
  }

  return (
    <Card className="w-full">
      <CardBody>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Filters</h3>
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-2">
                <Chip size="sm" variant="flat">
                  {activeFilterCount} active
                </Chip>
                <Button
                  size="sm"
                  variant="light"
                  onPress={handleClearAll}
                  isDisabled={isLoading}
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DateRangePicker
              label="Date range"
              value={filters.dateRange}
              onChange={handleDateRangeChange}
              isDisabled={isLoading}
              classNames={{
                base: 'w-full'
              }}
            />
            
            <Select
              label="Workflow"
              placeholder="Select workflow"
              selectedKeys={filters.workflow ? [filters.workflow] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string
                handleWorkflowChange(selected)
              }}
              isDisabled={isLoading}
            >
              {workflows.map((workflow) => (
                <SelectItem key={workflow.id} value={workflow.id}>
                  {workflow.name}
                </SelectItem>
              ))}
            </Select>
            
            {statusOptions.length > 0 && (
              <Select
                label="Status"
                placeholder="Select status"
                selectedKeys={filters.status ? [filters.status] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string
                  handleStatusChange(selected)
                }}
                isDisabled={isLoading}
              >
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
            )}
          </div>
          
          {/* Responsive filter tags */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {filters.dateRange && (
                <Chip
                  size="sm"
                  onClose={() => handleDateRangeChange(null)}
                  variant="flat"
                >
                  Date range selected
                </Chip>
              )}
              {filters.workflow && (
                <Chip
                  size="sm"
                  onClose={() => handleWorkflowChange('')}
                  variant="flat"
                >
                  Workflow: {workflows.find(w => w.id === filters.workflow)?.name}
                </Chip>
              )}
              {filters.status && (
                <Chip
                  size="sm"
                  onClose={() => handleStatusChange('')}
                  variant="flat"
                >
                  Status: {statusOptions.find(s => s.value === filters.status)?.label}
                </Chip>
              )}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  )
}