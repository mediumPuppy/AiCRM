import request from 'supertest';
import app from '../../../src/index';
import { ApiKeyRepository } from '../../../src/repositories/implementations/ApiKeyRepository';

jest.mock('../../../src/lib/supabase', () => ({
  supabase: {}
}));

jest.mock('../../../src/repositories/implementations/ApiKeyRepository');

describe('API Keys Routes', () => {
  let mockApiKeyRepo: jest.Mocked<ApiKeyRepository>;

  beforeEach(() => {
    const MockApiKeyRepository = ApiKeyRepository as jest.MockedClass<typeof ApiKeyRepository>;
    mockApiKeyRepo = new MockApiKeyRepository({} as any) as jest.Mocked<ApiKeyRepository>;
    (ApiKeyRepository as jest.Mock).mockImplementation(() => mockApiKeyRepo);
    jest.clearAllMocks();
  });

  describe('POST /api/api-keys/generate', () => {
    it('should generate new api key', async () => {
      const mockApiKey = {
        id: 1,
        company_id: 1,
        api_key: 'test-key-1',
        label: 'Test Key',
        expires_at: null,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockApiKeyRepo.create.mockResolvedValue(mockApiKey);

      const response = await request(app)
        .post('/api/api-keys/generate')
        .send({ companyId: 1, label: 'Test Key' })
        .expect(201);

      expect(response.body).toEqual(mockApiKey);
      expect(mockApiKeyRepo.create).toHaveBeenCalledWith({
        company_id: 1,
        label: 'Test Key',
        expires_at: null
      });
    });

    it('should return 500 when repository throws error', async () => {
      mockApiKeyRepo.create.mockRejectedValue(new Error('Database error'));

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
        created_at: new Date(),
        updated_at: new Date()
      };

      mockApiKeyRepo.findByKey.mockResolvedValue(mockApiKey);

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
      mockApiKeyRepo.findByKey.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/api-keys/authorize')
        .send({ apiKey: 'invalid-key' })
        .expect(401);

      expect(response.body).toEqual({ error: 'Invalid API key' });
    });

    it('should return 500 when authorization fails', async () => {
      mockApiKeyRepo.findByKey.mockRejectedValue(new Error('Database error'));

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
        created_at: new Date(),
        updated_at: new Date()
      };

      // Mock the create call for generation
      mockApiKeyRepo.create.mockResolvedValue(mockApiKey);
      // Mock the findByKey call for authorization
      mockApiKeyRepo.findByKey.mockResolvedValue(mockApiKey);

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
}); 