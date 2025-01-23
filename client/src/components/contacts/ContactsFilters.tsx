import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { ContactFilters } from '@/hooks/useContacts'
import { useDebounce } from '@/hooks/useDebounce'

interface ContactsFiltersProps {
  filters: ContactFilters
  onFiltersChange: (filters: ContactFilters) => void
}

export function ContactsFilters({ filters, onFiltersChange }: ContactsFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '')
  const debouncedSearch = useDebounce(searchTerm)

  // Update filters when debounced search changes
  useEffect(() => {
    onFiltersChange({ ...filters, search: debouncedSearch })
  }, [debouncedSearch])

  return (
    <div className="space-y-4 sm:space-y-0">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          type="search"
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-sm"
        />
        
        <div className="flex justify-between sm:justify-start gap-2">
          <Button
            variant={!filters.status?.length ? 'default' : 'outline'}
            onClick={() => onFiltersChange({ ...filters, status: [] })}
          >
            All
          </Button>
          <Button
            variant={filters.status?.includes('active') ? 'default' : 'outline'}
            onClick={() => onFiltersChange({ ...filters, status: ['active'] })}
          >
            Active
          </Button>
          <Button
            variant={filters.status?.includes('archived') ? 'default' : 'outline'}
            onClick={() => onFiltersChange({ ...filters, status: ['archived'] })}
          >
            Archived
          </Button>
        </div>
      </div>
    </div>
  )
} 