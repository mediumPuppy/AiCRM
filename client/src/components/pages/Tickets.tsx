import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TicketsTable } from '../tickets/TicketsTable'
import { TicketsFilters } from '../tickets/TicketsFilters'
import { useTickets } from '@/hooks/useTickets'
import { TicketDetail } from '../tickets/TicketDetail'
import { TablePageHeader } from '../ui/table-page-header'
import { TicketCreate } from '../tickets/TicketCreate'

export default function Tickets() {
  const [searchParams] = useSearchParams()
  const {
    tickets,
    isLoading,
    filters,
    setFilters,
    pagination,
    setPagination,
    refreshTickets,
  } = useTickets()
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null)
  const [isCreatingTicket, setIsCreatingTicket] = useState(false)

  // Handle URL parameters for panels
  useEffect(() => {
    const action = searchParams.get('action')
    const panel = searchParams.get('panel')
    
    if (action === 'create' && panel === 'new') {
      setIsCreatingTicket(true)
    }
  }, [searchParams])

  return (
    <div className="flex h-full">
      {/* Main Content - Tickets List */}
      <div className={`flex-1 min-w-0 overflow-auto p-4 lg:p-6 ${
        selectedTicketId ? 'hidden xl:block' : 'block'
      }`}>
        {/* Mobile & Desktop Header combined */}
        <TablePageHeader
          title="Tickets"
          buttonLabel="New Ticket"
          onAction={() => setIsCreatingTicket(true)}
        />
        
        <TicketsFilters 
          filters={filters}
          onFiltersChange={setFilters}
        />
        
        <div className="mt-4">
          <Suspense fallback={<div>Loading tickets...</div>}>
            <TicketsTable 
              tickets={tickets || { tickets: [], total: 0 }}
              isLoading={isLoading}
              pagination={pagination}
              onPaginationChange={setPagination}
              onTicketSelect={setSelectedTicketId}
              selectedTicketId={selectedTicketId}
            />
          </Suspense>
        </div>
      </div>

      {/* Right Side Panel - Ticket Details */}
      <div className={`
        hidden xl:block w-[750px] border-l border-gray-200
        ${selectedTicketId ? '' : 'bg-gray-50'}
      `}>
        {selectedTicketId ? (
          <TicketDetail 
            ticketId={selectedTicketId} 
            onClose={() => setSelectedTicketId(null)}
            onTicketUpdate={refreshTickets}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">No Ticket Selected</h3>
              <p>Click on a ticket to view its details here</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal for smaller screens */}
      {selectedTicketId && (
        <div className={`
          fixed inset-0 z-50 xl:hidden
          bg-white
        `}>
          <TicketDetail 
            ticketId={selectedTicketId} 
            onClose={() => setSelectedTicketId(null)}
            onTicketUpdate={refreshTickets}
          />
        </div>
      )}

      {isCreatingTicket && (
        <div className="fixed inset-0 z-50 bg-white overflow-auto">
          <TicketCreate 
            onClose={() => setIsCreatingTicket(false)}
            onTicketCreated={() => {
              refreshTickets()
              setIsCreatingTicket(false)
            }}
          />
        </div>
      )}
    </div>
  )
} 