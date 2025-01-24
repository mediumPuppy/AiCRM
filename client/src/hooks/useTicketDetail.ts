import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketsApi } from '@/api/tickets'
import { notesApi } from '@/api/notes'
import type { Ticket } from '@/api/tickets'
import { useAuth } from '@/contexts/AuthContext'

export function useTicketDetail(ticketId: number) {
  const queryClient = useQueryClient()
  const { user } = useAuth()

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

  const assignToMe = useMutation({
    mutationFn: () => {
      if (!user?.id) throw new Error('No user ID found in auth context')
      return ticketsApi.assignTicket(ticketId, user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })

  const unassign = useMutation({
    mutationFn: () => ticketsApi.unassignTicket(ticketId),
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
        company_id: user?.company_id || 1,
        user_id: user?.id || 1,
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
    assignToMe: assignToMe.mutate,
    unassign: unassign.mutate,
    addNote: addNote.mutate,
  }
} 