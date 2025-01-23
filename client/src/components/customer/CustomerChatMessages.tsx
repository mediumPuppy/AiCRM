import { Avatar } from '@/components/ui/avatar'
import { AvatarFallback } from '@/components/ui/avatar'
import { format } from 'date-fns'
import type { ChatMessage } from '@/types/chat.types'

interface CustomerChatMessagesProps {
  messages: ChatMessage[]
}

export function CustomerChatMessages({ messages }: CustomerChatMessagesProps) {
  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-4 ${
            message.sender_type === 'contact' ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          <Avatar className="flex-shrink-0 w-10 h-10">
            <AvatarFallback>
              {message.sender_type === 'agent' ? 'A' : 'C'}
            </AvatarFallback>
          </Avatar>
          
          <div
            className={`flex-1 rounded-lg p-4 border ${
              message.sender_type === 'contact'
                ? 'bg-white'
                : 'bg-gray-50'
            } ${
              message.sender_type === 'contact'
                ? 'ml-16'
                : 'mr-16'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">
                {message.sender_type === 'agent' ? 'Support Agent' : 'You'}
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
  )
} 