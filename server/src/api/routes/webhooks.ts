import { Router, RequestHandler } from 'express';
import { WebhookRepository } from '../../repositories/implementations/WebhookRepository';
import { supabase } from '../../lib/supabase';
import { webhookReadLimiter, webhookWriteLimiter } from '../../middleware/rateLimiter';

const router = Router();
const webhookRepo = new WebhookRepository(supabase);

/**
 * @swagger
 * /api/webhooks:
 *   get:
 *     summary: Get webhooks by company ID
 *     parameters:
 *       - in: query
 *         name: companyId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: event
 *         schema:
 *           type: string
 *           enum: [contact.created, contact.updated, contact.archived, ticket.created, ticket.updated, ticket.status_changed, ticket.assigned]
 */
const getWebhooks: RequestHandler = async (req, res) => {
  try {
    const companyId = Number(req.query.companyId);
    const event = req.query.event as any;
    
    if (!companyId) {
      res.status(400).json({ error: 'Company ID is required' });
      return;
    }

    const webhooks = event 
      ? await webhookRepo.findByEvent(companyId, event)
      : await webhookRepo.findByCompanyId(companyId);

    res.json(webhooks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch webhooks' });
  }
};

/**
 * @swagger
 * /api/webhooks/{id}:
 *   get:
 *     summary: Get webhook by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
const getWebhookById: RequestHandler = async (req, res) => {
  try {
    const webhook = await webhookRepo.findById(Number(req.params.id));
    if (!webhook) {
      res.status(404).json({ error: 'Webhook not found' });
      return;
    }
    res.json(webhook);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch webhook' });
  }
};

/**
 * @swagger
 * /api/webhooks:
 *   post:
 *     summary: Create a new webhook
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - company_id
 *               - webhook_type
 *               - endpoint
 *               - events
 *             properties:
 *               company_id:
 *                 type: integer
 *               webhook_type:
 *                 type: string
 *                 enum: [incoming, outgoing]
 *               endpoint:
 *                 type: string
 *               secret:
 *                 type: string
 *               events:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [contact.created, contact.updated, contact.archived, ticket.created, ticket.updated, ticket.status_changed, ticket.assigned]
 */
const createWebhook: RequestHandler = async (req, res) => {
  try {
    const webhook = await webhookRepo.create(req.body);
    res.status(201).json(webhook);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create webhook' });
  }
};

/**
 * @swagger
 * /api/webhooks/{id}:
 *   patch:
 *     summary: Update a webhook
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
const updateWebhook: RequestHandler = async (req, res) => {
  try {
    const webhook = await webhookRepo.update(Number(req.params.id), req.body);
    res.json(webhook);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update webhook' });
  }
};

/**
 * @swagger
 * /api/webhooks/{id}:
 *   delete:
 *     summary: Delete a webhook
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
const deleteWebhook: RequestHandler = async (req, res) => {
  try {
    await webhookRepo.delete(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete webhook' });
  }
};

// Route definitions
router.get('/', webhookReadLimiter, getWebhooks);
router.get('/:id', webhookReadLimiter, getWebhookById);
router.post('/', webhookWriteLimiter, createWebhook);
router.patch('/:id', webhookWriteLimiter, updateWebhook);
router.delete('/:id', webhookWriteLimiter, deleteWebhook);

export default router; 