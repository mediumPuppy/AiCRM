import request from 'supertest';
import app from '../../index';
import { ArticleRepository } from '../../repositories/implementations/ArticleRepository';

// Mock functions need to be declared inside the mock
jest.mock('../../repositories/implementations/ArticleRepository', () => {
  const mockFindAll = jest.fn();
  const mockFindById = jest.fn();
  const mockCreate = jest.fn();
  const mockSearch = jest.fn();
  
  return {
    ArticleRepository: jest.fn().mockImplementation(() => ({
      findAll: mockFindAll,
      findById: mockFindById,
      create: mockCreate,
      search: mockSearch,
    }))
  };
});

describe('Article Routes', () => {
  let mockFindAll: jest.Mock;
  let mockFindById: jest.Mock;
  let mockCreate: jest.Mock;
  let mockSearch: jest.Mock;

  beforeEach(() => {
    // Get the mock functions from the mocked class
    const mockRepo = new ArticleRepository({} as any);
    mockFindAll = mockRepo.findAll as jest.Mock;
    mockFindById = mockRepo.findById as jest.Mock;
    mockCreate = mockRepo.create as jest.Mock;
    mockSearch = mockRepo.search as jest.Mock;
    
    // Clear mocks
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
        metadata: null
      }];

      mockFindAll.mockResolvedValue({
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
        metadata: null
      }];

      mockFindAll.mockResolvedValue({
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

      expect(mockFindAll).toHaveBeenCalledWith({
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published_at: null,
        metadata: null
      };

      mockCreate.mockResolvedValue(mockArticle);

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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
        metadata: null
      }];

      mockSearch.mockResolvedValue(mockArticles);

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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
        metadata: null
      };

      mockFindById.mockResolvedValue(mockArticle);

      const response = await request(app)
        .get('/api/articles/1')
        .expect(200);

      expect(response.body).toEqual(mockArticle);
    });

    it('should return 404 for non-existent article', async () => {
      mockFindById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/articles/999')
        .expect(404);

      expect(response.body).toEqual({ error: 'Article not found' });
    });
  });
}); 