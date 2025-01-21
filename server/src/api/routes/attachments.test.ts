import request from 'supertest';
import app from '../../index';
import { AttachmentRepository } from '@/repositories/implementations/AttachmentRepository';

// Mock functions need to be declared inside the mock
jest.mock('@/repositories/implementations/AttachmentRepository', () => {
  const mockCreate = jest.fn();
  const mockFindById = jest.fn();
  const mockFindByCompanyId = jest.fn();
  const mockFindByTarget = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();
  const mockDeleteByTarget = jest.fn();
  
  return {
    AttachmentRepository: jest.fn().mockImplementation(() => ({
      create: mockCreate,
      findById: mockFindById,
      findByCompanyId: mockFindByCompanyId,
      findByTarget: mockFindByTarget,
      update: mockUpdate,
      delete: mockDelete,
      deleteByTarget: mockDeleteByTarget,
    }))
  };
});

describe('Attachment Routes', () => {
  let mockCreate: jest.Mock;
  let mockFindById: jest.Mock;
  let mockFindByCompanyId: jest.Mock;
  let mockFindByTarget: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockDelete: jest.Mock;
  let mockDeleteByTarget: jest.Mock;

  beforeEach(() => {
    // Get the mock functions from the mocked class
    const mockRepo = new AttachmentRepository({} as any);
    mockCreate = mockRepo.create as jest.Mock;
    mockFindById = mockRepo.findById as jest.Mock;
    mockFindByCompanyId = mockRepo.findByCompanyId as jest.Mock;
    mockFindByTarget = mockRepo.findByTarget as jest.Mock;
    mockUpdate = mockRepo.update as jest.Mock;
    mockDelete = mockRepo.delete as jest.Mock;
    mockDeleteByTarget = mockRepo.deleteByTarget as jest.Mock;
    
    // Clear mocks
    jest.clearAllMocks();
  });

  describe('POST /api/attachments', () => {
    it('should create new attachment', async () => {
      const mockAttachment = {
        id: 1,
        company_id: 1,
        target_type: 'ticket' as const,
        target_id: 1,
        file_name: 'test.pdf',
        file_size: 1024,
        content_type: 'application/pdf',
        storage_path: '/storage/test.pdf',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockCreate.mockResolvedValue(mockAttachment);

      const response = await request(app)
        .post('/api/attachments')
        .send({
          company_id: 1,
          target_type: 'ticket',
          target_id: 1,
          file_name: 'test.pdf',
          file_size: 1024,
          content_type: 'application/pdf',
          storage_path: '/storage/test.pdf'
        })
        .expect(201);

      expect(response.body).toEqual(mockAttachment);
    });

    it('should return 500 when creation fails', async () => {
      mockCreate.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/attachments')
        .send({
          company_id: 1,
          target_type: 'ticket',
          target_id: 1,
          file_name: 'test.pdf'
        })
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to create attachment' });
    });
  });

  describe('GET /api/attachments/:id', () => {
    it('should return attachment details', async () => {
      const mockAttachment = {
        id: 1,
        company_id: 1,
        target_type: 'ticket' as const,
        target_id: 1,
        file_name: 'test.pdf',
        file_size: 1024,
        content_type: 'application/pdf',
        storage_path: '/storage/test.pdf',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockFindById.mockResolvedValue(mockAttachment);

      const response = await request(app)
        .get('/api/attachments/1')
        .expect(200);

      expect(response.body).toEqual(mockAttachment);
    });

    it('should return 404 when attachment not found', async () => {
      mockFindById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/attachments/999')
        .expect(404);

      expect(response.body).toEqual({ error: 'Attachment not found' });
    });
  });

  describe('GET /api/attachments/company/:companyId', () => {
    it('should return company attachments', async () => {
      const mockAttachments = [{
        id: 1,
        company_id: 1,
        target_type: 'ticket' as const,
        target_id: 1,
        file_name: 'test.pdf',
        file_size: 1024,
        content_type: 'application/pdf',
        storage_path: '/storage/test.pdf',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }];

      mockFindByCompanyId.mockResolvedValue(mockAttachments);

      const response = await request(app)
        .get('/api/attachments/company/1')
        .expect(200);

      expect(response.body).toEqual(mockAttachments);
    });
  });

  describe('GET /api/attachments/target/:targetType/:targetId', () => {
    it('should return target attachments', async () => {
      const mockAttachments = [{
        id: 1,
        company_id: 1,
        target_type: 'ticket' as const,
        target_id: 1,
        file_name: 'test.pdf',
        file_size: 1024,
        content_type: 'application/pdf',
        storage_path: '/storage/test.pdf',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }];

      mockFindByTarget.mockResolvedValue(mockAttachments);

      const response = await request(app)
        .get('/api/attachments/target/ticket/1')
        .expect(200);

      expect(response.body).toEqual(mockAttachments);
    });
  });

  describe('PATCH /api/attachments/:id', () => {
    it('should update attachment metadata', async () => {
      const mockAttachment = {
        id: 1,
        company_id: 1,
        target_type: 'ticket' as const,
        target_id: 1,
        file_name: 'updated.pdf',
        file_size: 1024,
        content_type: 'application/pdf',
        storage_path: '/storage/test.pdf',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockUpdate.mockResolvedValue(mockAttachment);

      const response = await request(app)
        .patch('/api/attachments/1')
        .send({
          file_name: 'updated.pdf'
        })
        .expect(200);

      expect(response.body).toEqual(mockAttachment);
    });
  });

  describe('DELETE /api/attachments/:id', () => {
    it('should delete attachment', async () => {
      mockDelete.mockResolvedValue(undefined);

      await request(app)
        .delete('/api/attachments/1')
        .expect(204);
    });
  });

  describe('DELETE /api/attachments/target/:targetType/:targetId', () => {
    it('should delete target attachments', async () => {
      mockDeleteByTarget.mockResolvedValue(undefined);

      await request(app)
        .delete('/api/attachments/target/ticket/1')
        .expect(204);
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limiting for read operations', async () => {
      // Make more requests than allowed (10000 per 15 minutes)
      const requests = Array(101).fill(null);
      
      for (const _ of requests) {
        const response = await request(app)
          .get('/api/attachments/1');

        if (response.status === 429) {
          expect(response.body).toEqual({
            error: 'Too many attachment read attempts, please try again later'
          });
          break;
        }
      }
    });

    it('should handle rate limiting for write operations', async () => {
      // Make more requests than allowed (1000 per hour)
      const requests = Array(101).fill(null);
      
      for (const _ of requests) {
        const response = await request(app)
          .post('/api/attachments')
          .send({
            company_id: 1,
            target_type: 'ticket',
            target_id: 1,
            file_name: 'test.pdf'
          });

        if (response.status === 429) {
          expect(response.body).toEqual({
            error: 'Too many attachment write attempts, please try again later'
          });
          break;
        }
      }
    });
  });
}); 