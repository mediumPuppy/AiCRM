import { useCustomerChatSession } from '@/hooks/useCustomerChatSession'
import { CustomerChatMessages } from '../CustomerChatMessages'
import { CustomerChatInput } from '../CustomerChatInput'
import { Button } from '@/components/ui/button'
import { IconX } from '@tabler/icons-react'

interface CustomerChatSessionDetailProps {
  sessionId: number
  onClose: () => void
  onSessionUpdate?: () => void
}

export default function CustomerChatSessionDetail({ 
  sessionId,
  onClose,
  onSessionUpdate
}: CustomerChatSessionDetailProps) {
  const {
    session,
    messages,
    isLoading,
    sendMessage
  } = useCustomerChatSession(sessionId)

  if (!session?.started_at) return null

  if (isLoading) {
    return <div>Loading chat session...</div>
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-white rounded-lg shadow">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">Chat Session #{session?.id}</h2>
          <p className="text-sm text-gray-500">
            Started {new Date(session.started_at).toLocaleString()}
          </p>
        </div>
        <Button variant="ghost" onClick={onClose} className="xl:hidden">
          <IconX className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <CustomerChatMessages messages={messages ?? []} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <CustomerChatInput 
          onSendMessage={async (message) => {
            await sendMessage(message)
            onSessionUpdate?.()
          }}
          disabled={session?.status !== 'active'}
        />
      </div>
    </div>
  )
} 