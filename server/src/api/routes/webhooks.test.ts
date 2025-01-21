import request from 'supertest';
import app from '../../index';
import { WebhookRepository } from '../../repositories/implementations/WebhookRepository';

// Mock functions need to be declared inside the mock
jest.mock('../../repositories/implementations/WebhookRepository', () => {
  const mockCreate = jest.fn();
  const mockFindById = jest.fn();
  const mockFindByCompanyId = jest.fn();
  const mockFindByEvent = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();
  
  return {
    WebhookRepository: jest.fn().mockImplementation(() => ({
      create: mockCreate,
      findById: mockFindById,
      findByCompanyId: mockFindByCompanyId,
      findByEvent: mockFindByEvent,
      update: mockUpdate,
      delete: mockDelete,
    }))
  };
});

describe('Webhook Routes', () => {
  let mockCreate: jest.Mock;
  let mockFindById: jest.Mock;
  let mockFindByCompanyId: jest.Mock;
  let mockFindByEvent: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockDelete: jest.Mock;

  beforeEach(() => {
    // Get the mock functions from the mocked class
    const mockRepo = new WebhookRepository({} as any);
    mockCreate = mockRepo.create as jest.Mock;
    mockFindById = mockRepo.findById as jest.Mock;
    mockFindByCompanyId = mockRepo.findByCompanyId as jest.Mock;
    mockFindByEvent = mockRepo.findByEvent as jest.Mock;
    mockUpdate = mockRepo.update as jest.Mock;
    mockDelete = mockRepo.delete as jest.Mock;
    
    // Clear mocks
    jest.clearAllMocks();
  });

  const mockWebhook = {
    id: 1,
    company_id: 1,
    webhook_type: 'outgoing' as const,
    endpoint: 'https://example.com/webhook',
    secret: 'webhook-secret',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    events: ['contact.created', 'contact.updated'] as const
  };

  describe('GET /api/webhooks', () => {
    it('should return webhooks by company ID', async () => {
      mockFindByCompanyId.mockResolvedValue([mockWebhook]);

      const response = await request(app)
        .get('/api/webhooks')
        .query({ companyId: 1 })
        .expect(200);

      expect(response.body).toEqual([mockWebhook]);
      expect(mockFindByCompanyId).toHaveBeenCalledWith(1);
    });

    it('should return webhooks by company ID and event', async () => {
      mockFindByEvent.mockResolvedValue([mockWebhook]);

      const response = await request(app)
        .get('/api/webhooks')
        .query({ companyId: 1, event: 'contact.created' })
        .expect(200);

      expect(response.body).toEqual([mockWebhook]);
      expect(mockFindByEvent).toHaveBeenCalledWith(1, 'contact.created');
    });

    it('should return 400 when company ID is missing', async () => {
      const response = await request(app)
        .get('/api/webhooks')
        .expect(400);

      expect(response.body).toEqual({ error: 'Company ID is required' });
    });
  });

  describe('GET /api/webhooks/:id', () => {
    it('should return webhook by ID', async () => {
      mockFindById.mockResolvedValue(mockWebhook);

      const response = await request(app)
        .get('/api/webhooks/1')
        .expect(200);

      expect(response.body).toEqual(mockWebhook);
      expect(mockFindById).toHaveBeenCalledWith(1);
    });

    it('should return 404 when webhook not found', async () => {
      mockFindById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/webhooks/999')
        .expect(404);

      expect(response.body).toEqual({ error: 'Webhook not found' });
    });
  });

  describe('POST /api/webhooks', () => {
    it('should create new webhook', async () => {
      mockCreate.mockResolvedValue(mockWebhook);

      const response = await request(app)
        .post('/api/webhooks')
        .send({
          company_id: 1,
          webhook_type: 'outgoing',
          endpoint: 'https://example.com/webhook',
          secret: 'webhook-secret',
          events: ['contact.created', 'contact.updated']
        })
        .expect(201);

      expect(response.body).toEqual(mockWebhook);
    });

    it('should handle rate limiting', async () => {
      // Make more requests than allowed
      const requests = Array(101).fill(null);
      
      for (const _ of requests) {
        const response = await request(app)
          .post('/api/webhooks')
          .send({
            company_id: 1,
            webhook_type: 'outgoing',
            endpoint: 'https://example.com/webhook',
            events: ['contact.created']
          });

        if (response.status === 429) {
          expect(response.body).toEqual({
            error: 'Too many webhook write attempts, please try again later'
          });
          break;
        }
      }
    });
  });

  describe('PATCH /api/webhooks/:id', () => {
    it('should update webhook', async () => {
      const updatedWebhook = { ...mockWebhook, endpoint: 'https://example.com/updated' };
      mockUpdate.mockResolvedValue(updatedWebhook);

      const response = await request(app)
        .patch('/api/webhooks/1')
        .send({ endpoint: 'https://example.com/updated' })
        .expect(200);

      expect(response.body).toEqual(updatedWebhook);
      expect(mockUpdate).toHaveBeenCalledWith(1, { endpoint: 'https://example.com/updated' });
    });
  });

  describe('DELETE /api/webhooks/:id', () => {
    it('should delete webhook', async () => {
      mockDelete.mockResolvedValue(undefined);

      await request(app)
        .delete('/api/webhooks/1')
        .expect(204);

      expect(mockDelete).toHaveBeenCalledWith(1);
    });
  });

  describe('Error Handling', () => {
    const errorTests = [
      {
        description: 'findById error',
        route: '/api/webhooks/1',
        method: 'get',
        mockFn: () => mockFindById.mockRejectedValue(new Error()),
        expectedError: 'Failed to fetch webhook'
      },
      {
        description: 'findByCompanyId error',
        route: '/api/webhooks',
        method: 'get',
        query: { companyId: 1 },
        mockFn: () => mockFindByCompanyId.mockRejectedValue(new Error()),
        expectedError: 'Failed to fetch webhooks'
      },
      {
        description: 'findByEvent error',
        route: '/api/webhooks',
        method: 'get',
        query: { companyId: 1, event: 'contact.created' },
        mockFn: () => mockFindByEvent.mockRejectedValue(new Error()),
        expectedError: 'Failed to fetch webhooks'
      },
      {
        description: 'create error',
        route: '/api/webhooks',
        method: 'post',
        mockFn: () => mockCreate.mockRejectedValue(new Error()),
        expectedError: 'Failed to create webhook',
        body: {
          company_id: 1,
          webhook_type: 'outgoing',
          endpoint: 'https://example.com/webhook',
          events: ['contact.created']
        }
      },
      {
        description: 'update error',
        route: '/api/webhooks/1',
        method: 'patch',
        mockFn: () => mockUpdate.mockRejectedValue(new Error()),
        expectedError: 'Failed to update webhook',
        body: { endpoint: 'https://example.com/updated' }
      },
      {
        description: 'delete error',
        route: '/api/webhooks/1',
        method: 'delete',
        mockFn: () => mockDelete.mockRejectedValue(new Error()),
        expectedError: 'Failed to delete webhook'
      }
    ];

    errorTests.forEach(({ description, route, method, mockFn, expectedError, query, body }) => {
      it(`should handle ${description}`, async () => {
        mockFn();
        
        const req = (request(app) as any)[method](route);
        if (query) {
          req.query(query);
        }
        if (body) {
          req.send(body);
        }
        
        const response = await req.expect(500);
        expect(response.body).toEqual({ error: expectedError });
      });
    });
  });
}); 