import axios from 'axios';

export interface Contact {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  status: 'active' | 'archived';
  created_at: string;
  portal_enabled: boolean;
  portal_username?: string;
  last_portal_login?: string;
}

export interface Note {
  id: number;
  content: string;
  created_at: string;
  created_by: {
    id: number;
    name: string;
  };
}

export interface HistoryEntry {
  id: number;
  action: string;
  details: string;
  created_at: string;
  created_by: {
    id: number;
    name: string;
  };
}

export interface CreateContactData {
  company_id: number;
  full_name: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'archived';
}

export const contactsApi = {
    getByCompany: async (companyId: string | number) => {
        try {
            const { data } = await axios.get<Contact[]>(`/api/contacts/company/${companyId}`);
            return data;
        } catch (error: any) {
            console.error('Failed to fetch contacts:', error);
            throw error;
        }
        },
  getContact: async (id: number) => {
    try {
      console.log('Fetching contact:', id);
      const { data } = await axios.get<Contact>(`/api/contacts/${id}`);
      console.log('Contact data received:', data);
      return data;
    } catch (error: any) {
      console.error('Failed to fetch contact:', {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
      throw error;
    }
  },

  updateContact: async (id: number, updateData: Partial<Contact>) => {
    try {
      const { data } = await axios.patch<Contact>(`/api/contacts/${id}`, updateData);
      return data;
    } catch (error: any) {
      console.error('Failed to update contact:', error);
      throw error;
    }
  },

  getNotes: async (contactId: number) => {
    try {
      const { data } = await axios.get<Note[]>(`/api/contacts/${contactId}/notes`);
      return data;
    } catch (error: any) {
      console.error('Failed to fetch contact notes:', error);
      throw error;
    }
  },

  addNote: async (contactId: number, content: string) => {
    try {
      const { data } = await axios.post<Note>(`/api/contacts/${contactId}/notes`, { content });
      return data;
    } catch (error: any) {
      console.error('Failed to add contact note:', error);
      throw error;
    }
  },

  getHistory: async (contactId: number) => {
    try {
      const { data } = await axios.get<HistoryEntry[]>(`/api/contacts/${contactId}/history`);
      return data;
    } catch (error: any) {
      console.error('Failed to fetch contact history:', error);
      throw error;
    }
  },

  createContact: async (data: CreateContactData) => {
    try {
      const { data: contact } = await axios.post<Contact>('/api/contacts', data);
      return contact;
    } catch (error: any) {
      console.error('Failed to create contact:', error);
      throw error;
    }
  },
}; 