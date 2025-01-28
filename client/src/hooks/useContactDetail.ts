import { useQuery } from '@tanstack/react-query';
import { contactsApi } from '@/api/contacts';
import { Contact } from '@/types/contact.types';

export function useContactDetail(contactId: number) {
  return useQuery<Contact>({
    queryKey: ['contact', contactId],
    queryFn: async () => {
      try {
        const data = await contactsApi.getContact(contactId);
        return data;
      } catch (error) {
        console.error('Error fetching contact:', error);
        throw new Error('Failed to fetch contact details');
      }
    },
    enabled: !!contactId,
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}