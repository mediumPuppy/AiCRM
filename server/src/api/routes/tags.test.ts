import request from 'supertest';
import app from '../../index';
import { TagRepository } from '@/repositories/implementations/TagRepository';

// Mock functions need to be declared inside the mock
jest.mock('@/repositories/implementations/TagRepository', () => {
  const mockCreate = jest.fn();
  const mockFindById = jest.fn();
  const mockFindByCompanyId = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();
  const mockAddTagToEntity = jest.fn();
  const mockRemoveTagFromEntity = jest.fn();
  const mockFindTagsByEntity = jest.fn();
  const mockFindEntitiesByTag = jest.fn();
  
  return {
    TagRepository: jest.fn().mockImplementation(() => ({
      create: mockCreate,
      findById: mockFindById,
      findByCompanyId: mockFindByCompanyId,
      update: mockUpdate,
      delete: mockDelete,
      addTagToEntity: mockAddTagToEntity,
      removeTagFromEntity: mockRemoveTagFromEntity,
      findTagsByEntity: mockFindTagsByEntity,
      findEntitiesByTag: mockFindEntitiesByTag,
    }))
  };
});

describe('Tag Routes', () => {
  let mockCreate: jest.Mock;
  let mockFindById: jest.Mock;
  let mockFindByCompanyId: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockDelete: jest.Mock;
  let mockAddTagToEntity: jest.Mock;
  let mockRemoveTagFromEntity: jest.Mock;
  let mockFindTagsByEntity: jest.Mock;
  let mockFindEntitiesByTag: jest.Mock;

  beforeEach(() => {
    // Get the mock functions from the mocked class
    const mockRepo = new TagRepository({} as any);
    mockCreate = mockRepo.create as jest.Mock;
    mockFindById = mockRepo.findById as jest.Mock;
    mockFindByCompanyId = mockRepo.findByCompanyId as jest.Mock;
    mockUpdate = mockRepo.update as jest.Mock;
    mockDelete = mockRepo.delete as jest.Mock;
    mockAddTagToEntity = mockRepo.addTagToEntity as jest.Mock;
    mockRemoveTagFromEntity = mockRepo.removeTagFromEntity as jest.Mock;
    mockFindTagsByEntity = mockRepo.findTagsByEntity as jest.Mock;
    mockFindEntitiesByTag = mockRepo.findEntitiesByTag as jest.Mock;
    
    // Clear mocks
    jest.clearAllMocks();
  });

  const mockTag = {
    id: 1,
    company_id: 1,
    name: 'Test Tag',
    color: '#FF0000',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const mockTaggable = {
    id: 1,
    tag_id: 1,
    entity_type: 'contact' as const,
    entity_id: 1,
    created_at: new Date().toISOString()
  };

  describe('POST /api/tags', () => {
    it('should create new tag', async () => {
      mockCreate.mockResolvedValue(mockTag);

      const response = await request(app)
        .post('/api/tags')
        .send({
          company_id: 1,
          name: 'Test Tag',
          color: '#FF0000'
        })
        .expect(201);

      expect(response.body).toEqual(mockTag);
      expect(mockCreate).toHaveBeenCalledWith({
        company_id: 1,
        name: 'Test Tag',
        color: '#FF0000'
      });
    });

    it('should return 500 when creation fails', async () => {
      mockCreate.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/tags')
        .send({
          company_id: 1,
          name: 'Test Tag',
          color: '#FF0000'
        })
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to create tag' });
    });
  });

  describe('GET /api/tags/:id', () => {
    it('should return tag by id', async () => {
      mockFindById.mockResolvedValue(mockTag);

      const response = await request(app)
        .get('/api/tags/1')
        .expect(200);

      expect(response.body).toEqual(mockTag);
    });

    it('should return 404 when tag not found', async () => {
      mockFindById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/tags/999')
        .expect(404);

      expect(response.body).toEqual({ error: 'Tag not found' });
    });
  });

  describe('GET /api/tags/company/:companyId', () => {
    it('should return company tags', async () => {
      const mockTags = [mockTag];
      mockFindByCompanyId.mockResolvedValue(mockTags);

      const response = await request(app)
        .get('/api/tags/company/1')
        .expect(200);

      expect(response.body).toEqual(mockTags);
    });
  });

  describe('PATCH /api/tags/:id', () => {
    it('should update tag', async () => {
      const updatedTag = { ...mockTag, name: 'Updated Tag' };
      mockUpdate.mockResolvedValue(updatedTag);

      const response = await request(app)
        .patch('/api/tags/1')
        .send({ name: 'Updated Tag' })
        .expect(200);

      expect(response.body).toEqual(updatedTag);
    });
  });

  describe('DELETE /api/tags/:id', () => {
    it('should delete tag', async () => {
      mockDelete.mockResolvedValue(undefined);

      await request(app)
        .delete('/api/tags/1')
        .expect(204);
    });
  });

  describe('POST /api/tags/entity', () => {
    it('should add tag to entity', async () => {
      mockAddTagToEntity.mockResolvedValue(mockTaggable);

      const response = await request(app)
        .post('/api/tags/entity')
        .send({
          tag_id: 1,
          entity_type: 'contact',
          entity_id: 1
        })
        .expect(201);

      expect(response.body).toEqual(mockTaggable);
    });
  });

  describe('DELETE /api/tags/:tagId/entity/:entityType/:entityId', () => {
    it('should remove tag from entity', async () => {
      mockRemoveTagFromEntity.mockResolvedValue(undefined);

      await request(app)
        .delete('/api/tags/1/entity/contact/1')
        .expect(204);

      expect(mockRemoveTagFromEntity).toHaveBeenCalledWith(1, 'contact', 1);
    });
  });

  describe('GET /api/tags/entity/:entityType/:entityId', () => {
    it('should return entity tags', async () => {
      const mockTags = [mockTag];
      mockFindTagsByEntity.mockResolvedValue(mockTags);

      const response = await request(app)
        .get('/api/tags/entity/contact/1')
        .expect(200);

      expect(response.body).toEqual(mockTags);
    });
  });

  describe('GET /api/tags/:tagId/entities/:entityType', () => {
    it('should return tagged entities', async () => {
      const entityIds = [1, 2, 3];
      mockFindEntitiesByTag.mockResolvedValue(entityIds);

      const response = await request(app)
        .get('/api/tags/1/entities/contact')
        .expect(200);

      expect(response.body).toEqual(entityIds);
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limiting for read operations', async () => {
      const requests = Array(10001).fill(null); // Just over the 10000 limit
      let limitHit = false;
      let successCount = 0;
      
      for (const _ of requests) {
        const response = await request(app)
          .get('/api/tags/1');
        
        if (response.status === 429) {
          limitHit = true;
          expect(response.body).toEqual({
            error: 'Too many tag read attempts, please try again later'
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
          .post('/api/tags')
          .send({
            company_id: 1,
            name: 'Test Tag',
            color: '#FF0000'
          });
        
        if (response.status === 429) {
          limitHit = true;
          expect(response.body).toEqual({
            error: 'Too many tag write attempts, please try again later'
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