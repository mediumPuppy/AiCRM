import { useTicketConversation } from '@/hooks/useTicketConversation';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Progress } from '../ui/progress';

interface TicketConversationProps {
  ticketId: number;
}

export function TicketConversation({ ticketId }: TicketConversationProps) {
  const { conversation, isLoading } = useTicketConversation(ticketId);

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

  if (!conversation || conversation.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No conversation history available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {conversation.map((item) => (
        <div
          key={`${item.type}-${item.id}`}
          className={`flex gap-4 ${
            item.sender_type === 'agent' ? 'flex-row' : 'flex-row-reverse'
          }`}
        >
          <Avatar className="flex-shrink-0">
            <AvatarFallback>
              {item.sender_type[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div
            className={`flex-1 rounded-lg p-4 ${
              item.sender_type === 'agent'
                ? 'bg-white border'
                : 'bg-primary/10'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">
                {item.type === 'note' ? 'Internal Note' : item.sender_type === 'agent' ? 'Agent' : 'Customer'} #{item.sender_id}
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