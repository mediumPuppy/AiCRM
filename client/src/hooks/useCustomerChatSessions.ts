import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { chatsApi } from '@/api/chats'
import type { 
  ChatSessionsPagination, 
  ChatSessionsResponse 
} from '@/types/chat.types'
import { useToast } from '@/hooks/use-toast'

export function useCustomerChatSessions(contactId: number, companyId: number) {
  const [pagination, setPagination] = useState<ChatSessionsPagination>({
    page: 1,
    limit: 10,
  })

  const { toast } = useToast()

  const { 
    data: sessions, 
    isLoading,
    refetch 
  } = useQuery<ChatSessionsResponse>({
    queryKey: ['customer-chat-sessions', contactId, pagination],
    queryFn: () => chatsApi.getCustomerSessions(contactId, {
      page: pagination.page,
      limit: pagination.limit,
    })
  })

  const startNewSession = async () => {
    try {
      const result = await chatsApi.startCustomerSession(contactId, companyId)
      await refetch()
      return result
    } catch (error) {
      console.error('Failed to start new chat session:', error)
      toast({
        title: 'Error',
        description: 'Failed to start new chat session. Please try again.',
        variant: 'destructive'
      })
      throw error
    }
  }

  return {
    sessions: sessions ?? { sessions: [], total: 0 },
    isLoading,
    pagination,
    setPagination,
    startNewSession,
    refreshSessions: refetch
  }
} 