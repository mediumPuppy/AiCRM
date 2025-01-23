import { useTicketConversation } from '@/hooks/useTicketConversation';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Progress } from '../ui/progress';

interface TicketConversationProps {
  ticketId: number;
}

export function TicketConversation({ ticketId }: TicketConversationProps) {
  const { conversation, isLoading } = useTicketConversation(ticketId);
  
  // Filter and sort conversation items
  const conversationItems = conversation
    ?.filter(item => ['chat_message', 'email', 'sms'].includes(item.type))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || [];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <Progress value={33} className="w-[60%]" />
        <span className="text-sm text-muted-foreground">Loading conversation...</span>
      </div>
    );
  }

  if (!conversationItems || conversationItems.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No conversation history available
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-0">
      {conversationItems.map((item) => (
        <div
          key={`${item.type}-${item.id}`}
          className={`flex gap-4 ${
            item.sender_type === 'agent' ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          <Avatar className="flex-shrink-0 w-10 h-10">
            <AvatarFallback>
              {item.sender_type[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div
            className={`flex-1 rounded-lg p-4 border ${
              item.sender_type === 'agent'
                ? 'bg-white'
                : 'bg-gray-50'
            } ${
              item.sender_type === 'agent'
                ? 'ml-16'
                : 'mr-16'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">
                {item.sender_type === 'agent' ? 'Agent' : 'Customer'} #{item.sender_id}
              </span>
              <span className="text-sm text-gray-500">
                {formatDate(item.created_at)}
              </span>
            </div>
            <p className="whitespace-pre-wrap">{item.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
} 