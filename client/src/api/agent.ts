import axios from 'axios'

interface AgentMetricsResponse {
  metrics: Array<{
    id: number
    agent_name: string
    ticket_id: number
    start_time: string
    end_time: string
    success: boolean | null
    latency_ms: number
    created_at: string
  }>
  aggregates: {
    totalCount: number
    successCount: number
    successRate: number
    avgLatency: number
  }
}

interface AgentRecommendation {
  recommendation: string
  metricId: number
}

export async function getAgentRecommendation(ticketId: number): Promise<AgentRecommendation> {
  const { data } = await axios.post<AgentRecommendation>('/api/agent/action-recommender', { ticketId })
  return data
}

export async function evaluateRecommendation(metricId: number, success: boolean): Promise<void> {
  await axios.post('/api/agent/action-eval', { metricId, success })
}

export async function getAgentMetrics(): Promise<AgentMetricsResponse> {
  const { data } = await axios.get('/api/agent/metrics')
  return data
} 