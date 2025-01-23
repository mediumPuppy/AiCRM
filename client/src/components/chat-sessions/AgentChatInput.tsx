import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { IconSend } from '@tabler/icons-react'

interface AgentChatInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
}

export function AgentChatInput({ onSendMessage, disabled }: AgentChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1"
        disabled={disabled}
      />
      <Button 
        type="submit" 
        disabled={!message.trim() || disabled}
        className="self-end"
      >
        <IconSend className="h-4 w-4" />
      </Button>
    </form>
  )
} 