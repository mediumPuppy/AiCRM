import axios from 'axios';
import { Contact, Note, HistoryEntry, CreateContactData } from '../types/contact.types';

export const contactsApi = {
    getByCompany: async (companyId: string | number) => {
        try {
            const { data } = await axios.get<Contact[]>(`/api/contacts/company/${companyId}`);
            return data;
        } catch (error: any) {
            throw error;
        }
    },
    getContact: async (id: number) => {
        try {
            const { data } = await axios.get<Contact>(`/api/contacts/${id}`);
            return data;
        } catch (error: any) {
            throw error;
        }
    },
    updateContact: async (id: number, updateData: Partial<Contact>) => {
        try {
            const { data } = await axios.patch<Contact>(`/api/contacts/${id}`, updateData);
            return data;
        } catch (error: any) {
            throw error;
        }
    },
    getNotes: async (contactId: number) => {
        try {
            const { data } = await axios.get<Note[]>(`/api/contacts/${contactId}/notes`);
            return data;
        } catch (error: any) {
            throw error;
        }
    },
    addNote: async (contactId: number, content: string) => {
        try {
            const { data } = await axios.post<Note>(`/api/contacts/${contactId}/notes`, { content });
            return data;
        } catch (error: any) {
            throw error;
        }
    },
    getHistory: async (contactId: number) => {
        try {
            const { data } = await axios.get<HistoryEntry[]>(`/api/contacts/${contactId}/history`);
            return data;
        } catch (error: any) {
            throw error;
        }
    },
    createContact: async (data: CreateContactData) => {
        try {
            const { data: contact } = await axios.post<Contact>('/api/contacts', data);
            return contact;
        } catch (error: any) {
            throw error;
        }
    },
}; 