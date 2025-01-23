import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { contactsApi } from '@/api/contacts'

export interface ContactFilters {
  status?: string[]
  search?: string
}

interface PaginationState {
  page: number
  perPage: number
}

export function useContacts(companyId: string | number) {
  const [filters, setFilters] = useState<ContactFilters>({})
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    perPage: 10
  })

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['contacts', filters, pagination],
    queryFn: async () => {
      try {
        const contacts = await contactsApi.getByCompany(companyId)
        
        // Apply filters to contacts (or empty array if contacts is null/undefined)
        let filteredContacts = [...(contacts || [])]

        // Filter by status
        if (filters.status?.length) {
          filteredContacts = filteredContacts.filter(contact => 
            filters.status?.includes(contact.status)
          )
        }

        // Filter by search term
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase()
          filteredContacts = filteredContacts.filter(contact =>
            contact.full_name.toLowerCase().includes(searchTerm) ||
            contact.email.toLowerCase().includes(searchTerm)
          )
        }

        return { 
          contacts: filteredContacts,
          total: filteredContacts.length 
        }
      } catch (error) {
        console.error('Error fetching contacts:', error)
        return {
          contacts: [],
          total: 0
        }
      }
    }
  })

  return {
    contacts: data ?? { contacts: [], total: 0 },
    isLoading,
    filters,
    setFilters,
    pagination,
    setPagination,
    refreshContacts: refetch
  }
} 