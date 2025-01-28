import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { IconSend, IconRobot } from '@tabler/icons-react'
import { GenerateMessageDialog } from './GenerateMessageDialog'

interface AgentChatInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
  contactId?: number
  customerName?: string
  agentName?: string
}

export function AgentChatInput({ onSendMessage, disabled, contactId, customerName, agentName }: AgentChatInputProps) {
  const [message, setMessage] = useState('')
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleGeneratedMessage = (generatedMessage: string) => {
    setMessage(generatedMessage)
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 flex gap-2">
          {contactId && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowGenerateDialog(true)}
              disabled={disabled}
              className="flex-shrink-0"
            >
              <IconRobot className="h-4 w-4" />
            </Button>
          )}
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`${agentName || 'Agent'} → ${customerName || 'Customer'}...`}
            className="flex-1"
            disabled={disabled}
          />
        </div>
        <Button 
          type="submit" 
          disabled={!message.trim() || disabled}
          className="self-end"
        >
          <IconSend className="h-4 w-4" />
        </Button>
      </form>

      {contactId && (
        <GenerateMessageDialog
          open={showGenerateDialog}
          onClose={() => setShowGenerateDialog(false)}
          onMessageSelect={handleGeneratedMessage}
          contactId={contactId}
          agentName={agentName}
        />
      )}
    </>
  )
} 