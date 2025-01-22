import { Button } from '../ui/button'
import { IconX } from '@tabler/icons-react'
import type { Ticket } from '@/api/tickets'

interface TicketHeaderProps {
  ticket: Ticket
  onClose: () => void
}

export function TicketHeader({ ticket, onClose }: TicketHeaderProps) {
  return (
    <div className="border-b p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">Ticket #{ticket.id}</h1>
          </div>
          <p className="text-gray-500 mt-1">{ticket.subject}</p>
        </div>

        <Button variant="ghost" onClick={onClose}>
          <IconX className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
} 