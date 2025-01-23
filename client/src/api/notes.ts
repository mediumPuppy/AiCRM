import axios from 'axios';

export interface Note {
  id: number;
  company_id: number;
  user_id: number;
  target_type: 'ticket' | 'contact';
  target_id: number;
  note: string;
  created_at: string;
  updated_at: string;
}

export const notesApi = {
  create: async (data: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => {
    const { data: response } = await axios.post<Note>('/api/notes', data);
    return response;
  },

  getByTarget: async (targetType: Note['target_type'], targetId: number) => {
    const { data } = await axios.get<Note[]>(`/api/notes/target/${targetType}/${targetId}`);
    return data;
  }
}; 