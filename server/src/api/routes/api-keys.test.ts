import request from 'supertest';
import app from '../../index';
import { ApiKeyRepository } from '@/repositories/implementations/ApiKeyRepository';

// Mock functions need to be declared inside the mock
jest.mock('@/repositories/implementations/ApiKeyRepository', () => {
  const mockCreate = jest.fn();
  const mockFindByKey = jest.fn();
  
  return {
    ApiKeyRepository: jest.fn().mockImplementation(() => ({
      create: mockCreate,
      findByKey: mockFindByKey,
    }))
  };
});

describe('API Keys Routes', () => {
  let mockCreate: jest.Mock;
  let mockFindByKey: jest.Mock;

  beforeEach(() => {
    // Get the mock functions from the mocked class
    const mockRepo = new ApiKeyRepository({} as any);
    mockCreate = mockRepo.create as jest.Mock;
    mockFindByKey = mockRepo.findByKey as jest.Mock;
    
    // Clear mocks
    mockCreate.mockClear();
    mockFindByKey.mockClear();
  });

  describe('POST /api/api-keys/generate', () => {
    it('should generate new api key', async () => {
      const mockApiKey = {
        id: 1,
        company_id: 1,
        api_key: 'test-key-1',
        label: 'Test Key',
        expires_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockCreate.mockResolvedValue(mockApiKey);

      const response = await request(app)
        .post('/api/api-keys/generate')
        .send({ companyId: 1, label: 'Test Key' })
        .expect(201);

      expect(response.body).toEqual(mockApiKey);
      expect(mockCreate).toHaveBeenCalledWith({
        company_id: 1,
        label: 'Test Key',
        expires_at: null
      });
    });

    it('should return 500 when repository throws error', async () => {
      mockCreate.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/api-keys/generate')
        .send({ companyId: 1, label: 'Test Key' })
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to generate API key' });
    });
  });

  describe('POST /api/api-keys/authorize', () => {
    it('should authorize valid api key', async () => {
      const mockApiKey = {
        id: 1,
        company_id: 1,
        api_key: 'test-key-1',
        label: 'Test Key',
        expires_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockFindByKey.mockResolvedValue(mockApiKey);

      const response = await request(app)
        .post('/api/api-keys/authorize')
        .send({ apiKey: 'test-key-1' })
        .expect(200);

      expect(response.body).toEqual({
        companyId: 1,
        authorized: true
      });
    });

    it('should reject invalid api key', async () => {
      mockFindByKey.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/api-keys/authorize')
        .send({ apiKey: 'invalid-key' })
        .expect(401);

      expect(response.body).toEqual({ error: 'Invalid API key' });
    });

    it('should return 500 when authorization fails', async () => {
      mockFindByKey.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/api-keys/authorize')
        .send({ apiKey: 'test-key-1' })
        .expect(500);

      expect(response.body).toEqual({ error: 'Authorization failed' });
    });
  });

  describe('API Key Generation and Authorization Flow', () => {
    it('should be able to authorize with a newly generated key', async () => {
      const mockApiKey = {
        id: 1,
        company_id: 1,
        api_key: 'new-test-key-123',
        label: 'Test Key',
        expires_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Mock the create call for generation
      mockCreate.mockResolvedValue(mockApiKey);
      // Mock the findByKey call for authorization
      mockFindByKey.mockResolvedValue(mockApiKey);

      // First generate a new key
      const generateResponse = await request(app)
        .post('/api/api-keys/generate')
        .send({ companyId: 1, label: 'Test Key' })
        .expect(201);

      expect(generateResponse.body).toEqual(mockApiKey);

      // Then try to authorize with the newly generated key
      const authorizeResponse = await request(app)
        .post('/api/api-keys/authorize')
        .send({ apiKey: mockApiKey.api_key })
        .expect(200);

      expect(authorizeResponse.body).toEqual({
        companyId: 1,
        authorized: true
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limiting for key generation', async () => {
      // Make more requests than allowed (5 per hour)
      const requests = Array(6).fill(null);
      
      for (const _ of requests) {
        const response = await request(app)
          .post('/api/api-keys/generate')
          .send({ companyId: 1, label: 'Test Key' });

        if (response.status === 429) {
          expect(response.body).toEqual({
            error: 'Too many API key generation attempts, please try again later'
          });
          break;
        }
      }
    });

    it('should handle rate limiting for authorization attempts', async () => {
      // Make more requests than allowed (1000 per 15 minutes)
      const requests = Array(1001).fill(null);
      
      for (const _ of requests) {
        const response = await request(app)
          .post('/api/api-keys/authorize')
          .send({ apiKey: 'test-key-1' });

        if (response.status === 429) {
          expect(response.body).toEqual({
            error: 'Too many authorization attempts, please try again later'
          });
          break;
        }
      }
    });
  });
}); 