import { useQuery } from '@tanstack/react-query';
import { IconMessageCircle, IconUser, IconTag } from '@tabler/icons-react';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/utils/formatDate';

type Activity = {
  type: 'ticket' | 'chat' | 'login';
  id: number;
  title?: string;
  status?: string;
  contact?: string;
  timestamp: string;
  description: string;
};

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'chat':
      return <IconMessageCircle className="text-blue-500" />;
    case 'login':
      return <IconUser className="text-green-500" />;
    case 'ticket':
      return <IconTag className="text-purple-500" />;
  }
};

export function RecentActivity() {
  const { user } = useAuth();
  const companyId = user?.company_id;

  const { data: activities, isLoading, error } = useQuery({
    queryKey: ['recent-activity', companyId],
    queryFn: async () => {
      const response = await fetch(`/api/activity/recent?companyId=${companyId}&limit=5`);
      if (!response.ok) throw new Error('Failed to fetch recent activity');
      return response.json() as Promise<Activity[]>;
    },
    enabled: !!companyId,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (error) return <div>Error loading recent activity</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities?.map((activity) => (
          <div key={`${activity.type}-${activity.id}`} className="flex items-start space-x-3">
            <div className="mt-1">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">{activity.description}</p>
              <p className="text-xs text-gray-500">
                {formatDate(activity.timestamp, { includeTime: true })}
              </p>
            </div>
          </div>
        ))}
        {(!activities || activities.length === 0) && (
          <p className="text-sm text-gray-500">No recent activity</p>
        )}
      </div>
    </div>
  );
} 