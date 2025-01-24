import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { chatsApi } from '@/api/chats'
import { useToast } from '@/hooks/use-toast'
import type { 
  ChatSessionFilters, 
  ChatSessionsPagination, 
  ChatSessionsResponse 
} from '@/types/chat.types'
import { useAuth } from '../contexts/AuthContext'

export function useChatSessions() {
  const { user, contact } = useAuth()
  const companyId = user?.company_id || contact?.company_id
  if (!companyId) throw new Error('No company ID found in auth context')
  const { toast } = useToast()

  const [filters, setFilters] = useState<ChatSessionFilters>({})
  const [pagination, setPagination] = useState<ChatSessionsPagination>({
    page: 1,
    limit: 10,
  })

  const { 
    data: sessions, 
    isLoading, 
    refetch 
  } = useQuery<ChatSessionsResponse>({
    queryKey: ['chat-sessions', filters, pagination, companyId],
    queryFn: () => chatsApi.getCompanySessions(companyId, {
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
    })
  })

  const startNewSession = async (contactId: number) => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'No agent ID found in auth context',
        variant: 'destructive'
      })
      throw new Error('No agent ID found in auth context')
    }

    try {
      const result = await chatsApi.startAgentSession(companyId, contactId, user.id)
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
    filters,
    setFilters,
    pagination,
    setPagination,
    refreshSessions: refetch,
    startNewSession
  }
} 