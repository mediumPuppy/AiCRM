import { Router, RequestHandler } from 'express';
import { NoteRepository } from '../../repositories/implementations/NoteRepository';
import { supabase } from '../../lib/supabase';
import { noteReadLimiter, noteWriteLimiter } from '../../middleware/rateLimiter';
import { TargetType } from '../../types/note.types';

const router = Router();
const noteRepo = new NoteRepository(supabase);

/**
 * @swagger
 * /api/notes:
 *   post:
 *     summary: Create a new note
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_id:
 *                 type: integer
 *               user_id:
 *                 type: integer
 *               target_type:
 *                 type: string
 *                 enum: [ticket, contact]
 *               target_id:
 *                 type: integer
 *               note:
 *                 type: string
 */
const createNote: RequestHandler = async (req, res) => {
  try {
    const note = await noteRepo.create(req.body);
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create note' });
  }
};

/**
 * @swagger
 * /api/notes/{id}:
 *   get:
 *     summary: Get note by ID
 */
const getNoteById: RequestHandler = async (req, res) => {
  try {
    const note = await noteRepo.findById(Number(req.params.id));
    if (!note) {
      res.status(404).json({ error: 'Note not found' });
    } else {
      res.json(note);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch note' });
  }
};

/**
 * @swagger
 * /api/notes/company/{companyId}:
 *   get:
 *     summary: Get all notes for a company
 */
const getNotesByCompany: RequestHandler = async (req, res) => {
  try {
    const notes = await noteRepo.findByCompanyId(Number(req.params.companyId));
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch company notes' });
  }
};

/**
 * @swagger
 * /api/notes/user/{userId}:
 *   get:
 *     summary: Get all notes by a user
 */
const getNotesByUser: RequestHandler = async (req, res) => {
  try {
    const notes = await noteRepo.findByUserId(Number(req.params.userId));
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user notes' });
  }
};

/**
 * @swagger
 * /api/notes/target/{targetType}/{targetId}:
 *   get:
 *     summary: Get all notes for a specific target (ticket or contact)
 */
const getNotesByTarget: RequestHandler = async (req, res) => {
  try {
    const notes = await noteRepo.findByTarget(
      req.params.targetType as TargetType,
      Number(req.params.targetId)
    );
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch target notes' });
  }
};

/**
 * @swagger
 * /api/notes/{id}:
 *   patch:
 *     summary: Update note content
 */
const updateNote: RequestHandler = async (req, res) => {
  try {
    const note = await noteRepo.update(Number(req.params.id), req.body);
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update note' });
  }
};

/**
 * @swagger
 * /api/notes/{id}:
 *   delete:
 *     summary: Delete a note
 */
const deleteNote: RequestHandler = async (req, res) => {
  try {
    await noteRepo.delete(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
};

// Route definitions with rate limiting
router.post('/', noteWriteLimiter, createNote);
router.get('/:id', noteReadLimiter, getNoteById);
router.get('/company/:companyId', noteReadLimiter, getNotesByCompany);
router.get('/user/:userId', noteReadLimiter, getNotesByUser);
router.get('/target/:targetType/:targetId', noteReadLimiter, getNotesByTarget);
router.patch('/:id', noteWriteLimiter, updateNote);
router.delete('/:id', noteWriteLimiter, deleteNote);

export default router; 