import { useState } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { DateRangePicker } from '../ui/date-range-picker'
import { IconFilter, IconX } from '@tabler/icons-react'
import type { TicketFilters } from '@/hooks/useTickets'
import { DateRange } from "react-day-picker"

interface TicketsFiltersProps {
  filters: TicketFilters
  onFiltersChange: (filters: TicketFilters) => void
}

export function TicketsFilters({ filters, onFiltersChange }: TicketsFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'waiting', label: 'Waiting' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
  ]

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ]

  // Convert the dateRange to the format expected by DateRangePicker
  const dateRange: DateRange | undefined = filters.dateRange ? {
    from: filters.dateRange[0] || undefined,
    to: filters.dateRange[1] || undefined
  } : undefined

  const clearFilters = () => {
    onFiltersChange({})
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      {/* Basic Filters - Always Visible */}
      <div className="flex gap-4">
        <Input
          placeholder="Search tickets..."
          value={filters.search || ''}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="max-w-sm"
        />
        
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <IconFilter className="mr-2" />
          Advanced Filters
        </Button>

        {Object.keys(filters).length > 0 && (
          <Button
            variant="ghost"
            onClick={clearFilters}
          >
            <IconX className="mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Advanced Filters - Expandable */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
          <Select
            value={filters.status?.[0] ?? ''}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, status: [value] })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.priority?.[0] ?? ''} onValueChange={(value) => onFiltersChange({ ...filters, priority: [value] })}>
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DateRangePicker
            value={dateRange}
            onChange={(range) => onFiltersChange({ 
              ...filters, 
              dateRange: range ? [range.from || null, range.to || null] : undefined 
            })}
            placeholder="Select date range"
          />
        </div>
      )}

      {/* Active Filters Display */}
      {Object.keys(filters).length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {filters.status?.map((status) => (
            <Badge key={status} variant="secondary" className="px-2 py-1">
              Status: {status}
              <button
                className="ml-2"
                onClick={() => {
                  const newStatus = filters.status?.filter(s => s !== status)
                  onFiltersChange({ ...filters, status: newStatus })
                }}
              >
                ×
              </button>
            </Badge>
          ))}
          {/* Similar badges for other active filters */}
        </div>
      )}
    </div>
  )
} 