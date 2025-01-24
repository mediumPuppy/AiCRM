import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useDebounce } from '@/hooks/useDebounce'
import type { ChatSessionFilters, ChatSessionStatus } from '@/types/chat.types'
import { DateRangePicker } from '../ui/date-range-picker'

interface ChatSessionsFiltersProps {
  filters: ChatSessionFilters
  onFiltersChange: (filters: ChatSessionFilters) => void
}

export function ChatSessionsFilters({
  filters,
  onFiltersChange,
}: ChatSessionsFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '')
  const debouncedSearch = useDebounce(searchTerm)

  // Update filters when debounced search changes
  useEffect(() => {
    onFiltersChange({ ...filters, search: debouncedSearch || undefined })
  }, [debouncedSearch])

  const handleStatusChange = (status: ChatSessionStatus | undefined) => {
    onFiltersChange({
      ...filters,
      status: status ? [status] : []
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          type="search"
          placeholder="Search chat sessions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-sm"
        />
        
        <div className="flex justify-between sm:justify-start gap-2">
          <Button
            variant={!filters.status?.length ? 'default' : 'outline'}
            onClick={() => handleStatusChange(undefined)}
          >
            All
          </Button>
          <Button
            variant={filters.status?.includes('active') ? 'default' : 'outline'}
            onClick={() => handleStatusChange('active')}
          >
            Active
          </Button>
          <Button
            variant={filters.status?.includes('closed') ? 'default' : 'outline'}
            onClick={() => handleStatusChange('closed')}
          >
            Closed
          </Button>
          <Button
            variant={filters.status?.includes('archived') ? 'default' : 'outline'}
            onClick={() => handleStatusChange('archived')}
          >
            Archived
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center gap-4">
        <DateRangePicker
          value={filters.dateRange || undefined}
          onChange={(dateRange) =>
            onFiltersChange({ ...filters, dateRange: dateRange || undefined })
          }
        />
      </div>
    </div>
  )
} 