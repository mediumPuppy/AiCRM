import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notesApi } from '@/api/notes';

export function useNotes(targetType: 'ticket' | 'contact', targetId: number) {
  const queryClient = useQueryClient();

  const { data: notes, isLoading } = useQuery({
    queryKey: ['notes', targetType, targetId],
    queryFn: () => notesApi.getByTarget(targetType, targetId),
  });

  const addNote = useMutation({
    mutationFn: (note: string) => 
      notesApi.create({
        target_type: targetType,
        target_id: targetId,
        note,
        company_id: 1, // TODO: Get from context/store
        user_id: 1, // TODO: Get from auth context
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', targetType, targetId] });
      // Also invalidate conversation history since notes are part of it
      queryClient.invalidateQueries({ queryKey: ['ticket-conversation', targetId] });
    },
  });

  return {
    notes,
    isLoading,
    addNote: addNote.mutate,
  };
} 