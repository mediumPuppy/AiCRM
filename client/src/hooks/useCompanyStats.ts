import { useQuery } from '@tanstack/react-query';
import { ticketsApi } from '../api/tickets';
import { contactsApi } from '../api/contacts';
import { articlesApi } from '../api/articles';
import { chatsApi } from '../api/chats';
import type { DashboardStats } from '../lib/dashboard/types';

export const useCompanyStats = (companyId: string | number) => {
  return useQuery<DashboardStats>({
    queryKey: ['companyStats', companyId],
    queryFn: async () => {
      const tickets = await ticketsApi.getByCompany(companyId);
      const contacts = await contactsApi.getByCompany(companyId);
      const articles = await articlesApi.getByCompany({ 
        companyId: Number(companyId), 
        page: 1, 
        limit: 10 
      });
      const chats = await chatsApi.getCompanySessions(companyId);

      return {
        totalTickets: tickets.total,
        openTickets: tickets.tickets.filter(t => t.status === 'open').length,
        totalContacts: contacts.length,
        activeChats: chats.filter(c => c.status === 'active').length,
        publishedArticles: articles.data.length
      };
    },
    retry: false, // Disable retries to see errors immediately
    refetchOnWindowFocus: false, // Disable automatic refetching
  });
}; 