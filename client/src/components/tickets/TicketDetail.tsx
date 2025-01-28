import { useState } from 'react'
import { useTicketDetail } from '@/hooks/useTicketDetail'
import { useTicketConversation } from '@/hooks/useTicketConversation'
import { useContactDetail } from '@/hooks/useContactDetail'
import { useUserDetail } from '@/hooks/useUserDetail'
import { TicketHeader } from './TicketHeader'
import { TicketMetadata } from './TicketMetadata'
import { TicketConversation } from './TicketConversation'
import { TicketNotes } from './TicketNotes'
import { TicketActions } from './TicketActions'
import type { Ticket } from '@/api/tickets'
import type { Contact } from '@/types/contact.types'
import type { User } from '@/types/user.types'

interface TicketDetailProps {
  ticketId: number
  onClose: () => void
  onTicketUpdate?: () => void
}

type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

type EnrichedTicket = Ticket & {
  contact?: Contact | null;
  agent?: User | null;
}

export function TicketDetail({ ticketId, onClose, onTicketUpdate }: TicketDetailProps) {
  const { ticket, isLoading, updateStatus, updatePriority, addNote, assignToMe, unassign } = useTicketDetail(ticketId)
  const { conversation } = useTicketConversation(ticketId)
  const { data: contact } = useContactDetail(ticket?.contact_id ?? 0)
  const { data: assignedAgent } = useUserDetail(ticket?.assigned_to ?? 0)
  const [activeTab, setActiveTab] = useState<'conversation' | 'notes'>('conversation')

  // Filter notes from conversation
  const notes = conversation?.filter(item => item.type === 'note') || []

  // Create wrapped update functions that trigger the parent refresh
  const handleStatusUpdate = async (status: TicketStatus) => {
    await updateStatus(status);
    onTicketUpdate?.();
  };

  const handlePriorityUpdate = async (priority: TicketPriority) => {
    await updatePriority(priority);
    onTicketUpdate?.();
  };

  const handleAssignToMe = async () => {
    await assignToMe();
    onTicketUpdate?.();
  };

  const handleUnassign = async () => {
    await unassign();
    onTicketUpdate?.();
  };

  if (isLoading) {
    return <div className="p-6">Loading ticket details...</div>
  }

  if (!ticket) {
    return <div className="p-6">Ticket not found</div>
  }

  // Enrich ticket with contact and agent info for child components
  const enrichedTicket: EnrichedTicket = {
    ...ticket,
    contact: contact || null,
    agent: assignedAgent || null
  }

  return (
    <div className="h-full bg-white flex flex-col">
      <TicketHeader 
        ticket={enrichedTicket} 
        onClose={onClose}
      />

      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 overflow-auto">
        {/* Main Column - Conversation & Notes */}
        <div className="flex-1 order-1 lg:order-1 min-w-0 max-w-3xl flex flex-col">
          <div className="flex justify-center mb-6">
            <div className="flex gap-2 p-1 bg-gray-100/80 rounded-lg w-fit">
              <button
                className={`h-9 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'conversation' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
                onClick={() => setActiveTab('conversation')}
              >
                Conversation
              </button>
              <button
                className={`h-9 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'notes' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
                onClick={() => setActiveTab('notes')}
              >
                Internal Notes
              </button>
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto flex-1">
            {activeTab === 'conversation' ? (
              <TicketConversation ticketId={ticketId} />
            ) : (
              <TicketNotes 
                notes={notes}
                onAddNote={addNote}
              />
            )}
          </div>
        </div>

        {/* Right Column - Actions & Metadata */}
        <div className="lg:w-72 order-2 lg:order-2 flex-shrink-0">
          <TicketActions 
            ticket={enrichedTicket}
            onStatusChange={handleStatusUpdate}
            onPriorityChange={handlePriorityUpdate}
            onAssignToMe={handleAssignToMe}
            onUnassign={handleUnassign}
          />
          <div className="mt-6">
            <TicketMetadata ticket={enrichedTicket} />
          </div>
        </div>
      </div>
    </div>
  )
} 