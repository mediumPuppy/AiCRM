import request from 'supertest';
import app from '../../../src/index';
import { ApiKeyRepository } from '../../../src/repositories/implementations/ApiKeyRepository';

jest.mock('../../../src/repositories/implementations/ApiKeyRepository');

describe('API Keys Routes', () => {
  let mockApiKeyRepo: jest.Mocked<ApiKeyRepository>;

  beforeEach(() => {
    mockApiKeyRepo = new ApiKeyRepository({} as any) as jest.Mocked<ApiKeyRepository>;
    jest.clearAllMocks();
  });

  describe('GET /api/api-keys/company/:companyId', () => {
    it('should return api keys for a company', async () => {
      const mockApiKeys = [
        {
          id: 1,
          company_id: 1,
          api_key: 'test-key-1',
          label: 'Test Key 1',
          created_at: new Date(),
          updated_at: new Date(),
          expires_at: null
        },
        {
          id: 2,
          company_id: 1,
          api_key: 'test-key-2',
          label: 'Test Key 2',
          created_at: new Date(),
          updated_at: new Date(),
          expires_at: null
        }
      ];

      mockApiKeyRepo.findByCompanyId.mockResolvedValue(mockApiKeys);

      const response = await request(app)
        .get('/api/api-keys/company/1')
        .expect(200);

      expect(response.body).toEqual(mockApiKeys);
      expect(mockApiKeyRepo.findByCompanyId).toHaveBeenCalledWith(1);
    });

    it('should return 500 when repository throws error', async () => {
      mockApiKeyRepo.findByCompanyId.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/api-keys/company/1')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch API Keys' });
    });
  });
}); 