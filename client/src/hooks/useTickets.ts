import { useState } from 'react'
import { ticketsApi } from '@/api/tickets'
import { useQuery } from '@tanstack/react-query'
import { DateRange } from "react-day-picker"

export interface TicketFilters {
  status?: string[]
  priority?: string[]
  assignedTo?: string[]
  dateRange?: DateRange
  search?: string
  tags?: string[]
}

export interface TicketsPagination {
  page: number
  limit: number
}

export function useTickets() {
  const companyId = 1 // Hardcoded for now

  const [filters, setFilters] = useState<TicketFilters>({})
  const [pagination, setPagination] = useState<TicketsPagination>({
    page: 1,
    limit: 10,
  })

  const { data: tickets, isLoading, refetch } = useQuery({
    queryKey: ['tickets', filters, pagination, companyId],
    queryFn: () => ticketsApi.getFiltered({
      ...filters,
      companyId,
      page: pagination.page,
      limit: pagination.limit,
    })
  })

  return {
    tickets,
    isLoading,
    filters,
    setFilters,
    pagination,
    setPagination,
    refreshTickets: refetch
  }
} 