import { useState } from 'react'
import { DateRangePicker } from '../ui/date-range-picker'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import type { ChatSessionFilters, ChatSessionStatus } from '@/types/chat.types'

interface ChatSessionsFiltersProps {
  filters: ChatSessionFilters
  onFiltersChange: (filters: ChatSessionFilters) => void
}

const STATUS_OPTIONS: ChatSessionStatus[] = ['active', 'closed', 'archived']

export function ChatSessionsFilters({
  filters,
  onFiltersChange,
}: ChatSessionsFiltersProps) {
  const [searchDebounceTimeout, setSearchDebounceTimeout] = useState<NodeJS.Timeout>()

  const handleSearchChange = (search: string) => {
    // Clear existing timeout
    if (searchDebounceTimeout) {
      clearTimeout(searchDebounceTimeout)
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      onFiltersChange({ ...filters, search })
    }, 500)

    setSearchDebounceTimeout(timeout)
  }

  const toggleStatus = (status: ChatSessionStatus) => {
    const currentStatuses = filters.status || []
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status]
    
    onFiltersChange({
      ...filters,
      status: newStatuses.length > 0 ? newStatuses : undefined
    })
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search chat sessions..."
            defaultValue={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((status) => (
          <Badge
            key={status}
            variant={filters.status?.includes(status) ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => toggleStatus(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        ))}
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center gap-4">
        <DateRangePicker
          value={filters.dateRange || undefined}
          onChange={(dateRange) =>
            onFiltersChange({ ...filters, dateRange })
          }
        />
      </div>
    </div>
  )
} 