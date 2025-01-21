import { Router, RequestHandler } from 'express';
import { TagRepository } from '../../repositories/implementations/TagRepository';
import { supabase } from '../../lib/supabase';
import { tagReadLimiter, tagWriteLimiter } from '../../middleware/rateLimiter';

const router = Router();
const tagRepo = new TagRepository(supabase);

/**
 * @swagger
 * /api/tags:
 *   post:
 *     summary: Create a new tag
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 */
const createTag: RequestHandler = async (req, res) => {
  try {
    const tag = await tagRepo.create(req.body);
    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tag' });
  }
};

/**
 * @swagger
 * /api/tags/{id}:
 *   get:
 *     summary: Get tag by ID
 */
const getTagById: RequestHandler = async (req, res) => {
  try {
    const tag = await tagRepo.findById(Number(req.params.id));
    if (!tag) {
      res.status(404).json({ error: 'Tag not found' });
    } else {
      res.json(tag);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tag' });
  }
};

/**
 * @swagger
 * /api/tags/company/{companyId}:
 *   get:
 *     summary: Get all tags for a company
 */
const getTagsByCompanyId: RequestHandler = async (req, res) => {
  try {
    const tags = await tagRepo.findByCompanyId(Number(req.params.companyId));
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch company tags' });
  }
};

/**
 * @swagger
 * /api/tags/{id}:
 *   patch:
 *     summary: Update a tag
 */
const updateTag: RequestHandler = async (req, res) => {
  try {
    const tag = await tagRepo.update(Number(req.params.id), req.body);
    res.json(tag);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update tag' });
  }
};

/**
 * @swagger
 * /api/tags/{id}:
 *   delete:
 *     summary: Delete a tag
 */
const deleteTag: RequestHandler = async (req, res) => {
  try {
    await tagRepo.delete(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete tag' });
  }
};

/**
 * @swagger
 * /api/tags/entity:
 *   post:
 *     summary: Add a tag to an entity
 */
const addTagToEntity: RequestHandler = async (req, res) => {
  try {
    const taggable = await tagRepo.addTagToEntity(req.body);
    res.status(201).json(taggable);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add tag to entity' });
  }
};

/**
 * @swagger
 * /api/tags/{tagId}/entity/{entityType}/{entityId}:
 *   delete:
 *     summary: Remove a tag from an entity
 */
const removeTagFromEntity: RequestHandler = async (req, res) => {
  try {
    await tagRepo.removeTagFromEntity(
      Number(req.params.tagId),
      req.params.entityType as any,
      Number(req.params.entityId)
    );
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove tag from entity' });
  }
};

/**
 * @swagger
 * /api/tags/entity/{entityType}/{entityId}:
 *   get:
 *     summary: Get all tags for an entity
 */
const getTagsByEntity: RequestHandler = async (req, res) => {
  try {
    const tags = await tagRepo.findTagsByEntity(
      req.params.entityType as any,
      Number(req.params.entityId)
    );
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch entity tags' });
  }
};

/**
 * @swagger
 * /api/tags/{tagId}/entities/{entityType}:
 *   get:
 *     summary: Get all entities of a type that have a specific tag
 */
const getEntitiesByTag: RequestHandler = async (req, res) => {
  try {
    const entityIds = await tagRepo.findEntitiesByTag(
      Number(req.params.tagId),
      req.params.entityType as any
    );
    res.json(entityIds);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tagged entities' });
  }
};

// Route definitions
router.post('/', tagWriteLimiter, createTag);
router.get('/:id', tagReadLimiter, getTagById);
router.get('/company/:companyId', tagReadLimiter, getTagsByCompanyId);
router.patch('/:id', tagWriteLimiter, updateTag);
router.delete('/:id', tagWriteLimiter, deleteTag);

// Taggable routes
router.post('/entity', tagWriteLimiter, addTagToEntity);
router.delete('/:tagId/entity/:entityType/:entityId', tagWriteLimiter, removeTagFromEntity);
router.get('/entity/:entityType/:entityId', tagReadLimiter, getTagsByEntity);
router.get('/:tagId/entities/:entityType', tagReadLimiter, getEntitiesByTag);

export default router; 