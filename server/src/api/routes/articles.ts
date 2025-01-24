import { Router, RequestHandler } from 'express';
import { ArticleRepository } from '../../repositories/implementations/ArticleRepository';
import { supabase } from '../../lib/supabase';
import { articleReadLimiter, articleWriteLimiter } from '../../middleware/rateLimiter';

const router = Router();
const articleRepo = new ArticleRepository(supabase);

/**
 * @swagger
 * /api/articles:
 *   get:
 *     summary: Get paginated list of articles
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ['all', 'draft', 'published', 'archived']
 */
const getArticles: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as 'all' | 'draft' | 'published' | 'archived';

    const { articles, total } = await articleRepo.findAll({
      page,
      limit,
      search,
      status: status === 'all' ? undefined : status,
    });

    res.json({
      articles,
      total,
    });
  } catch (error) {
    console.error('Article fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch articles',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * @swagger
 * /api/articles/search:
 *   get:
 *     summary: Search articles
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 */
const searchArticles: RequestHandler = async (req, res) => {
    try {
      const query = req.query.q as string;
      const articles = await articleRepo.search(query);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ error: 'Search failed' });
    }
  };

  /**
 * @swagger
 * /api/articles/{id}:
 *   get:
 *     summary: Get article by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
const getArticleById: RequestHandler = async (req, res) => {
  try {
    const article = await articleRepo.findById(Number(req.params.id));
    if (article) {
      res.json(article);
    } else {
      res.status(404).json({ error: 'Article not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch article' });
  }
};
  
/**
 * @swagger
 * /api/articles:
 *   post:
 *     summary: Create a new article
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: ['draft', 'published', 'archived']
 */
const createArticle: RequestHandler = async (req, res) => {
  try {
    const { title, content, status = 'draft', author_id, company_id } = req.body;
    
    if (!title || !content || !author_id || !company_id) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const article = await articleRepo.create({
      title,
      content,
      slug: '',  // provide an empty or placeholder string for slug
      author_id,
      company_id,
      status,
      metadata: {}
    });
    res.status(201).json(article);
  } catch (error) {
    console.error('Failed to create article:', error);
    res.status(500).json({ 
      error: 'Failed to create article',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * @swagger
 * /api/articles/{id}:
 *   put:
 *     summary: Update an article
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
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: ['draft', 'published', 'archived']
 */
const updateArticle: RequestHandler = async (req, res) => {
  try {
    const { title, content, status, author_id } = req.body;
    const articleId = Number(req.params.id);

    const existingArticle = await articleRepo.findById(articleId);
    if (!existingArticle) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }

    // Only allow certain status transitions
    if (status && existingArticle.status !== status) {
      const validTransitions: Record<string, string[]> = {
        draft: ['published', 'archived'],
        published: ['archived'],
        archived: ['draft']
      };

      if (!validTransitions[existingArticle.status]?.includes(status)) {
        res.status(400).json({ 
          error: 'Invalid status transition',
          details: `Cannot transition from ${existingArticle.status} to ${status}`
        });
        return;
      }
    }

    const article = await articleRepo.update(articleId, {
      title,
      content,
      status,
      metadata: existingArticle.metadata || {}
    });
    res.json(article);
  } catch (error) {
    console.error('Failed to update article:', error);
    res.status(500).json({ 
      error: 'Failed to update article',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * @swagger
 * /api/articles/{id}/publish:
 *   post:
 *     summary: Publish an article
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
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 */
const publishArticle: RequestHandler = async (req, res) => {
  try {
    const { title, content } = req.body;
    const articleId = Number(req.params.id);

    const existingArticle = await articleRepo.findById(articleId);
    if (!existingArticle) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }

    if (existingArticle.status === 'archived') {
      res.status(400).json({ 
        error: 'Cannot publish archived article',
        details: 'Article must be in draft status to be published'
      });
      return;
    }

    // First update the content if provided
    if (title || content) {
      await articleRepo.update(articleId, {
        ...(title && { title }),
        ...(content && { content })
      });
    }

    // Then publish
    const article = await articleRepo.publish(articleId);
    res.json(article);
  } catch (error) {
    console.error('Failed to publish article:', error);
    res.status(500).json({ 
      error: 'Failed to publish article',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * @swagger
 * /api/articles/{id}:
 *   delete:
 *     summary: Delete an article
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
const deleteArticle: RequestHandler = async (req, res) => {
  try {
    await articleRepo.delete(Number(req.params.id));
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete article' });
  }
};

router.get('/search', articleReadLimiter, searchArticles);
router.get('/:id', articleReadLimiter, getArticleById);
router.get('/', articleReadLimiter, getArticles);
router.post('/', articleWriteLimiter, createArticle);
router.put('/:id', articleWriteLimiter, updateArticle);
router.post('/:id/publish', articleWriteLimiter, publishArticle);
router.delete('/:id', articleWriteLimiter, deleteArticle);

export default router; 