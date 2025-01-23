import { useQuery } from '@tanstack/react-query';
import { ticketsApi } from '@/api/tickets';

export function useContactTickets(contactId: number) {
  const {
    data: tickets,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['contact-tickets', contactId],
    queryFn: async () => {
      const allTickets = await ticketsApi.getByCompany(1); // TODO: Get company ID from context
      const filteredTickets = allTickets.tickets
        .filter(ticket => ticket.contact_id === contactId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      return {
        tickets: filteredTickets,
        total: filteredTickets.length
      };
    },
    enabled: !!contactId
  });

  return {
    tickets: tickets || { tickets: [], total: 0 },
    isLoading,
    error,
    refetch
  };
} 