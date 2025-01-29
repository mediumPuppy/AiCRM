import axios from 'axios'
import { AgentRecommendation } from './agent'

export async function generateActionMessage(ticketId: number): Promise<AgentRecommendation> {
  const { data } = await axios.post('/api/agent/action-recommender', { ticketId })
  return data
}
export async function generateChatMessage(ticketId: number): Promise<{ recommendation: string; metricId: number }> {
  const { data } = await axios.post('/api/ai/chat-message', { ticketId })
  return data
}
