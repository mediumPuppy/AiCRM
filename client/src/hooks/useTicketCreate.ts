import { useState } from 'react'
import { useContacts } from './useContacts'
import { useDebounce } from './useDebounce'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketsApi, Ticket } from '@/api/tickets'

interface CreateTicketData {
  subject: string;
  description: string;
  status: Ticket['status'];
  priority: Ticket['priority'];
  contact_id?: number;
}

export function useTicketCreate() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm)
  
  // Temporary company ID (should come from context)
  const tempCompanyId = 1

  const {
    contacts,
    isLoading: isLoadingContacts,
  } = useContacts(tempCompanyId)

  const createTicketMutation = useMutation({
    mutationFn: (data: CreateTicketData) => 
      ticketsApi.createTicket({
        ...data,
        company_id: tempCompanyId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })

  // Filter contacts based on search
  const filteredContacts = contacts.contacts.filter(contact => 
    contact.full_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    contact.email.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  return {
    contacts: filteredContacts,
    isLoadingContacts,
    searchTerm,
    setSearchTerm,
    createTicket: createTicketMutation.mutate,
    isCreating: createTicketMutation.isPending,
    error: createTicketMutation.error
  }
} 