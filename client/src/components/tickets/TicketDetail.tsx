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
import { getAgentRecommendation, evaluateRecommendation } from '@/api/agent'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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

interface AxiosError {
  response?: {
    data: any;
    status: number;
    headers: any;
  };
}

export function TicketDetail({ ticketId, onClose, onTicketUpdate }: TicketDetailProps) {
  const { ticket, isLoading, updateStatus, updatePriority, addNote, assignToMe, unassign } = useTicketDetail(ticketId)
  const { conversation } = useTicketConversation(ticketId)
  const { data: contact } = useContactDetail(ticket?.contact_id ?? 0)
  const { data: assignedAgent } = useUserDetail(ticket?.assigned_to ?? 0)
  const [activeTab, setActiveTab] = useState<'conversation' | 'notes'>('conversation')
  const [recommendation, setRecommendation] = useState<string | null>(null)
  const [metricId, setMetricId] = useState<number | null>(null)
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false)

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

  const handleGetRecommendation = async () => {
    try {
      setIsLoadingRecommendation(true)
      console.log('Getting recommendation for ticket:', ticketId)
      const result = await getAgentRecommendation(ticketId)
      console.log('Got recommendation result:', result)
      setRecommendation(result)
    } catch (error) {
      console.error('Failed to get recommendation:', error)
      if (error instanceof Error) {
        const axiosError = error as AxiosError
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          response: axiosError.response
        })
      }
    } finally {
      setIsLoadingRecommendation(false)
    }
  }

  const handleEvaluateRecommendation = async (success: boolean) => {
    if (!metricId) return
    try {
      await evaluateRecommendation(metricId, success)
      // Optionally clear the recommendation after evaluation
      setRecommendation(null)
      setMetricId(null)
    } catch (error) {
      console.error('Failed to evaluate recommendation:', error)
    }
  }

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

      {/* Agent Recommendation Section */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>AI Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          {!recommendation ? (
            <Button 
              onClick={handleGetRecommendation}
              disabled={isLoadingRecommendation}
            >
              {isLoadingRecommendation ? 'Getting Recommendation...' : 'Get Action Recommendation'}
            </Button>
          ) : (
            <div className="space-y-4">
              <p className="text-lg">{recommendation}</p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleEvaluateRecommendation(true)}
                >
                  👍 This was helpful
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleEvaluateRecommendation(false)}
                >
                  👎 Not helpful
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 