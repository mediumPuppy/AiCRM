import axios from 'axios';

interface ChatSession {
  id: number;
  company_id: number;
  status: 'active' | 'closed';
  created_at: string;
}

export const chatsApi = {
  getCompanySessions: async (companyId: string | number) => {
    try {
      const { data } = await axios.get<ChatSession[]>(`/api/chat/sessions/company/${companyId}`);
      return data;
    } catch (error: any) {
      console.error('Failed to fetch chat sessions:', error);
      throw error;
    }
  }
}; 