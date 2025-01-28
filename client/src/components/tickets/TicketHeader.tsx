import { Button } from '../ui/button'
import { IconX } from '@tabler/icons-react'
import type { Ticket } from '@/api/tickets'
import type { Contact } from '@/types/contact.types'
import type { User } from '@/types/user.types'
import { Badge } from '../ui/badge'

interface TicketHeaderProps {
  ticket: Ticket & {
    contact?: Contact | null;
    agent?: User | null;
  }
  onClose: () => void
}

export function TicketHeader({ ticket, onClose }: TicketHeaderProps) {
  return (
    <div className="border-b p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">Ticket #{ticket.id}</h1>
            <Badge variant="outline" className="text-sm">
              {ticket.status}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {ticket.priority}
            </Badge>
          </div>
          <p className="text-gray-500 mt-1">{ticket.subject}</p>
          <div className="text-sm text-gray-500 mt-2">
            {ticket.contact ? (
              <span>From: {ticket.contact.full_name}</span>
            ) : (
              <span>From: Contact #{ticket.contact_id}</span>
            )}
            {ticket.agent && (
              <>
                <span className="mx-2">•</span>
                <span>Assigned to: {ticket.agent.full_name}</span>
              </>
            )}
          </div>
        </div>

        <Button variant="ghost" onClick={onClose}>
          <IconX className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
} 