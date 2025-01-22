import { useQuery } from '@tanstack/react-query';
import { ticketsApi, ConversationItem } from '@/api/tickets';

export function useTicketConversation(ticketId: number) {
  const { 
    data: conversation,
    isLoading,
    error,
    refetch
  } = useQuery<ConversationItem[]>({
    queryKey: ['ticket-conversation', ticketId],
    queryFn: () => ticketsApi.getConversationHistory(ticketId),
    enabled: !!ticketId
  });

  return {
    conversation,
    isLoading,
    error,
    refetch
  };
} 