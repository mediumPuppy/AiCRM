import { Router, Request, Response } from 'express'
import { supabase } from '../../lib/supabase'

const router = Router()

router.get('/outreach', async (req: Request, res: Response) => {
  try {
    // Get all metrics from the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: metrics, error } = await supabase
      .from('outreach_metrics')
      .select('*')
      .gte('created_at', thirtyDaysAgo.toISOString())

    if (error) {
      console.error('Failed to fetch outreach metrics:', error)
      return res.status(500).json({ error: 'Failed to fetch metrics' })
    }

    if (!metrics) {
      return res.json({
        totalMessages: 0,
        averageGenerationTime: 0,
        firstTryAcceptanceRate: 0,
        averageGenerationsPerMessage: 0
      })
    }

    // Calculate aggregate metrics
    const totalMessages = metrics.length
    const averageGenerationTime = metrics.reduce((sum, m) => sum + m.generation_time_ms, 0) / totalMessages
    const firstTryAcceptances = metrics.filter(m => m.accepted_on_first_try).length
    const firstTryAcceptanceRate = totalMessages > 0 ? firstTryAcceptances / totalMessages : 0
    const averageGenerationsPerMessage = metrics.reduce((sum, m) => sum + m.total_generations, 0) / totalMessages

    return res.json({
      totalMessages,
      averageGenerationTime,
      firstTryAcceptanceRate,
      averageGenerationsPerMessage
    })
  } catch (error) {
    console.error('Metrics calculation error:', error)
    return res.status(500).json({ error: 'Failed to calculate metrics' })
  }
})

export default router 
