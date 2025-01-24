import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Button } from '../ui/button'
import type { Ticket } from '@/api/tickets'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

interface TicketActionsProps {
  ticket: Ticket
  onStatusChange: (status: Ticket['status']) => void
  onPriorityChange: (priority: Ticket['priority']) => void
  onAssignToMe: () => void
  onUnassign: () => void
}

export function TicketActions({
  ticket,
  onStatusChange,
  onPriorityChange,
  onAssignToMe,
  onUnassign,
}: TicketActionsProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'waiting', label: 'Waiting' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
  ]

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ]

  const handleAssignToMe = async () => {
    try {
      await onAssignToMe()
      toast({
        title: 'Success',
        description: 'Ticket assigned to you successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign ticket',
        variant: 'destructive'
      })
    }
  }

  const handleUnassign = async () => {
    try {
      await onUnassign()
      toast({
        title: 'Success',
        description: 'Ticket unassigned successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to unassign ticket',
        variant: 'destructive'
      })
    }
  }

  const isAssignedToMe = ticket.assigned_to === user?.id

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="font-medium mb-4">Actions</h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-500">Status</label>
          <Select value={ticket.status} onValueChange={(value) => onStatusChange(value as Ticket['status'])}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm text-gray-500">Priority</label>
          <Select value={ticket.priority} onValueChange={(value) => onPriorityChange(value as Ticket['priority'])}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="pt-2 space-y-2">
          <Button 
            className="w-full"
            onClick={handleAssignToMe}
            disabled={isAssignedToMe}
          >
            {isAssignedToMe ? 'Assigned to You' : 'Assign to Me'}
          </Button>

          {isAssignedToMe && (
            <Button 
              variant="outline"
              className="w-full text-gray-600"
              onClick={handleUnassign}
            >
              Unassign from Me
            </Button>
          )}
        </div>
      </div>
    </div>
  )
} 