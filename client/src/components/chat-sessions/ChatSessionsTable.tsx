import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import type { ChatSession, ChatSessionsPagination } from '@/types/chat.types'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { formatDate } from '@/utils/formatDate'

interface ChatSessionsTableProps {
  sessions: {
    sessions: ChatSession[]
    total: number
  }
  isLoading: boolean
  pagination: ChatSessionsPagination
  onPaginationChange: (pagination: ChatSessionsPagination) => void
  onSessionSelect: (sessionId: number) => void
  selectedSessionId: number | null
}

export function ChatSessionsTable({
  sessions,
  isLoading,
  pagination,
  onPaginationChange,
  onSessionSelect,
  selectedSessionId,
}: ChatSessionsTableProps) {
  const getStatusColor = (status: ChatSession['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      case 'archived':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading sessions...
                </TableCell>
              </TableRow>
            ) : sessions.sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No chat sessions found
                </TableCell>
              </TableRow>
            ) : (
              sessions.sessions.map((session) => (
                <TableRow
                  key={session.id}
                  className={`transition-colors ${
                    selectedSessionId === session.id
                      ? 'bg-gray-50 border-l-2 border-l-primary'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <TableCell>#{session.id}</TableCell>
                  <TableCell className="font-medium">
                    {session.contact?.full_name || `Contact #${session.contact_id}`}
                  </TableCell>
                  <TableCell>
                    {session.agent?.full_name || 'Unassigned'}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(session.status)}>
                      {session.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDate(session.started_at, { format: 'table' })}
                  </TableCell>
                  <TableCell>
                    {session.ended_at
                      ? formatDate(session.ended_at, { format: 'table' })
                      : 'Ongoing'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSessionSelect(session.id)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y">
        {isLoading ? (
          <div className="p-4 text-center">Loading sessions...</div>
        ) : sessions.sessions.length === 0 ? (
          <div className="p-4 text-center">No chat sessions found</div>
        ) : (
          sessions.sessions.map((session) => (
            <div
              key={session.id}
              className={`p-4 space-y-3 cursor-pointer transition-colors ${
                selectedSessionId === session.id
                  ? 'bg-gray-50 ring-1 ring-primary ring-inset'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onSessionSelect(session.id)}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">#{session.id}</span>
                <Badge className={getStatusColor(session.status)}>
                  {session.status}
                </Badge>
              </div>

              <div className="font-medium">
                {session.contact?.full_name || `Contact #${session.contact_id}`}
              </div>

              <div className="text-sm text-gray-500">
                Agent: {session.agent?.full_name || 'Unassigned'}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div>Started: {formatDate(session.started_at, { format: 'table' })}</div>
                <div>
                  {session.ended_at
                    ? `Ended: ${formatDate(session.ended_at, { format: 'table' })}`
                    : 'Ongoing'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t">
        <div className="text-sm text-gray-500 text-center sm:text-left">
          Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
          {Math.min(pagination.page * pagination.limit, sessions.total)} of{' '}
          {sessions.total} sessions
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
            disabled={pagination.page * pagination.limit >= sessions.total}
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