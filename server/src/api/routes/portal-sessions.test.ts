import request from 'supertest';
import app from '../../index';
import { PortalSessionRepository } from '@/repositories/implementations/PortalSessionRepository';

// Mock functions need to be declared inside the mock
jest.mock('@/repositories/implementations/PortalSessionRepository', () => {
  const mockCreate = jest.fn();
  const mockFindById = jest.fn();
  const mockFindByToken = jest.fn();
  const mockFindByContactId = jest.fn();
  const mockFindActiveByContactId = jest.fn();
  const mockUpdateLastAccessed = jest.fn();
  const mockDelete = jest.fn();
  const mockDeleteExpired = jest.fn();
  const mockUpdate = jest.fn();
  
  return {
    PortalSessionRepository: jest.fn().mockImplementation(() => ({
      create: mockCreate,
      findById: mockFindById,
      findByToken: mockFindByToken,
      findByContactId: mockFindByContactId,
      findActiveByContactId: mockFindActiveByContactId,
      updateLastAccessed: mockUpdateLastAccessed,
      delete: mockDelete,
      deleteExpired: mockDeleteExpired,
      update: mockUpdate,
    }))
  };
});

describe('Portal Session Routes', () => {
  let mockCreate: jest.Mock;
  let mockFindById: jest.Mock;
  let mockFindByToken: jest.Mock;
  let mockFindByContactId: jest.Mock;
  let mockFindActiveByContactId: jest.Mock;
  let mockUpdateLastAccessed: jest.Mock;
  let mockDelete: jest.Mock;
  let mockDeleteExpired: jest.Mock;
  let mockUpdate: jest.Mock;

  beforeEach(() => {
    // Get the mock functions from the mocked class
    const mockRepo = new PortalSessionRepository({} as any);
    mockCreate = mockRepo.create as jest.Mock;
    mockFindById = mockRepo.findById as jest.Mock;
    mockFindByToken = mockRepo.findByToken as jest.Mock;
    mockFindByContactId = mockRepo.findByContactId as jest.Mock;
    mockFindActiveByContactId = mockRepo.findActiveByContactId as jest.Mock;
    mockUpdateLastAccessed = mockRepo.updateLastAccessed as jest.Mock;
    mockDelete = mockRepo.delete as jest.Mock;
    mockDeleteExpired = mockRepo.deleteExpired as jest.Mock;
    mockUpdate = mockRepo.update as jest.Mock;
    
    // Clear mocks
    jest.clearAllMocks();
  });

  const mockSession = {
    id: 1,
    contact_id: 1,
    token: 'test-token',
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    last_accessed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  describe('POST /api/portal-sessions', () => {
    it('should create new portal session', async () => {
      mockCreate.mockResolvedValue(mockSession);

      const response = await request(app)
        .post('/api/portal-sessions')
        .send({
          contact_id: 1,
          token: 'test-token',
          expires_at: mockSession.expires_at
        })
        .expect(201);

      expect(response.body).toEqual(mockSession);
      expect(mockCreate).toHaveBeenCalledWith({
        contact_id: 1,
        token: 'test-token',
        expires_at: mockSession.expires_at
      });
    });

    it('should return 500 when creation fails', async () => {
      mockCreate.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/portal-sessions')
        .send({
          contact_id: 1,
          token: 'test-token',
          expires_at: mockSession.expires_at
        })
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to create portal session' });
    });
  });

  describe('GET /api/portal-sessions/:id', () => {
    it('should return portal session by id', async () => {
      mockFindById.mockResolvedValue(mockSession);

      const response = await request(app)
        .get('/api/portal-sessions/1')
        .expect(200);

      expect(response.body).toEqual(mockSession);
    });

    it('should return 404 when session not found', async () => {
      mockFindById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/portal-sessions/999')
        .expect(404);

      expect(response.body).toEqual({ error: 'Portal session not found' });
    });
  });

  describe('GET /api/portal-sessions/token/:token', () => {
    it('should return portal session by token', async () => {
      mockFindByToken.mockResolvedValue(mockSession);

      const response = await request(app)
        .get('/api/portal-sessions/token/test-token')
        .expect(200);

      expect(response.body).toEqual(mockSession);
    });

    it('should return 404 when session not found', async () => {
      mockFindByToken.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/portal-sessions/token/invalid-token')
        .expect(404);

      expect(response.body).toEqual({ error: 'Portal session not found' });
    });
  });

  describe('GET /api/portal-sessions/contact/:contactId', () => {
    it('should return contact portal sessions', async () => {
      const mockSessions = [mockSession];
      mockFindByContactId.mockResolvedValue(mockSessions);

      const response = await request(app)
        .get('/api/portal-sessions/contact/1')
        .expect(200);

      expect(response.body).toEqual(mockSessions);
    });
  });

  describe('GET /api/portal-sessions/contact/:contactId/active', () => {
    it('should return active contact portal sessions', async () => {
      const mockSessions = [mockSession];
      mockFindActiveByContactId.mockResolvedValue(mockSessions);

      const response = await request(app)
        .get('/api/portal-sessions/contact/1/active')
        .expect(200);

      expect(response.body).toEqual(mockSessions);
    });
  });

  describe('POST /api/portal-sessions/:id/access', () => {
    it('should update last accessed time', async () => {
      const updatedSession = { ...mockSession, last_accessed_at: new Date().toISOString() };
      mockUpdateLastAccessed.mockResolvedValue(updatedSession);

      const response = await request(app)
        .post('/api/portal-sessions/1/access')
        .expect(200);

      expect(response.body).toEqual(updatedSession);
    });
  });

  describe('PATCH /api/portal-sessions/:id', () => {
    it('should update portal session', async () => {
      const updatedSession = { ...mockSession, expires_at: new Date().toISOString() };
      mockUpdate.mockResolvedValue(updatedSession);

      const response = await request(app)
        .patch('/api/portal-sessions/1')
        .send({ expires_at: updatedSession.expires_at })
        .expect(200);

      expect(response.body).toEqual(updatedSession);
    });
  });

  describe('DELETE /api/portal-sessions/:id', () => {
    it('should delete portal session', async () => {
      mockDelete.mockResolvedValue(undefined);

      await request(app)
        .delete('/api/portal-sessions/1')
        .expect(204);
    });
  });

  describe('DELETE /api/portal-sessions/expired', () => {
    it('should delete expired portal sessions', async () => {
      mockDeleteExpired.mockResolvedValue(undefined);

      await request(app)
        .delete('/api/portal-sessions/expired')
        .expect(204);
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limiting for read operations', async () => {
      const requests = Array(10001).fill(null); // Just over the 10000 limit
      let limitHit = false;
      let successCount = 0;
      
      for (const _ of requests) {
        const response = await request(app)
          .get('/api/portal-sessions/1');
        
        if (response.status === 429) {
          limitHit = true;
          expect(response.body).toEqual({
            error: 'Too many portal session read attempts, please try again later'
          });
          break;
        } else if (response.status === 200) {
          successCount++;
        }
      }
      
      expect(limitHit).toBe(true);
      expect(successCount).toBeLessThanOrEqual(10000);
    }, 75000); // 75 seconds

    it('should handle rate limiting for write operations', async () => {
      const requests = Array(1001).fill(null); // Just over the 1000 limit
      let limitHit = false;
      let successCount = 0;
      
      for (const _ of requests) {
        const response = await request(app)
          .post('/api/portal-sessions')
          .send({
            contact_id: 1,
            token: 'test-token',
            expires_at: mockSession.expires_at
          });
        
        if (response.status === 429) {
          limitHit = true;
          expect(response.body).toEqual({
            error: 'Too many portal session write attempts, please try again later'
          });
          break;
        } else if (response.status === 201) {
          successCount++;
        }
      }
      
      expect(limitHit).toBe(true);
      expect(successCount).toBeLessThanOrEqual(1000);
    }, 75000); // 75 seconds
  });
}); 