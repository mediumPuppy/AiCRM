import { Router, Request, Response, RequestHandler } from 'express'
import { supabase } from '../../lib/supabase'

const router = Router()

const getOutreachMetrics: RequestHandler = async (req, res) => {
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
      res.status(500).json({ error: 'Failed to fetch metrics' })
      return
    }

    if (!metrics) {
      res.json({
        totalMessages: 0,
        averageGenerationTime: 0,
        firstTryAcceptanceRate: 0,
        averageGenerationsPerMessage: 0
      })
      return
    }

    // Calculate aggregate metrics
    const totalMessages = metrics.length
    const averageGenerationTime = metrics.reduce((sum, m) => sum + m.generation_time_ms, 0) / totalMessages
    const firstTryAcceptances = metrics.filter(m => m.accepted_on_first_try).length
    const firstTryAcceptanceRate = totalMessages > 0 ? firstTryAcceptances / totalMessages : 0
    const averageGenerationsPerMessage = metrics.reduce((sum, m) => sum + m.total_generations, 0) / totalMessages

    res.json({
      totalMessages,
      averageGenerationTime,
      firstTryAcceptanceRate,
      averageGenerationsPerMessage
    })
  } catch (error) {
    console.error('Metrics calculation error:', error)
    res.status(500).json({ error: 'Failed to calculate metrics' })
  }
}

router.get('/outreach', getOutreachMetrics)

export default router 
