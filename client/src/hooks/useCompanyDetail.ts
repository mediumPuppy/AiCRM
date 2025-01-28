import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface Company {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  branding: {
    primary_color: string;
    secondary_color: string;
    logo_url: string | null;
    favicon_url: string | null;
    company_url: string | null;
    email_template: string | null;
    portal_theme: 'light' | 'dark';
  };
}

export function useCompanyDetail(companyId: number) {
  return useQuery<Company>({
    queryKey: ['company', companyId],
    queryFn: async () => {
      try {
        const { data } = await axios.get(`/api/companies/${companyId}`);
        return data;
      } catch (error) {
        console.error('Error fetching company:', error);
        throw new Error('Failed to fetch company details');
      }
    },
    enabled: !!companyId,
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
} 
