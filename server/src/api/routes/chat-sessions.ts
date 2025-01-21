import { Router, RequestHandler } from 'express'
import { ChatRepository } from '@/repositories/implementations/ChatRepository'
import { supabase } from '@/lib/supabase'

const router = Router()
const chatRepo = new ChatRepository(supabase)

/**
 * @swagger
 * /api/chat/sessions:
 *   post:
 *     summary: Create a new chat session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyId:
 *                 type: integer
 *               contactId:
 *                 type: integer
 *               agentId:
 *                 type: integer
 *               ticketId:
 *                 type: integer
 *               metadata:
 *                 type: object
 */
const createSession: RequestHandler = async (req, res) => {
  try {
    const result = await chatRepo.createSession(req.body)
    res.status(201).json(result)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create chat session' })
  }
}

/**
 * @swagger
 * /api/chat/sessions/{id}:
 *   get:
 *     summary: Get a specific chat session details
 */
const getSession: RequestHandler = async (req, res) => {
  try {
    const session = await chatRepo.findSessionById(Number(req.params.id))
    if (!session) {
      res.status(404).json({ error: 'Chat session not found' })
    } else {
      res.json(session)
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat session' })
  }
}

/**
 * @swagger
 * /api/chat/sessions/company/{companyId}:
 *   get:
 *     summary: List all chat sessions for a company
 */
const getCompanySessions: RequestHandler = async (req, res) => {
  try {
    const sessions = await chatRepo.findSessionsByCompanyId(Number(req.params.companyId))
    res.json(sessions)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch company chat sessions' })
  }
}

/**
 * @swagger
 * /api/chat/sessions/company/{companyId}/status/{status}:
 *   get:
 *     summary: List chat sessions by status
 */
const getSessionsByStatus: RequestHandler = async (req, res) => {
  try {
    const sessions = await chatRepo.findSessionsByStatus(
      Number(req.params.companyId),
      req.params.status as any
    )
    res.json(sessions)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat sessions by status' })
  }
}

/**
 * @swagger
 * /api/chat/sessions/contact/{contactId}:
 *   get:
 *     summary: List chat sessions for a contact
 */
const getContactSessions: RequestHandler = async (req, res) => {
  try {
    const sessions = await chatRepo.findSessionsByContact(Number(req.params.contactId))
    res.json(sessions)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contact chat sessions' })
  }
}

/**
 * @swagger
 * /api/chat/sessions/agent/{agentId}:
 *   get:
 *     summary: List chat sessions assigned to an agent
 */
const getAgentSessions: RequestHandler = async (req, res) => {
  try {
    const sessions = await chatRepo.findSessionsByAgent(Number(req.params.agentId))
    res.json(sessions)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch agent chat sessions' })
  }
}

/**
 * @swagger
 * /api/chat/sessions/{id}:
 *   patch:
 *     summary: Update chat session
 */
const updateSession: RequestHandler = async (req, res) => {
  try {
    const session = await chatRepo.updateSession(Number(req.params.id), req.body)
    res.json(session)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update chat session' })
  }
}

/**
 * @swagger
 * /api/chat/sessions/{id}/close:
 *   post:
 *     summary: Close a chat session
 */
const closeSession: RequestHandler = async (req, res) => {
  try {
    const session = await chatRepo.closeSession(Number(req.params.id))
    res.json(session)
  } catch (error) {
    res.status(500).json({ error: 'Failed to close chat session' })
  }
}

// Route definitions
router.post('/', createSession)
router.get('/:id', getSession)
router.get('/company/:companyId', getCompanySessions)
router.get('/company/:companyId/status/:status', getSessionsByStatus)
router.get('/contact/:contactId', getContactSessions)
router.get('/agent/:agentId', getAgentSessions)
router.patch('/:id', updateSession)
router.post('/:id/close', closeSession)

export default router 