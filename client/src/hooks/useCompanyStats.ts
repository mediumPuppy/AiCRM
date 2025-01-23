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
      try {
        const tickets = await ticketsApi.getByCompany(companyId);
        const contacts = await contactsApi.getByCompany(companyId);
        const articles = await articlesApi.getByCompany({ 
          companyId: Number(companyId), 
          page: 1, 
          limit: 10 
        });
        const chats = await chatsApi.getCompanySessions(companyId);

        // Add console logs to debug the returned data
        console.log('Dashboard Stats:', {
          tickets,
          contacts,
          articles,
          chats
        });

        return {
          totalTickets: tickets?.total ?? 0,
          openTickets: tickets?.tickets?.filter(t => t.status === 'open')?.length ?? 0,
          totalContacts: contacts?.length ?? 0,
          activeChats: chats?.sessions?.filter((c: { status: string }) => c.status === 'active')?.length ?? 0,
          publishedArticles: articles?.data?.length ?? 0
        };
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
}; 