import { Router, RequestHandler } from 'express';
import { PortalSessionRepository } from '../../repositories/implementations/PortalSessionRepository';
import { supabase } from '../../lib/supabase';
import { portalSessionReadLimiter, portalSessionWriteLimiter } from '../../middleware/rateLimiter';

const router = Router();
const portalSessionRepo = new PortalSessionRepository(supabase);

/**
 * @swagger
 * /api/portal-sessions:
 *   post:
 *     summary: Create a new portal session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contact_id:
 *                 type: integer
 *               token:
 *                 type: string
 *               expires_at:
 *                 type: string
 */
const createSession: RequestHandler = async (req, res) => {
  try {
    const session = await portalSessionRepo.create(req.body);
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create portal session' });
  }
};

/**
 * @swagger
 * /api/portal-sessions/{id}:
 *   get:
 *     summary: Get portal session by ID
 */
const getSessionById: RequestHandler = async (req, res) => {
  try {
    const session = await portalSessionRepo.findById(Number(req.params.id));
    if (!session) {
      res.status(404).json({ error: 'Portal session not found' });
    } else {
      res.json(session);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch portal session' });
  }
};

/**
 * @swagger
 * /api/portal-sessions/token/{token}:
 *   get:
 *     summary: Get portal session by token
 */
const getSessionByToken: RequestHandler = async (req, res) => {
  try {
    const session = await portalSessionRepo.findByToken(req.params.token);
    if (!session) {
      res.status(404).json({ error: 'Portal session not found' });
    } else {
      res.json(session);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch portal session' });
  }
};

/**
 * @swagger
 * /api/portal-sessions/contact/{contactId}:
 *   get:
 *     summary: Get all portal sessions for a contact
 */
const getSessionsByContactId: RequestHandler = async (req, res) => {
  try {
    const sessions = await portalSessionRepo.findByContactId(Number(req.params.contactId));
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch portal sessions' });
  }
};

/**
 * @swagger
 * /api/portal-sessions/contact/{contactId}/active:
 *   get:
 *     summary: Get active portal sessions for a contact
 */
const getActiveSessionsByContactId: RequestHandler = async (req, res) => {
  try {
    const sessions = await portalSessionRepo.findActiveByContactId(Number(req.params.contactId));
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active portal sessions' });
  }
};

/**
 * @swagger
 * /api/portal-sessions/{id}/access:
 *   post:
 *     summary: Update last accessed time for a portal session
 */
const updateLastAccessed: RequestHandler = async (req, res) => {
  try {
    const session = await portalSessionRepo.updateLastAccessed(Number(req.params.id));
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update portal session access time' });
  }
};

/**
 * @swagger
 * /api/portal-sessions/{id}:
 *   patch:
 *     summary: Update a portal session
 */
const updateSession: RequestHandler = async (req, res) => {
  try {
    const session = await portalSessionRepo.update(Number(req.params.id), req.body);
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update portal session' });
  }
};

/**
 * @swagger
 * /api/portal-sessions/{id}:
 *   delete:
 *     summary: Delete a portal session
 */
const deleteSession: RequestHandler = async (req, res) => {
  try {
    await portalSessionRepo.delete(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete portal session' });
  }
};

/**
 * @swagger
 * /api/portal-sessions/expired:
 *   delete:
 *     summary: Delete all expired portal sessions
 */
const deleteExpiredSessions: RequestHandler = async (req, res) => {
  try {
    await portalSessionRepo.deleteExpired();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete expired portal sessions' });
  }
};

// Route definitions
router.post('/', portalSessionWriteLimiter, createSession);
router.get('/:id', portalSessionReadLimiter, getSessionById);
router.get('/token/:token', portalSessionReadLimiter, getSessionByToken);
router.get('/contact/:contactId', portalSessionReadLimiter, getSessionsByContactId);
router.get('/contact/:contactId/active', portalSessionReadLimiter, getActiveSessionsByContactId);
router.post('/:id/access', portalSessionWriteLimiter, updateLastAccessed);
router.patch('/:id', portalSessionWriteLimiter, updateSession);
router.delete('/:id', portalSessionWriteLimiter, deleteSession);
router.delete('/expired', portalSessionWriteLimiter, deleteExpiredSessions);

export default router; 