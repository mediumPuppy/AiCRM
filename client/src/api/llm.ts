import axios from 'axios'

export async function generateChatMessage(ticketId: number): Promise<{ recommendation: string; metricId: number }> {
  const { data } = await axios.post('/api/ai/chat-message', { ticketId })
  return data
}
