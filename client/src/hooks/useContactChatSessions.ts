import { useQuery } from '@tanstack/react-query';
import type { ChatSessionsPagination } from '@/types/chat.types';
import { chatsApi } from '@/api/chats';

export function useContactChatSessions(
  contactId: number,
  pagination: ChatSessionsPagination
) {
  return useQuery({
    queryKey: ['contactChatSessions', contactId, pagination],
    queryFn: () => chatsApi.getCustomerSessions(contactId, pagination),
    enabled: !!contactId,
  });
} 
