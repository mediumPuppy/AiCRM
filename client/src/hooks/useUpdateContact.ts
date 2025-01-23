import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contactsApi, Contact } from '@/api/contacts';

type UpdateContactData = Partial<Contact>;

export function useUpdateContact() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateContactData }) => {
      return contactsApi.updateContact(id, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['contact', id] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });

  return {
    updateContact: (id: number, data: UpdateContactData) => 
      mutation.mutateAsync({ id, data }),
    isUpdating: mutation.isPending,
  };
} 