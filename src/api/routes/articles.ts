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
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: published
 *         schema:
 *           type: boolean
 */
const getArticles: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;
    const published = req.query.published === 'true';

    const { articles, total } = await articleRepo.findAll({
      page,
      limit,
      category,
      published
    });

    res.json({
      data: articles,
      metadata: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch articles' });
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
const getArticleById: RequestHandler = async (req, res, next) => {
    try {
      const article = await articleRepo.findById(Number(req.params.id));
      if (article) {
        res.json(article);
      } else {
        res.status(404).json({ error: 'Article not found' });
      }
    } catch (error) {
      next(error);
    }
  };
  
router.get('/search', articleReadLimiter, searchArticles);
router.get('/:id', articleReadLimiter, getArticleById);
router.get('/', articleReadLimiter, getArticles);


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
 *               category:
 *                 type: string
 */
const createArticle: RequestHandler = async (req, res) => {
  try {
    const article = await articleRepo.create(req.body);
    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create article' });
  }
};

router.post('/', articleWriteLimiter, createArticle);

// Additional endpoints for update, delete, publish/unpublish...

export default router; 