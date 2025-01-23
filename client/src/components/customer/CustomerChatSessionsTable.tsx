import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { formatDate } from '@/utils/formatDate'
import type { ChatSession, ChatSessionsPagination } from '@/types/chat.types'
import { cn } from '@/lib/utils'

interface CustomerChatSessionsTableProps {
  sessions: {
    sessions: ChatSession[]
    total: number
  }
  isLoading: boolean
  pagination: ChatSessionsPagination
  onPaginationChange: (pagination: ChatSessionsPagination) => void
  onSessionSelect?: (sessionId: number) => void
  selectedSessionId?: number | null
}

export function CustomerChatSessionsTable({
  sessions,
  isLoading,
  pagination,
  onPaginationChange,
  onSessionSelect,
  selectedSessionId,
}: CustomerChatSessionsTableProps) {
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Last Message</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading sessions...
                </TableCell>
              </TableRow>
            ) : sessions.sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No chat sessions found
                </TableCell>
              </TableRow>
            ) : (
              sessions.sessions.map((session) => (
                <TableRow 
                  key={session.id}
                  className={cn(
                    'cursor-pointer hover:bg-muted/50',
                    selectedSessionId === session.id && 'bg-muted'
                  )}
                  onClick={() => onSessionSelect?.(session.id)}
                >
                  <TableCell>#{session.id}</TableCell>
                  <TableCell>
                    <Badge
                      variant={session.status === 'active' ? 'default' : 'secondary'}
                    >
                      {session.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{session.started_at ? formatDate(session.started_at, { format: 'table' }) : '-'}</TableCell>
                  <TableCell>{session.last_message_at ? formatDate(session.last_message_at, { format: 'table' }) : '-'}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
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
              onClick={() => onSessionSelect?.(session.id)}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">#{session.id}</span>
                <Badge
                  variant={session.status === 'active' ? 'default' : 'secondary'}
                >
                  {session.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div>Started: {session.started_at ? formatDate(session.started_at, { format: 'table' }) : '-'}</div>
                <div>Last Message: {session.last_message_at ? formatDate(session.last_message_at, { format: 'table' }) : '-'}</div>
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
    </>
  )
} 