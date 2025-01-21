import { Router, RequestHandler } from 'express';
import { ContactRepository } from '../../repositories/implementations/ContactRepository';
import { supabase } from '../../lib/supabase';
import { contactReadLimiter, contactWriteLimiter } from '../../middleware/rateLimiter';

const router = Router();
const contactRepo = new ContactRepository(supabase);

/**
 * @swagger
 * /api/contacts:
 *   post:
 *     summary: Create a new contact
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_id:
 *                 type: integer
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 */
const createContact: RequestHandler = async (req, res) => {
  try {
    const contact = await contactRepo.create(req.body);
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create contact' });
  }
};

/**
 * @swagger
 * /api/contacts/{id}:
 *   get:
 *     summary: Get contact by ID
 */
const getContactById: RequestHandler = async (req, res) => {
  try {
    const contact = await contactRepo.findById(Number(req.params.id));
    if (!contact) {
      res.status(404).json({ error: 'Contact not found' });
    } else {
      res.json(contact);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
};

/**
 * @swagger
 * /api/contacts/email/{email}:
 *   get:
 *     summary: Get contact by email
 */
const getContactByEmail: RequestHandler = async (req, res) => {
  try {
    const contact = await contactRepo.findByEmail(req.params.email);
    if (!contact) {
      res.status(404).json({ error: 'Contact not found' });
    } else {
      res.json(contact);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
};

/**
 * @swagger
 * /api/contacts/company/{companyId}:
 *   get:
 *     summary: Get all contacts for a company
 */
const getContactsByCompany: RequestHandler = async (req, res) => {
  try {
    const contacts = await contactRepo.findByCompanyId(Number(req.params.companyId));
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch company contacts' });
  }
};

/**
 * @swagger
 * /api/contacts/{id}:
 *   patch:
 *     summary: Update contact details
 */
const updateContact: RequestHandler = async (req, res) => {
  try {
    const contact = await contactRepo.update(Number(req.params.id), req.body);
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contact' });
  }
};

/**
 * @swagger
 * /api/contacts/{id}/archive:
 *   post:
 *     summary: Archive a contact
 */
const archiveContact: RequestHandler = async (req, res) => {
  try {
    await contactRepo.archive(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to archive contact' });
  }
};

/**
 * @swagger
 * /api/contacts/{id}/portal/enable:
 *   post:
 *     summary: Enable portal access for a contact
 */
const enablePortal: RequestHandler = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const contact = await contactRepo.enablePortal(Number(req.params.id), {
      email,
      username,
      password
    });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to enable portal access' });
  }
};

/**
 * @swagger
 * /api/contacts/{id}/portal/disable:
 *   post:
 *     summary: Disable portal access for a contact
 */
const disablePortal: RequestHandler = async (req, res) => {
  try {
    const contact = await contactRepo.disablePortal(Number(req.params.id));
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to disable portal access' });
  }
};

/**
 * @swagger
 * /api/contacts/{id}:
 *   delete:
 *     summary: Delete a contact
 */
const deleteContact: RequestHandler = async (req, res) => {
  try {
    await contactRepo.delete(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contact' });
  }
};

// Route definitions with rate limiting
router.post('/', contactWriteLimiter, createContact);
router.get('/email/:email', contactReadLimiter, getContactByEmail);
router.get('/company/:companyId', contactReadLimiter, getContactsByCompany);
router.get('/:id', contactReadLimiter, getContactById);
router.patch('/:id', contactWriteLimiter, updateContact);
router.post('/:id/archive', contactWriteLimiter, archiveContact);
router.post('/:id/portal/enable', contactWriteLimiter, enablePortal);
router.post('/:id/portal/disable', contactWriteLimiter, disablePortal);
router.delete('/:id', contactWriteLimiter, deleteContact);

export default router; 