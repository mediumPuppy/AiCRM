import { useChatSessionDetail } from '@/hooks/useChatSessionDetail'
import { formatDistanceToNow, format } from 'date-fns'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Avatar } from '../ui/avatar'
import { AvatarFallback } from '../ui/avatar'
import { IconX, IconMessage, IconSettings } from '@tabler/icons-react'
import type { ChatSession } from '@/types/chat.types'
import { AgentChatInput } from './AgentChatInput'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface ChatSessionDetailProps {
  sessionId: number
  onClose: () => void
  onSessionUpdate?: () => void
}

export function ChatSessionDetail({ 
  sessionId, 
  onClose,
  onSessionUpdate 
}: ChatSessionDetailProps) {
  const { user } = useAuth()
  const [showDetails, setShowDetails] = useState(false)
  const {
    session,
    isLoading,
    updateStatus,
    messages,
    isLoadingMessages,
    sendMessage,
    assignToMe
  } = useChatSessionDetail(sessionId)

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-pulse">Loading chat session details...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-red-500">Chat session not found</div>
      </div>
    )
  }

  const handleAssignToMe = async () => {
    if (!user?.id) return
    await assignToMe()
    onSessionUpdate?.()
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b">
        <div className="flex items-center min-w-0">
          <h2 className="text-lg font-medium truncate">Session #{session.id}</h2>
          <Badge 
            variant={session.status === 'active' ? 'default' : 'secondary'} 
            className="ml-2"
          >
            {session.status}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowDetails(!showDetails)}
            className="lg:hidden"
            aria-label={showDetails ? "Show chat" : "Show details"}
          >
            {showDetails ? (
              <IconMessage className="h-4 w-4" />
            ) : (
              <IconSettings className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close panel">
            <IconX className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-0 flex">
        {/* Messages and Input Area */}
        <div className={`flex-1 min-w-0 flex flex-col ${showDetails ? 'hidden lg:flex' : 'flex'}`}>
          {/* Conversation area */}
          <div className="flex-1 overflow-y-auto">
            {isLoadingMessages ? (
              <div className="text-center py-8 text-gray-500">Loading messages...</div>
            ) : messages?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No messages in this session</div>
            ) : (
              <div className="h-full overflow-y-auto flex flex-col-reverse p-4">
                <div className="space-y-6">
                  {messages?.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-4 ${
                        message.sender_type === 'agent' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <Avatar className="flex-shrink-0 w-10 h-10">
                        <AvatarFallback>
                          {message.sender_type === 'agent' ? 'A' : 'C'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div
                        className={`flex-1 rounded-lg p-4 border ${
                          message.sender_type === 'agent'
                            ? 'bg-white'
                            : 'bg-gray-50'
                        } ${
                          message.sender_type === 'agent'
                            ? 'ml-16'
                            : 'mr-16'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">
                            {message.sender_type === 'agent' ? 'Agent' : 'Customer'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {format(new Date(message.created_at), 'HH:mm')}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap">{message.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t">
            <AgentChatInput
              onSendMessage={sendMessage}
              disabled={session.status !== 'active'}
              contactId={session.contact?.id}
              customerName={session.contact?.full_name}
              agentName={user?.full_name}
            />
          </div>
        </div>

        {/* Right sidebar - Details */}
        <div className={`w-full lg:w-80 border-l overflow-y-auto ${showDetails ? 'block' : 'hidden lg:block'}`}>
          <div className="p-4 space-y-6">
            {/* Timing Information */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div>
                <label className="text-sm text-gray-500">Started</label>
                <div className="mt-1 text-sm">
                  {formatDistanceToNow(new Date(session.started_at), { addSuffix: true })}
                </div>
              </div>

              {session.ended_at && (
                <div>
                  <label className="text-sm text-gray-500">Ended</label>
                  <div className="mt-1 text-sm">
                    {formatDistanceToNow(new Date(session.ended_at), { addSuffix: true })}
                  </div>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-sm font-medium mb-2">Contact Information</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  {session.contact?.full_name || 'Anonymous User'}
                  {session.contact?.email && (
                    <span className="block mt-1 text-gray-500">{session.contact.email}</span>
                  )}
                </p>
              </div>
            </div>

            {/* Agent Information */}
            <div>
              <h3 className="text-sm font-medium mb-2">Agent Information</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  {session.agent?.full_name || 'Unassigned'}
                </p>
              </div>
            </div>

            {/* Assignment Actions */}
            <div>
              <div className="flex flex-col gap-2">
                {!session.agent_id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAssignToMe}
                    className="w-full"
                  >
                    Assign to Me
                  </Button>
                )}
                {session.agent_id === user?.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatus('closed')}
                    className="w-full"
                  >
                    Unassign
                  </Button>
                )}
              </div>
            </div>

            {/* Session Status */}
            <div>
              <h3 className="text-sm font-medium mb-2">Session Status</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex flex-col gap-2">
                  {['active', 'closed', 'archived'].map((status) => (
                    <Button
                      key={status}
                      variant={session.status === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        updateStatus(status as ChatSession['status'])
                        onSessionUpdate?.()
                      }}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {session.metadata && Object.keys(session.metadata).length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Additional Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm whitespace-pre-wrap break-words">
                    {JSON.stringify(session.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 