import request from 'supertest';
import app from '../../index';
import { ContactRepository } from '@/repositories/implementations/ContactRepository';

// Mock functions need to be declared inside the mock
jest.mock('@/repositories/implementations/ContactRepository', () => {
  const mockCreate = jest.fn();
  const mockFindById = jest.fn();
  const mockFindByEmail = jest.fn();
  const mockFindByCompanyId = jest.fn();
  const mockUpdate = jest.fn();
  const mockArchive = jest.fn();
  const mockEnablePortal = jest.fn();
  const mockDisablePortal = jest.fn();
  const mockDelete = jest.fn();
  
  return {
    ContactRepository: jest.fn().mockImplementation(() => ({
      create: mockCreate,
      findById: mockFindById,
      findByEmail: mockFindByEmail,
      findByCompanyId: mockFindByCompanyId,
      update: mockUpdate,
      archive: mockArchive,
      enablePortal: mockEnablePortal,
      disablePortal: mockDisablePortal,
      delete: mockDelete,
    }))
  };
});

describe('Contact Routes', () => {
  let mockCreate: jest.Mock;
  let mockFindById: jest.Mock;
  let mockFindByEmail: jest.Mock;
  let mockFindByCompanyId: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockArchive: jest.Mock;
  let mockEnablePortal: jest.Mock;
  let mockDisablePortal: jest.Mock;
  let mockDelete: jest.Mock;

  beforeEach(() => {
    // Get the mock functions from the mocked class
    const mockRepo = new ContactRepository({} as any);
    mockCreate = mockRepo.create as jest.Mock;
    mockFindById = mockRepo.findById as jest.Mock;
    mockFindByEmail = mockRepo.findByEmail as jest.Mock;
    mockFindByCompanyId = mockRepo.findByCompanyId as jest.Mock;
    mockUpdate = mockRepo.update as jest.Mock;
    mockArchive = mockRepo.archive as jest.Mock;
    mockEnablePortal = mockRepo.enablePortal as jest.Mock;
    mockDisablePortal = mockRepo.disablePortal as jest.Mock;
    mockDelete = mockRepo.delete as jest.Mock;
    
    // Clear mocks
    jest.clearAllMocks();
  });

  const mockContact = {
    id: 1,
    company_id: 1,
    name: 'Test Contact',
    email: 'test@example.com',
    status: 'active',
    portal_enabled: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  describe('POST /api/contacts', () => {
    it('should create new contact', async () => {
      mockCreate.mockResolvedValue(mockContact);

      const response = await request(app)
        .post('/api/contacts')
        .send({
          company_id: 1,
          name: 'Test Contact',
          email: 'test@example.com'
        })
        .expect(201);

      expect(response.body).toEqual(mockContact);
      expect(mockCreate).toHaveBeenCalledWith({
        company_id: 1,
        name: 'Test Contact',
        email: 'test@example.com'
      });
    });

    it('should return 500 when creation fails', async () => {
      mockCreate.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/contacts')
        .send({
          company_id: 1,
          name: 'Test Contact',
          email: 'test@example.com'
        })
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to create contact' });
    });
  });

  describe('GET /api/contacts/:id', () => {
    it('should return contact by id', async () => {
      mockFindById.mockResolvedValue(mockContact);

      const response = await request(app)
        .get('/api/contacts/1')
        .expect(200);

      expect(response.body).toEqual(mockContact);
    });

    it('should return 404 when contact not found', async () => {
      mockFindById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/contacts/999')
        .expect(404);

      expect(response.body).toEqual({ error: 'Contact not found' });
    });
  });

  describe('GET /api/contacts/email/:email', () => {
    it('should return contact by email', async () => {
      mockFindByEmail.mockResolvedValue(mockContact);

      const response = await request(app)
        .get('/api/contacts/email/test@example.com')
        .expect(200);

      expect(response.body).toEqual(mockContact);
    });

    it('should return 404 when contact not found', async () => {
      mockFindByEmail.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/contacts/email/notfound@example.com')
        .expect(404);

      expect(response.body).toEqual({ error: 'Contact not found' });
    });
  });

  describe('GET /api/contacts/company/:companyId', () => {
    it('should return company contacts', async () => {
      const mockContacts = [mockContact];
      mockFindByCompanyId.mockResolvedValue(mockContacts);

      const response = await request(app)
        .get('/api/contacts/company/1')
        .expect(200);

      expect(response.body).toEqual(mockContacts);
    });
  });

  describe('PATCH /api/contacts/:id', () => {
    it('should update contact', async () => {
      const updatedContact = { ...mockContact, name: 'Updated Name' };
      mockUpdate.mockResolvedValue(updatedContact);

      const response = await request(app)
        .patch('/api/contacts/1')
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(response.body).toEqual(updatedContact);
    });
  });

  describe('POST /api/contacts/:id/archive', () => {
    it('should archive contact', async () => {
      mockArchive.mockResolvedValue(undefined);

      await request(app)
        .post('/api/contacts/1/archive')
        .expect(204);
    });
  });

  describe('POST /api/contacts/:id/portal/enable', () => {
    it('should enable portal access', async () => {
      const portalContact = { ...mockContact, portal_enabled: true };
      mockEnablePortal.mockResolvedValue(portalContact);

      const response = await request(app)
        .post('/api/contacts/1/portal/enable')
        .send({
          email: 'portal@example.com',
          username: 'testuser',
          password: 'password123'
        })
        .expect(200);

      expect(response.body).toEqual(portalContact);
    });
  });

  describe('POST /api/contacts/:id/portal/disable', () => {
    it('should disable portal access', async () => {
      const portalContact = { ...mockContact, portal_enabled: false };
      mockDisablePortal.mockResolvedValue(portalContact);

      const response = await request(app)
        .post('/api/contacts/1/portal/disable')
        .expect(200);

      expect(response.body).toEqual(portalContact);
    });
  });

  describe('DELETE /api/contacts/:id', () => {
    it('should delete contact', async () => {
      mockDelete.mockResolvedValue(undefined);

      await request(app)
        .delete('/api/contacts/1')
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
          .get('/api/contacts/1');
        
        if (response.status === 429) {
          limitHit = true;
          expect(response.body).toEqual({
            error: 'Too many contact read attempts, please try again later'
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
          .post('/api/contacts')
          .send({
            company_id: 1,
            name: 'Test Contact',
            email: 'test@example.com'
          });
        
        if (response.status === 429) {
          limitHit = true;
          expect(response.body).toEqual({
            error: 'Too many contact write attempts, please try again later'
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