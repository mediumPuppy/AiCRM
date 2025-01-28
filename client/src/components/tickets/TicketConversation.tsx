import { useTicketConversation } from '@/hooks/useTicketConversation';
import { useTicketDetail } from '@/hooks/useTicketDetail';
import { useContactDetail } from '@/hooks/useContactDetail';
import { useUsersDetail } from '@/hooks/useUserDetail';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { format } from 'date-fns';
import { useMemo } from 'react';

interface TicketConversationProps {
  ticketId: number;
}

export function TicketConversation({ ticketId }: TicketConversationProps) {
  const { conversation, isLoading } = useTicketConversation(ticketId);
  const { ticket } = useTicketDetail(ticketId);
  const { data: contact } = useContactDetail(ticket?.contact_id || 0);
  
  // Filter and sort conversation items
  const conversationItems = conversation
    ?.filter(item => ['chat_message', 'email', 'sms'].includes(item.type))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || [];

  // Get unique agent IDs from conversation
  const agentIds = useMemo(() => {
    const ids = new Set<number>();
    conversationItems.forEach(item => {
      if (item.sender_type === 'agent' && item.sender_id) {
        ids.add(item.sender_id);
      }
    });
    return Array.from(ids);
  }, [conversationItems]);

  // Use the new useUsersDetail hook
  const agentDetails = useUsersDetail(agentIds);

  // Create a map of agent IDs to their data
  const agents = Object.fromEntries(
    agentIds.map((id, index) => [id, agentDetails[index].data])
  );

  if (isLoading || !ticket) {
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
      {conversationItems.map((item) => {
        const sender = item.sender_type === 'agent' ? agents[item.sender_id] : null;
        
        return (
          <div
          key={`${item.type}-${item.id}`}
          className={`flex gap-4 ${
            item.sender_type === 'agent' ? 'flex-row-reverse' : 'flex-row'
          }`}
          >
          <Avatar className="flex-shrink-0 w-10 h-10">
              <AvatarFallback>
                {item.sender_type === 'agent' 
                  ? (sender?.full_name?.[0] || 'A')
                  : (contact?.full_name?.[0] || 'C')}
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
                {item.sender_type === 'agent' 
                  ? (sender?.full_name || 'Agent')
                  : (contact?.full_name || 'Customer')}
              </span>
              <span className="text-sm text-gray-500">
                {format(new Date(item.created_at), 'HH:mm')}
              </span>
            </div>
            <p className="whitespace-pre-wrap">{item.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
} 