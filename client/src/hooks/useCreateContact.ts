import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contactsApi, CreateContactData } from '@/api/contacts';

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