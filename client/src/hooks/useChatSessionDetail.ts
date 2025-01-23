import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatsApi } from '@/api/chats'
import type { ChatSession, ChatMessage } from '@/types/chat.types'

export function useChatSessionDetail(sessionId: number) {
  const queryClient = useQueryClient()

  // Fetch session details
  const { 
    data: session,
    isLoading,
    error 
  } = useQuery<ChatSession>({
    queryKey: ['chat-session', sessionId],
    queryFn: () => chatsApi.getSession(sessionId),
    enabled: !!sessionId
  })

  // Fetch session messages
  const {
    data: messages,
    isLoading: isLoadingMessages,
    error: messagesError
  } = useQuery<ChatMessage[]>({
    queryKey: ['chat-session-messages', sessionId],
    queryFn: () => chatsApi.getSessionMessages(sessionId),
    enabled: !!sessionId,
    // Enable real-time updates for active sessions
    refetchInterval: session?.status === 'active' ? 3000 : false
  })

  // Update session status
  const updateStatus = useMutation({
    mutationFn: (status: ChatSession['status']) => 
      chatsApi.updateSession(sessionId, { status }),
    onSuccess: () => {
      // Invalidate both session and sessions list queries
      queryClient.invalidateQueries({ queryKey: ['chat-session', sessionId] })
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] })
    }
  })

  // Archive session
  const archiveSession = useMutation({
    mutationFn: () => 
      chatsApi.updateSession(sessionId, { 
        status: 'archived',
        ended_at: new Date().toISOString()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-session', sessionId] })
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] })
    }
  })

  return {
    session,
    isLoading,
    error,
    messages,
    isLoadingMessages,
    messagesError,
    updateStatus: updateStatus.mutate,
    archiveSession: archiveSession.mutate,
    isUpdating: updateStatus.isPending || archiveSession.isPending
  }
} 