import { RequestHandler } from 'express'
import { ApiKeyRepository } from '@/repositories/implementations/ApiKeyRepository'
import { supabase } from '@/lib/supabase'

const apiKeyRepo = new ApiKeyRepository(supabase)

export const adminAuthMiddleware: RequestHandler = async (req: any, res, next) => {
  try {
    const apiKey = req.headers['x-api-key']
    if (!apiKey) {
      res.status(401).json({ error: 'API key required' })
      return
    }

    const key = await apiKeyRepo.findByKey(apiKey as string)
    if (!key) {
      res.status(403).json({ error: 'Unauthorized: Invalid API key' })
      return
    }

    req.companyId = key.company_id
    next()
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' })
  }
} 