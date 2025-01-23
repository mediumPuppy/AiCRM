import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketsApi } from '@/api/tickets'
import { notesApi } from '@/api/notes'
import type { Ticket } from '@/api/tickets'

export function useTicketDetail(ticketId: number) {
  const queryClient = useQueryClient()

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => ticketsApi.getById(ticketId),
  })

  const updateStatus = useMutation({
    mutationFn: (status: Ticket['status']) => 
      ticketsApi.updateStatus(ticketId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })

  const updatePriority = useMutation({
    mutationFn: (priority: Ticket['priority']) => 
      ticketsApi.updatePriority(ticketId, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })

  const addNote = useMutation({
    mutationFn: (note: string) => 
      notesApi.create({
        target_type: 'ticket',
        target_id: ticketId,
        note,
        company_id: 1, // TODO: Get from context/store
        user_id: 1, // TODO: Get from auth context
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['ticket-conversation', ticketId] })
    },
  })

  return {
    ticket,
    isLoading,
    updateStatus: updateStatus.mutate,
    updatePriority: updatePriority.mutate,
    addNote: addNote.mutate,
  }
} 