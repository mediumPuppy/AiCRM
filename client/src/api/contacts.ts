import axios from 'axios';

interface Contact {
  id: number;
  company_id: number;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
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
  }
}; 