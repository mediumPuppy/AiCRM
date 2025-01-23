import { useQuery } from '@tanstack/react-query';
import { contactsApi } from '@/api/contacts';
import { formatDate } from '@/utils/formatDate';

interface ContactHistoryProps {
  contactId: number;
}

export function ContactHistory({ contactId }: ContactHistoryProps) {
  const { data: history, isLoading } = useQuery({
    queryKey: ['contact-history', contactId],
    queryFn: () => contactsApi.getHistory(contactId),
  });

  if (isLoading) {
    return <div className="animate-pulse">Loading history...</div>;
  }

  return (
    <div className="space-y-4">
      {history?.map((entry) => (
        <div key={entry.id} className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">{entry.action}</div>
            <div className="text-sm text-gray-500">
              {formatDate(entry.created_at)}
            </div>
          </div>
          <div className="mt-1 text-sm text-gray-600">{entry.details}</div>
          <div className="mt-1 text-sm text-gray-500">
            by {entry.created_by.name}
          </div>
        </div>
      ))}
    </div>
  );
} 