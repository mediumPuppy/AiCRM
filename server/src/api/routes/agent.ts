import { Router, RequestHandler } from 'express'
import { runAgentOnTicket } from '@/services/agentService'
import { supabase } from '@/lib/supabase'

interface ActionRecommenderRequest {
  ticketId: number
}

interface ActionEvalRequest {
  metricId: number
  success: boolean
}

const router = Router()

// Get agent recommendation for a ticket
const handleActionRecommender: RequestHandler<{}, {}, ActionRecommenderRequest> = async (req, res, next) => {
  try {
    console.log('Received request for ticket recommendation:', req.body)
    const { ticketId } = req.body
    if (!ticketId) {
      console.log('No ticketId provided in request')
      res.status(400).json({ error: 'ticketId is required' })
      return
    }

    console.log('Calling runAgentOnTicket with ticketId:', ticketId)
    const recommendation = await runAgentOnTicket(ticketId)
    console.log('Got recommendation:', recommendation)
    res.json({ recommendation })
  } catch (error) {
    console.error('Agent failed with error:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      })
    }
    res.status(500).json({ error: 'Agent failed to respond', details: error instanceof Error ? error.message : 'Unknown error' })
  }
}

// Update success/failure for a recommendation
const handleActionEval: RequestHandler<{}, {}, ActionEvalRequest> = async (req, res, next) => {
  try {
    const { metricId, success } = req.body
    if (!metricId) {
      res.status(400).json({ error: 'metricId is required' })
      return
    }
    if (typeof success !== 'boolean') {
      res.status(400).json({ error: 'success must be a boolean' })
      return
    }

    const { error } = await supabase
      .from('agent_metrics')
      .update({ success })
      .eq('id', metricId)

    if (error) throw error
    res.json({ status: 'OK' })
  } catch (error) {
    console.error('Failed to update metric:', error)
    res.status(500).json({ error: 'Failed to update metric' })
  }
}

// Get agent metrics
const handleGetMetrics: RequestHandler = async (_req, res, next) => {
  try {
    const { data: metrics, error } = await supabase
      .from('agent_metrics')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error

    // Calculate aggregate metrics
    const totalCount = metrics.length
    const successCount = metrics.filter(m => m.success === true).length
    const successRate = totalCount > 0 ? (successCount / totalCount) * 100 : 0
    const avgLatency = totalCount > 0 
      ? metrics.reduce((sum, m) => sum + (m.latency_ms || 0), 0) / totalCount 
      : 0

    res.json({
      metrics,
      aggregates: {
        totalCount,
        successCount,
        successRate,
        avgLatency
      }
    })
  } catch (error) {
    console.error('Failed to fetch metrics:', error)
    res.status(500).json({ error: 'Failed to fetch metrics' })
  }
}

router.post('/action-recommender', handleActionRecommender)
router.post('/action-eval', handleActionEval)
router.get('/metrics', handleGetMetrics)

export default router 