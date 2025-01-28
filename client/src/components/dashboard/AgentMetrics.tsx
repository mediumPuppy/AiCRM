import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAgentMetrics } from '@/api/agent'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function AgentMetrics() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['agentMetrics'],
    queryFn: getAgentMetrics
  })

  if (isLoading) return <div>Loading metrics...</div>
  if (error) return <div>Error loading metrics</div>
  if (!data) return null

  const { metrics, aggregates } = data

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aggregates.totalCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aggregates.successRate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aggregates.successCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aggregates.avgLatency.toFixed(0)}ms</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Agent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Ticket</TableHead>
                <TableHead>Success</TableHead>
                <TableHead>Latency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.slice(0, 10).map((metric) => (
                <TableRow key={metric.id}>
                  <TableCell>
                    {new Date(metric.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>{metric.agent_name}</TableCell>
                  <TableCell>#{metric.ticket_id}</TableCell>
                  <TableCell>
                    {metric.success === null ? 'Pending' : metric.success ? 'Yes' : 'No'}
                  </TableCell>
                  <TableCell>{metric.latency_ms}ms</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 