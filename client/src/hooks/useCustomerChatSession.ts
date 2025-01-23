import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatsApi } from '@/api/chats'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { RealtimePostgresInsertPayload } from '@supabase/supabase-js'

export function useCustomerChatSession(sessionId: number) {
  const queryClient = useQueryClient()

  // Fetch session details
  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ['customer-chat-session', sessionId],
    queryFn: () => chatsApi.getCustomerSession(sessionId)
  })

  // Fetch messages
  const { data: messages, isLoading: isMessagesLoading } = useQuery({
    queryKey: ['customer-chat-messages', sessionId],
    queryFn: () => chatsApi.getSessionMessages(sessionId)
  })

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: (message: string) => 
      chatsApi.sendCustomerMessage(sessionId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['customer-chat-messages', sessionId]
      })
    }
  })

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat_messages:${sessionId}`)
      .on(
        'postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (_payload: RealtimePostgresInsertPayload<any>) => {
          queryClient.invalidateQueries({
            queryKey: ['customer-chat-messages', sessionId]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId, queryClient])

  return {
    session,
    messages,
    isLoading: isSessionLoading || isMessagesLoading,
    sendMessage: sendMessage.mutate
  }
} 