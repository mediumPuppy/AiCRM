import { Suspense } from 'react'
import { TicketsTable } from '../tickets/TicketsTable'
import { TicketsHeader } from '../tickets/TicketsHeader'
import { TicketsFilters } from '../tickets/TicketsFilters'
import { useTickets } from '@/hooks/useTickets'

export default function Tickets() {
  const {
    tickets,
    isLoading,
    filters,
    setFilters,
    pagination,
    setPagination,
  } = useTickets()

  return (
    <div className="space-y-6">
      <TicketsHeader />
      
      <TicketsFilters 
        filters={filters}
        onFiltersChange={setFilters}
      />
      
      <Suspense fallback={<div>Loading tickets...</div>}>
        <TicketsTable 
          tickets={tickets || { tickets: [], total: 0 }}
          isLoading={isLoading}
          pagination={pagination}
          onPaginationChange={setPagination}
        />
      </Suspense>
    </div>
  )
} 