import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketsApi } from '@/api/tickets'
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
    },
  })

  const updatePriority = useMutation({
    mutationFn: (priority: Ticket['priority']) => 
      ticketsApi.updatePriority(ticketId, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
    },
  })

  const addNote = useMutation({
    mutationFn: (note: string) => 
      ticketsApi.addNote(ticketId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
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