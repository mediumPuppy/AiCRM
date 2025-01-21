import request from 'supertest';
import app from '../../../src/index';
import { ArticleRepository } from '../../../src/repositories/implementations/ArticleRepository';

jest.mock('../../../src/lib/supabase', () => ({
  supabase: {}
}));

jest.mock('../../../src/repositories/implementations/ArticleRepository');

describe('Article Routes', () => {
  let mockArticleRepo: jest.Mocked<ArticleRepository>;

  beforeEach(() => {
    const MockArticleRepository = ArticleRepository as jest.MockedClass<typeof ArticleRepository>;
    mockArticleRepo = new MockArticleRepository({} as any) as jest.Mocked<ArticleRepository>;
    (ArticleRepository as jest.Mock).mockImplementation(() => mockArticleRepo);
    jest.clearAllMocks();
  });

  describe('GET /api/articles', () => {
    it('should return paginated list of articles', async () => {
      const mockArticles = [{
        id: 1,
        company_id: 1,
        title: 'Test Article',
        slug: 'test-article',
        content: 'Test content',
        status: 'published' as const,
        revision: 1,
        author_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
        published_at: new Date(),
        metadata: null
      }];

      mockArticleRepo.findAll.mockResolvedValue({
        articles: mockArticles,
        total: 1
      });

      const response = await request(app)
        .get('/api/articles')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.data).toEqual(mockArticles);
      expect(response.body.metadata).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        pages: 1
      });
    });

    it('should handle rate limiting', async () => {
      // Make more requests than allowed
      const requests = Array(1001).fill(null);
      
      for (const _ of requests) {
        const response = await request(app)
          .get('/api/articles')
          .query({ page: 1, limit: 10 });

        if (response.status === 429) {
          expect(response.body).toEqual({
            error: 'Too many article read attempts, please try again later'
          });
          break;
        }
      }
    });

    it('should handle category and published filters', async () => {
      const mockArticles = [{
        id: 1,
        company_id: 1,
        title: 'Test Article',
        slug: 'test-article',
        content: 'Test content',
        status: 'published' as const,
        revision: 1,
        author_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
        published_at: new Date(),
        metadata: null
      }];

      mockArticleRepo.findAll.mockResolvedValue({
        articles: mockArticles,
        total: 1
      });

      const response = await request(app)
        .get('/api/articles')
        .query({ 
          page: 1, 
          limit: 10,
          category: 'test',
          published: 'true'
        })
        .expect(200);

      expect(mockArticleRepo.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        category: 'test',
        published: true
      });
    });
  });

  describe('POST /api/articles', () => {
    it('should create new article', async () => {
      const mockArticle = {
        id: 1,
        company_id: 1,
        title: 'New Article',
        slug: 'new-article',
        content: 'New content',
        status: 'draft' as const,
        revision: 1,
        author_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
        published_at: null,
        metadata: null
      };

      mockArticleRepo.create.mockResolvedValue(mockArticle);

      const response = await request(app)
        .post('/api/articles')
        .send({
          company_id: 1,
          title: 'New Article',
          slug: 'new-article',
          content: 'New content',
          author_id: 1
        })
        .expect(201);

      expect(response.body).toEqual(mockArticle);
    });

    it('should handle rate limiting for write operations', async () => {
      // Make more requests than allowed
      const requests = Array(101).fill(null);
      
      for (const _ of requests) {
        const response = await request(app)
          .post('/api/articles')
          .send({
            company_id: 1,
            title: 'New Article',
            slug: 'new-article',
            content: 'New content',
            author_id: 1
          });

        if (response.status === 429) {
          expect(response.body).toEqual({
            error: 'Too many article write attempts, please try again later'
          });
          break;
        }
      }
    });
  });

  describe('GET /api/articles/search', () => {
    it('should search articles', async () => {
      const mockArticles = [{
        id: 1,
        company_id: 1,
        title: 'Test Article',
        slug: 'test-article',
        content: 'Test content',
        status: 'published' as const,
        revision: 1,
        author_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
        published_at: new Date(),
        metadata: null
      }];

      mockArticleRepo.search.mockResolvedValue(mockArticles);

      const response = await request(app)
        .get('/api/articles/search')
        .query({ q: 'test' })
        .expect(200);

      expect(response.body).toEqual(mockArticles);
    });
  });

  describe('GET /api/articles/:id', () => {
    it('should get article by id', async () => {
      const mockArticle = {
        id: 1,
        company_id: 1,
        title: 'Test Article',
        slug: 'test-article',
        content: 'Test content',
        status: 'published' as const,
        revision: 1,
        author_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
        published_at: new Date(),
        metadata: null
      };

      mockArticleRepo.findById.mockResolvedValue(mockArticle);

      const response = await request(app)
        .get('/api/articles/1')
        .expect(200);

      expect(response.body).toEqual(mockArticle);
    });

    it('should return 404 for non-existent article', async () => {
      mockArticleRepo.findById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/articles/999')
        .expect(404);

      expect(response.body).toEqual({ error: 'Article not found' });
    });
  });
}); 