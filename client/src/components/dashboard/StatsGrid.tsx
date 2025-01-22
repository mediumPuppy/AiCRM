import { CardContent } from "../ui/card"
import { Card } from "../ui/card"
import { Skeleton } from "../ui/skeleton"
import { IconTicket, IconUsers, IconArticle } from "@tabler/icons-react";
import { useCompanyStats } from '../../hooks/useCompanyStats';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  loading?: boolean;
}

const StatCard = ({ title, value, icon, loading }: StatCardProps) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        {icon}
        <div className="text-right">
          <p className="text-xs text-muted-foreground uppercase font-bold">
            {title}
          </p>
          <div className="text-2xl font-bold">
            {loading ? <Skeleton className="h-8 w-20" /> : value}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export function StatsGrid({ companyId }: { companyId: string }) {
  const { data, isLoading } = useCompanyStats(companyId);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Tickets"
        value={data?.totalTickets || 0}
        loading={isLoading}
        icon={<IconTicket size={32} stroke={1.5} className="text-primary" />}
      />
      <StatCard
        title="Open Tickets"
        value={data?.openTickets || 0}
        loading={isLoading}
        icon={<IconTicket size={32} stroke={1.5} className="text-primary" />}
      />
      <StatCard
        title="Total Contacts"
        value={data?.totalContacts || 0}
        loading={isLoading}
        icon={<IconUsers size={32} stroke={1.5} className="text-primary" />}
      />
      <StatCard
        title="Published Articles"
        value={data?.publishedArticles || 0}
        loading={isLoading}
        icon={<IconArticle size={32} stroke={1.5} className="text-primary" />}
      />
    </div>
  );
} 