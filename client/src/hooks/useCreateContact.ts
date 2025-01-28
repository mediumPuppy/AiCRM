import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contactsApi } from '@/api/contacts';
import { CreateContactData } from '@/types/contact.types';

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContactData) => contactsApi.createContact(data),
    onSuccess: () => {
      // Invalidate contacts list query to refresh data
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
} 