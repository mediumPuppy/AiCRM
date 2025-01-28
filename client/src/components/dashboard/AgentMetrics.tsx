import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAgentMetrics } from '@/api/agent'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { IconRobot, IconCheck, IconClock, IconBrain } from '@tabler/icons-react'
import type { AgentMetricsResponse } from '@/api/agent'

type AgentMetric = AgentMetricsResponse['metrics'][0]

export function AgentMetrics() {
  const { data, isLoading, error } = useQuery<AgentMetricsResponse, Error>({
    queryKey: ['agentMetrics'],
    queryFn: getAgentMetrics
  })

  if (isLoading) return <div>Loading metrics...</div>
  if (error) return <div>Error loading metrics: {error.message}</div>
  if (!data) return null

  const { metrics, aggregates } = data

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">AI Agent Metrics</h2>
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <IconRobot size={32} stroke={1.5} className="text-primary" />
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase font-bold">Total Recommendations</p>
                <div className="text-2xl font-bold">{aggregates.totalCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <IconCheck size={32} stroke={1.5} className="text-primary" />
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase font-bold">Helpful Rate</p>
                <div className="text-2xl font-bold">{aggregates.successRate.toFixed(1)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <IconBrain size={32} stroke={1.5} className="text-primary" />
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase font-bold">Helpful Actions</p>
                <div className="text-2xl font-bold">{aggregates.successCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <IconClock size={32} stroke={1.5} className="text-primary" />
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase font-bold">Avg. Response Time</p>
                <div className="text-2xl font-bold">{aggregates.avgLatency.toFixed(0)}ms</div>
              </div>
            </div>
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
                <TableHead>Helpful</TableHead>
                <TableHead>Latency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.slice(0, 10).map((metric: AgentMetric) => (
                <TableRow key={metric.id}>
                  <TableCell>
                    {new Date(metric.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>{metric.agent_name}</TableCell>
                  <TableCell>#{metric.ticket_id}</TableCell>
                  <TableCell>
                    {metric.success === null ? (
                      <span className="text-gray-500">Pending</span>
                    ) : metric.success ? (
                      <span className="text-green-600">Yes</span>
                    ) : (
                      <span className="text-red-600">No</span>
                    )}
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