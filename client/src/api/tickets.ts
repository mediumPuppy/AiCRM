import axios from 'axios';

interface Ticket {
  id: number;
  company_id: number;
  contact_id: number;
  assigned_to: number;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  // ... add other ticket properties as needed
}

export const ticketsApi = {
  getByCompany: async (companyId: string | number) => {
    try {
      const { data } = await axios.get<Ticket[]>(`/api/tickets?companyId=${companyId}`);
      return data;
    } catch (error: any) {
      // More detailed error logging
      console.error('Request failed:', {
        url: `/api/tickets?companyId=${companyId}`,
        error: error.response?.data || error,
        status: error.response?.status,
        statusText: error.response?.statusText,
        config: error.config
      });
      throw error;
    }
  },
  
  getByStatus: async (companyId: string | number, status: Ticket['status']) => {
    const { data } = await axios.get<Ticket[]>(`/api/tickets?companyId=${companyId}&status=${status}`);
    return data;
  }
}; 