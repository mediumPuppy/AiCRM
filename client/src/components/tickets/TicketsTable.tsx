import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import type { Ticket } from '@/api/tickets'
import type { TicketsPagination } from '@/hooks/useTickets'
import { useModal } from '../providers/modal-provider'

interface TicketsTableProps {
  tickets: { tickets: Ticket[]; total: number }
  isLoading: boolean
  pagination: TicketsPagination
  onPaginationChange: (pagination: TicketsPagination) => void
}

export function TicketsTable({
  tickets,
  isLoading,
  pagination,
  onPaginationChange,
}: TicketsTableProps) {
  const { showTicketDetail } = useModal()

  const getStatusColor = (status: Ticket['status']) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      waiting: 'bg-purple-100 text-purple-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    }
    return colors[status]
  }

  const getPriorityColor = (priority: Ticket['priority']) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    }
    return colors[priority]
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                Loading tickets...
              </TableCell>
            </TableRow>
          ) : tickets.tickets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                No tickets found
              </TableCell>
            </TableRow>
          ) : (
            tickets.tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>#{ticket.id}</TableCell>
                <TableCell className="font-medium">{ticket.subject}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(ticket.status)}>
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(ticket.created_at)}</TableCell>
                <TableCell>{formatDate(ticket.updated_at)}</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => showTicketDetail(ticket.id)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-4 border-t">
        <div className="text-sm text-gray-500">
          Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
          {Math.min(pagination.page * pagination.limit, tickets.total)} of{' '}
          {tickets.total} tickets
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => onPaginationChange({
              ...pagination,
              page: pagination.page - 1
            })}
          >
            <IconChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page * pagination.limit >= tickets.total}
            onClick={() => onPaginationChange({
              ...pagination,
              page: pagination.page + 1
            })}
          >
            <IconChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 