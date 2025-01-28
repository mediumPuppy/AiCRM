import { Badge } from '../ui/badge'
import type { Ticket } from '@/api/tickets'
import type { Contact } from '@/types/contact.types'
import type { User } from '@/types/user.types'

interface TicketMetadataProps {
  ticket: Ticket & {
    contact?: Contact | null;
    agent?: User | null;
  }
}

export function TicketMetadata({ ticket }: TicketMetadataProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    })
  }

  const tags = ticket.tags || []

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-4">
      <h3 className="font-medium mb-4">Ticket Details</h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-500">Created</label>
          <div>{formatDate(ticket.created_at)}</div>
        </div>

        <div>
          <label className="text-sm text-gray-500">Last Updated</label>
          <div>{formatDate(ticket.updated_at)}</div>
        </div>

        <div>
          <label className="text-sm text-gray-500">Tags</label>
          <div className="flex flex-wrap gap-1 mt-1">
            {tags.length > 0 ? (
              tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-gray-400">No tags</span>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-500">Company</label>
          <div>Company #{ticket.company_id}</div>
        </div>

        <div>
          <label className="text-sm text-gray-500">Contact</label>
          <div>
            {ticket.contact ? (
              <span>{ticket.contact.full_name}</span>
            ) : (
              <span className="text-gray-400">Contact #{ticket.contact_id}</span>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-500">Assigned To</label>
          <div>
            {ticket.agent ? (
              <span>{ticket.agent.full_name}</span>
            ) : ticket.assigned_to ? (
              <span className="text-gray-400">Agent #{ticket.assigned_to}</span>
            ) : (
              <span className="text-gray-400">Unassigned</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 