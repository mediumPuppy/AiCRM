import { useState } from 'react'
import { useTicketDetail } from '@/hooks/useTicketDetail'
import { TicketHeader } from './TicketHeader'
import { TicketMetadata } from './TicketMetadata'
import { TicketConversation } from './TicketConversation'
import { TicketNotes } from './TicketNotes'
import { TicketActions } from './TicketActions'

interface TicketDetailProps {
  ticketId: number
  onClose: () => void
}

export function TicketDetail({ ticketId, onClose }: TicketDetailProps) {
  const { ticket, isLoading, updateStatus, updatePriority, addNote } = useTicketDetail(ticketId)
  const [activeTab, setActiveTab] = useState<'conversation' | 'notes'>('conversation')

  if (isLoading) {
    return <div className="p-6">Loading ticket details...</div>
  }

  if (!ticket) {
    return <div className="p-6">Ticket not found</div>
  }

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full">
        <TicketHeader 
          ticket={ticket} 
          onClose={onClose}
        />

        <div className="flex-1 flex gap-4 p-6 overflow-auto">
          {/* Left Column - Conversation & Notes */}
          <div className="flex-1">
            <div className="flex gap-2 mb-4">
              <button
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'conversation' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100'
                }`}
                onClick={() => setActiveTab('conversation')}
              >
                Conversation
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'notes' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100'
                }`}
                onClick={() => setActiveTab('notes')}
              >
                Internal Notes
              </button>
            </div>

            {activeTab === 'conversation' ? (
              <TicketConversation ticketId={ticketId} />
            ) : (
              <TicketNotes 
                notes={ticket.internal_notes}
                onAddNote={addNote}
              />
            )}
          </div>

          {/* Right Column - Metadata & Actions */}
          <div className="w-80">
            <TicketMetadata ticket={ticket} />
            <TicketActions 
              ticket={ticket}
              onStatusChange={updateStatus}
              onPriorityChange={updatePriority}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 