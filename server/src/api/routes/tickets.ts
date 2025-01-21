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
    const companyId = Number(req.query.companyId);
    const status = req.query.status as any;

    if (!companyId) {
      res.status(400).json({ error: 'Company ID is required' });
      return;
    }

    const tickets = status 
      ? await ticketRepo.findByStatus(companyId, status)
      : await ticketRepo.findByCompanyId(companyId);

    res.json(tickets);
  } catch (error) {
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
    const tickets = await ticketRepo.findByContactId(Number(req.params.contactId));
    res.json(tickets);
  } catch (error) {
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
    const tickets = await ticketRepo.findByAssignedUser(Number(req.params.userId));
    res.json(tickets);
  } catch (error) {
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
    const ticket = await ticketRepo.create(req.body);
    res.status(201).json(ticket);
  } catch (error) {
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
    const ticket = await ticketRepo.update(Number(req.params.id), req.body);
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update ticket' });
  }
};

/**
 * @swagger
 * /api/tickets/{id}/status:
 *   patch:
 *     summary: Update ticket status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
const updateTicketStatus: RequestHandler = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await ticketRepo.updateStatus(Number(req.params.id), status);
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update ticket status' });
  }
};

/**
 * @swagger
 * /api/tickets/{id}/assign:
 *   patch:
 *     summary: Assign ticket to user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
const assignTicket: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.body;
    const ticket = await ticketRepo.updateAssignment(Number(req.params.id), userId);
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign ticket' });
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
    await ticketRepo.delete(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
};

// Route definitions
router.get('/', ticketReadLimiter, getTickets);
router.get('/:id', ticketReadLimiter, getTicketById);
router.get('/contact/:contactId', ticketReadLimiter, getTicketsByContact);
router.get('/assigned/:userId', ticketReadLimiter, getTicketsByAssignee);
router.post('/', ticketWriteLimiter, createTicket);
router.patch('/:id', ticketWriteLimiter, updateTicket);
router.patch('/:id/status', ticketWriteLimiter, updateTicketStatus);
router.patch('/:id/assign', ticketWriteLimiter, assignTicket);
router.delete('/:id', ticketWriteLimiter, deleteTicket);

export default router; 