import { Router, RequestHandler } from 'express';
import { AttachmentRepository } from '../../repositories/implementations/AttachmentRepository';
import { supabase } from '../../lib/supabase';
import { attachmentReadLimiter, attachmentWriteLimiter } from '../../middleware/rateLimiter';

const router = Router();
const attachmentRepo = new AttachmentRepository(supabase);

/**
 * @swagger
 * /api/attachments:
 *   post:
 *     summary: Create a new attachment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_id:
 *                 type: integer
 *               target_type:
 *                 type: string
 *                 enum: ['ticket', 'note', 'article', 'chat_message']
 *               target_id:
 *                 type: integer
 *               file_name:
 *                 type: string
 *               file_size:
 *                 type: number
 *               content_type:
 *                 type: string
 *               storage_path:
 *                 type: string
 */
const createAttachment: RequestHandler = async (req, res) => {
  try {
    const result = await attachmentRepo.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create attachment' });
  }
};

/**
 * @swagger
 * /api/attachments/{id}:
 *   get:
 *     summary: Get attachment by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
const getAttachment: RequestHandler = async (req, res) => {
  try {
    const attachment = await attachmentRepo.findById(Number(req.params.id));
    if (!attachment) {
      res.status(404).json({ error: 'Attachment not found' });
    } else {
      res.json(attachment);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attachment' });
  }
};

/**
 * @swagger
 * /api/attachments/company/{companyId}:
 *   get:
 *     summary: Get all attachments for a company
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: integer
 */
const getCompanyAttachments: RequestHandler = async (req, res) => {
  try {
    const attachments = await attachmentRepo.findByCompanyId(Number(req.params.companyId));
    res.json(attachments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch company attachments' });
  }
};

/**
 * @swagger
 * /api/attachments/target/{targetType}/{targetId}:
 *   get:
 *     summary: Get all attachments for a specific target
 *     parameters:
 *       - in: path
 *         name: targetType
 *         required: true
 *         schema:
 *           type: string
 *           enum: ['ticket', 'note', 'article', 'chat_message']
 *       - in: path
 *         name: targetId
 *         required: true
 *         schema:
 *           type: integer
 */
const getTargetAttachments: RequestHandler = async (req, res) => {
  try {
    const attachments = await attachmentRepo.findByTarget(
      req.params.targetType as any,
      Number(req.params.targetId)
    );
    res.json(attachments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch target attachments' });
  }
};

/**
 * @swagger
 * /api/attachments/{id}:
 *   patch:
 *     summary: Update attachment metadata
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               file_name:
 *                 type: string
 *               content_type:
 *                 type: string
 */
const updateAttachment: RequestHandler = async (req, res) => {
  try {
    const attachment = await attachmentRepo.update(Number(req.params.id), req.body);
    res.json(attachment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update attachment' });
  }
};

/**
 * @swagger
 * /api/attachments/{id}:
 *   delete:
 *     summary: Delete an attachment
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
const deleteAttachment: RequestHandler = async (req, res) => {
  try {
    await attachmentRepo.delete(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete attachment' });
  }
};

/**
 * @swagger
 * /api/attachments/target/{targetType}/{targetId}:
 *   delete:
 *     summary: Delete all attachments for a specific target
 *     parameters:
 *       - in: path
 *         name: targetType
 *         required: true
 *         schema:
 *           type: string
 *           enum: ['ticket', 'note', 'article', 'chat_message']
 *       - in: path
 *         name: targetId
 *         required: true
 *         schema:
 *           type: integer
 */
const deleteTargetAttachments: RequestHandler = async (req, res) => {
  try {
    await attachmentRepo.deleteByTarget(
      req.params.targetType as any,
      Number(req.params.targetId)
    );
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete target attachments' });
  }
};

// Route definitions with rate limiting
router.post('/', attachmentWriteLimiter, createAttachment);
router.get('/:id', attachmentReadLimiter, getAttachment);
router.get('/company/:companyId', attachmentReadLimiter, getCompanyAttachments);
router.get('/target/:targetType/:targetId', attachmentReadLimiter, getTargetAttachments);
router.patch('/:id', attachmentWriteLimiter, updateAttachment);
router.delete('/:id', attachmentWriteLimiter, deleteAttachment);
router.delete('/target/:targetType/:targetId', attachmentWriteLimiter, deleteTargetAttachments);

export default router; 