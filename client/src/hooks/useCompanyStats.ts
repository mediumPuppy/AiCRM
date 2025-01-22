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
      
      const [tickets, contacts, articles, chats] = await Promise.all([
        ticketsApi.getByCompany(companyId),
        contactsApi.getByCompany(companyId),
        articlesApi.getByCompany({ companyId: Number(companyId), page: 1, limit: 10 }),
        chatsApi.getCompanySessions(companyId)
      ]);

      return {
        totalTickets: tickets.length,
        openTickets: tickets.filter(t => t.status === 'open').length,
        totalContacts: contacts.length,
        activeChats: chats.filter(c => c.status === 'active').length,
        publishedArticles: articles.metadata.total
      };
    }
  });
}; 