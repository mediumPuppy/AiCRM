import { Button } from '../ui/button'
import { IconPlus } from '@tabler/icons-react'

export function TicketsHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Tickets</h1>
        <p className="text-muted-foreground">Manage and respond to customer support tickets</p>
      </div>
      
      <Button>
        <IconPlus className="mr-2" />
        New Ticket
      </Button>
    </div>
  )
} 