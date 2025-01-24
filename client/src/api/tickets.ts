import axios from 'axios';
import { TicketFilters } from '@/hooks/useTickets';

export interface Ticket {
  id: number;
  company_id: number;
  contact_id: number;
  assigned_to: number;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  tags: string[];
  internal_notes: string[];
}

export interface ConversationItem {
  id: number;
  type: 'chat_message' | 'note';
  message: string;
  sender_type: 'customer' | 'agent' | 'system';
  sender_id: number;
  created_at: string;
  metadata?: Record<string, any>;
}

interface TicketResponse {
  tickets: Ticket[];
  total: number;
}

export const ticketsApi = {
  getByCompany: async (companyId: string | number) => {
    const { data } = await axios.get<TicketResponse>(`/api/tickets`, {
      params: { companyId }
    });
    return data;
  },
  
  getByStatus: async (companyId: string | number, status: Ticket['status']) => {
    const { data } = await axios.get<Ticket[]>(`/api/tickets?companyId=${companyId}&status=${status}`);
    return data;
  },

  getFiltered: async (params: TicketFilters & { page: number; limit: number; companyId: number }) => {
    try {
      
      // Create a new params object with serialized dateRange
      const apiParams = {
        ...params,
        dateRange: params.dateRange ? JSON.stringify(params.dateRange) : undefined,
        companyId: params.companyId
      };
      
      const { data } = await axios.get<{
        tickets: Ticket[]
        total: number
      }>('/api/tickets', { params: apiParams })
      return data
    } catch (error: any) {
      throw error
    }
  },

  updateStatus: async (ticketId: number, status: Ticket['status']) => {
    const { data } = await axios.patch(`/api/tickets/${ticketId}`, { status })
    return data
  },

  updatePriority: async (ticketId: number, priority: Ticket['priority']) => {
    const { data } = await axios.patch(`/api/tickets/${ticketId}`, { priority });
    return data;
  },

  getById: async (ticketId: number): Promise<Ticket> => {
    const { data } = await axios.get(`/api/tickets/${ticketId}`)
    return data
  },

  getConversationHistory: async (ticketId: number): Promise<ConversationItem[]> => {
    const { data } = await axios.get(`/api/tickets/${ticketId}/conversation`);
    return data;
  },

  createTicket: async (ticketData: {
    company_id: number;
    subject: string;
    description?: string;
    status: Ticket['status'];
    priority: Ticket['priority'];
    contact_id?: number;
  }): Promise<Ticket> => {
    const { data } = await axios.post<Ticket>('/api/tickets', ticketData);
    return data;
  },

  assignTicket: async (ticketId: number, userId: number): Promise<Ticket> => {
    const { data } = await axios.patch<Ticket>(`/api/tickets/${ticketId}`, { assigned_to: userId });
    return data;
  },

  unassignTicket: async (ticketId: number): Promise<Ticket> => {
    const { data } = await axios.patch<Ticket>(`/api/tickets/${ticketId}`, { assigned_to: null });
    return data;
  },
}; 