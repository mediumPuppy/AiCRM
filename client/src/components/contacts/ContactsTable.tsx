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
import { formatDate } from '@/utils/formatDate'
import { Contact } from '@/types/contact.types'

interface ContactsTableProps {
  contacts: { contacts: Contact[]; total: number }
  isLoading: boolean
  pagination: {
    page: number
    perPage: number
  }
  onPaginationChange: (pagination: { page: number; perPage: number }) => void
  onContactSelect: (contactId: number) => void
  selectedContactId: number | null
}

export function ContactsTable({
  contacts: { contacts, total },
  isLoading,
  pagination,
  onPaginationChange,
  onContactSelect,
  selectedContactId,
}: ContactsTableProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading contacts...
                </TableCell>
              </TableRow>
            ) : contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No contacts found
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((contact) => (
                <TableRow 
                  key={contact.id}
                  className={`transition-colors ${
                    selectedContactId === contact.id 
                      ? 'bg-gray-50 border-l-2 border-l-primary' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <TableCell className="font-medium">{contact.full_name}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>
                    <Badge variant={contact.status === 'active' ? 'default' : 'secondary'}>
                      {contact.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(contact.created_at, { format: 'table' })}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onContactSelect(contact.id)}
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
          <div className="p-4 space-y-3 text-center text-sm text-gray-500">
            Loading contacts...
          </div>
        ) : contacts.length === 0 ? (
          <div className="p-4 space-y-3 text-center text-sm text-gray-500">
            No contacts found
          </div>
        ) : (
          contacts.map((contact) => (
            <div 
              key={contact.id} 
              className={`p-4 space-y-3 cursor-pointer transition-colors ${
                selectedContactId === contact.id
                  ? 'bg-gray-50 ring-1 ring-primary ring-inset'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onContactSelect(contact.id)}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{contact.full_name}</span>
                <div className="flex gap-2">
                  <Badge variant={contact.status === 'active' ? 'default' : 'secondary'}>
                    {contact.status}
                  </Badge>
                </div>
              </div>
              
              <div className="font-medium">{contact.email}</div>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div>Created: {formatDate(contact.created_at, { format: 'table' })}</div>
                <div>Updated: {formatDate(contact.created_at, { format: 'table' })}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t">
        <div className="text-sm text-gray-500 text-center sm:text-left">
          Showing {((pagination.page - 1) * pagination.perPage) + 1} to{' '}
          {Math.min(pagination.page * pagination.perPage, total)} of {total} contacts
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
            disabled={pagination.page * pagination.perPage >= total}
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