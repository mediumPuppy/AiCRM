import { Router, RequestHandler } from 'express';
import { TicketRepository } from '../../repositories/implementations/TicketRepository';
import { supabase } from '../../lib/supabase';
import { ticketReadLimiter, ticketWriteLimiter } from '../../middleware/rateLimiter';

const router = Router();
const ticketRepo = new TicketRepository(supabase);

/**
 * @swagger
 * /api/tickets:
 *   get:
 *     summary: Get tickets by company ID
 *     parameters:
 *       - in: query
 *         name: companyId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, in_progress, waiting, resolved, closed]
 */
const getTickets: RequestHandler = async (req, res) => {
  try {
    const {
      companyId,
      status,
      priority,
      search,
      page = 1,
      limit = 10
    } = req.query;

    if (!companyId) {
      res.status(400).json({ error: 'Company ID is required' });
      return;
    }

    const filterParams = {
      company_id: Number(companyId),
      status: status ? (Array.isArray(status) ? status.map(String) : [String(status)]) : undefined,
      priority: priority ? (Array.isArray(priority) ? priority.map(String) : [String(priority)]) : undefined,
      search: search as string,
      page: Number(page),
      limit: Number(limit)
    };


    const result = await ticketRepo.findFiltered(filterParams);
    res.json(result);
  } catch (error: any) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      details: error
    });
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};

/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     summary: Get ticket by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
const getTicketById: RequestHandler = async (req, res) => {
  try {
    const ticket = await ticketRepo.findById(Number(req.params.id));
    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }
    res.json(ticket);
  } catch (error) {
    console.error('DB Error:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
};

/**
 * @swagger
 * /api/tickets/contact/{contactId}:
 *   get:
 *     summary: Get tickets by contact ID
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: integer
 */
const getTicketsByContact: RequestHandler = async (req, res) => {
  try {
    const contactId = Number(req.params.contactId);
    if (!contactId) {
      res.status(400).json({ error: 'Contact ID is required' });
      return;
    }
    const tickets = await ticketRepo.findByContactId(contactId);
    res.json(tickets);
  } catch (error) {
    console.error('DB Error:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};

/**
 * @swagger
 * /api/tickets/assigned/{userId}:
 *   get:
 *     summary: Get tickets assigned to a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 */
const getTicketsByAssignee: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }
    const tickets = await ticketRepo.findByAssignedUser(userId);
    res.json(tickets);
  } catch (error) {
    console.error('DB Error:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};

/**
 * @swagger
 * /api/tickets:
 *   post:
 *     summary: Create a new ticket
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - company_id
 *               - subject
 *               - priority
 *               - status
 *             properties:
 *               company_id:
 *                 type: integer
 *               contact_id:
 *                 type: integer
 *               assigned_to:
 *                 type: integer
 *               subject:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, normal, high, urgent]
 *               status:
 *                 type: string
 *                 enum: [open, in_progress, waiting, resolved, closed]
 *               metadata:
 *                 type: object
 */
const createTicket: RequestHandler = async (req, res) => {
  try {
    if (!req.body.company_id || !req.body.subject) {
      res.status(400).json({ error: 'Company ID and subject are required' });
      return;
    }
    const ticket = await ticketRepo.create(req.body);
    res.status(201).json(ticket);
  } catch (error) {
    console.error('DB Error:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
};

/**
 * @swagger
 * /api/tickets/{id}:
 *   patch:
 *     summary: Update a ticket
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
const updateTicket: RequestHandler = async (req, res) => {
  try {
    const ticketId = Number(req.params.id);
    if (!ticketId) {
      res.status(400).json({ error: 'Ticket ID is required' });
      return;
    }
    const ticket = await ticketRepo.update(ticketId, req.body);
    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }
    res.json(ticket);
  } catch (error) {
    console.error('DB Error:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
};

/**
 * @swagger
 * /api/tickets/{id}:
 *   delete:
 *     summary: Delete a ticket
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
const deleteTicket: RequestHandler = async (req, res) => {
  try {
    const ticketId = Number(req.params.id);
    if (!ticketId) {
      res.status(400).json({ error: 'Ticket ID is required' });
      return;
    }
    await ticketRepo.delete(ticketId);
    res.status(204).send();
  } catch (error) {
    console.error('DB Error:', error);
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
};

const getTicketConversationHistory: RequestHandler = async (req, res) => {
  try {
    const ticketId = Number(req.params.id);
    
    // Get chat messages
    const { data: chatMessages } = await supabase
      .from('chat_sessions')
      .select(`
        chat_messages (
          id,
          message,
          sender_type,
          sender_id,
          created_at,
          metadata
        )
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    // Get notes
    const { data: notes } = await supabase
      .from('notes')
      .select('*')
      .eq('target_type', 'ticket')
      .eq('target_id', ticketId)
      .order('created_at', { ascending: true });

    // Combine and format the results
    const conversationHistory = [
      ...(chatMessages || []).flatMap(session => 
        (session.chat_messages || []).map(msg => ({
          id: msg.id,
          type: 'chat_message',
          message: msg.message,
          sender_type: msg.sender_type,
          sender_id: msg.sender_id,
          created_at: msg.created_at,
          metadata: msg.metadata
        }))
      ),
      ...(notes || []).map(note => ({
        id: note.id,
        type: 'note',
        message: note.note,
        sender_type: 'agent',
        sender_id: note.user_id,
        created_at: note.created_at
      }))
    ].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );


    res.json(conversationHistory);
  } catch (error) {
    console.error('Failed to fetch conversation history:', error);
    res.status(500).json({ error: 'Failed to fetch conversation history' });
  }
};

// Route definitions
router.get('/', ticketReadLimiter, getTickets);
router.get('/:id', ticketReadLimiter, getTicketById);
router.get('/contact/:contactId', ticketReadLimiter, getTicketsByContact);
router.get('/assigned/:userId', ticketReadLimiter, getTicketsByAssignee);
router.post('/', ticketWriteLimiter, createTicket);
router.patch('/:id', ticketWriteLimiter, updateTicket);
router.delete('/:id', ticketWriteLimiter, deleteTicket);
router.get('/:id/conversation', ticketReadLimiter, getTicketConversationHistory);

export default router; 