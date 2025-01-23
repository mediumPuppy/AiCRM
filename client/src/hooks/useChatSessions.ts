import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { chatsApi } from '@/api/chats'
import type { 
  ChatSessionFilters, 
  ChatSessionsPagination, 
  ChatSessionsResponse 
} from '@/types/chat.types'

export function useChatSessions() {
  const companyId = 1 // TODO: Get from context/store

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

  return {
    sessions: sessions ?? { sessions: [], total: 0 },
    isLoading,
    filters,
    setFilters,
    pagination,
    setPagination,
    refreshSessions: refetch
  }
} 