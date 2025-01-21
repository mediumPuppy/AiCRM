import {Router, RequestHandler } from 'express'
import { ApiKeyRepository } from '../../repositories/implementations/ApiKeyRepository'
import { supabase } from '../../lib/supabase'
import { apiKeyAuthLimiter, apiKeyGenerateLimiter } from '../../middleware/rateLimiter'

const router = Router()
const apiKeyRepo = new ApiKeyRepository(supabase)


// DELETE /api/api-keys/:id
router.delete('/:id', async (req, res) => {
  try {
    await apiKeyRepo.delete(Number(req.params.id))
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete API Key' })
  }
})

/**
 * @swagger
 * /api/api-keys/generate:
 *   post:
 *     summary: Generate a new API key for a company. Expires in 7 days.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyId:
 *                 type: integer
 *               label:
 *                 type: string
 */
const generateApiKey: RequestHandler = async (req, res) => {
  try {
    const { companyId, label } = req.body;    
    const result = await apiKeyRepo.create({
      company_id: companyId,
      label,
      expires_at: null
    });
    
    res.status(201);
    res.json(result);
  } catch (error) {
    res.status(500);
    res.json({ error: 'Failed to generate API key' });
  }
};

router.post('/generate', apiKeyGenerateLimiter, generateApiKey);

/**
 * @swagger
 * /api/api-keys/authorize:
 *   post:
 *     summary: Validate an API key and return company information
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               apiKey:
 *                 type: string
 */
const authorizeApiKey: RequestHandler = async (req, res, next) => {
  try {
    const { apiKey } = req.body;
    const key = await apiKeyRepo.findByKey(apiKey);
    
    if (!key) {
      res.status(401);
      res.json({ error: 'Invalid API key' });
      return;
    }
    
    res.json({
      companyId: key.company_id,
      authorized: true
    });
  } catch (error) {
    res.status(500).json({ error: 'Authorization failed' });
  }
};

router.post('/authorize', apiKeyAuthLimiter, authorizeApiKey);

export default router 