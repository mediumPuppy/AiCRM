import { CardContent } from "../ui/card"
import { Card } from "../ui/card"
import { Skeleton } from "../ui/skeleton"
import { IconMessage, IconClock, IconCheck, IconRefresh } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"

interface OutreachMetrics {
  totalMessages: number
  averageGenerationTime: number
  firstTryAcceptanceRate: number
  averageGenerationsPerMessage: number
}

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  loading?: boolean
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
)

export function OutreachMetrics() {
  const { data, isLoading } = useQuery<OutreachMetrics>({
    queryKey: ['outreach-metrics'],
    queryFn: async () => {
      const response = await axios.get('/api/metrics/outreach')
      return response.data
    }
  })

  // Provide default values when data is undefined
  const metrics = {
    totalMessages: data?.totalMessages ?? 0,
    averageGenerationTime: data?.averageGenerationTime ?? 0,
    firstTryAcceptanceRate: data?.firstTryAcceptanceRate ?? 0,
    averageGenerationsPerMessage: data?.averageGenerationsPerMessage ?? 0
  }

  const formatTime = (ms: number) => `${(ms / 1000).toFixed(2)}s`
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`
  const formatGenerations = (value: number) => value.toFixed(1)

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Outreach Metrics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Messages"
          value={metrics.totalMessages}
          loading={isLoading}
          icon={<IconMessage size={32} stroke={1.5} className="text-primary" />}
        />
        <StatCard
          title="Avg Generation Time"
          value={formatTime(metrics.averageGenerationTime)}
          loading={isLoading}
          icon={<IconClock size={32} stroke={1.5} className="text-primary" />}
        />
        <StatCard
          title="First Try Success"
          value={formatPercentage(metrics.firstTryAcceptanceRate)}
          loading={isLoading}
          icon={<IconCheck size={32} stroke={1.5} className="text-primary" />}
        />
        <StatCard
          title="Avg Generations"
          value={formatGenerations(metrics.averageGenerationsPerMessage)}
          loading={isLoading}
          icon={<IconRefresh size={32} stroke={1.5} className="text-primary" />}
        />
      </div>
    </div>
  )
} 