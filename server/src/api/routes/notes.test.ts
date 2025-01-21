import request from 'supertest';
import app from '../../index';
import { NoteRepository } from '@/repositories/implementations/NoteRepository';

// Mock functions need to be declared inside the mock
jest.mock('@/repositories/implementations/NoteRepository', () => {
  const mockCreate = jest.fn();
  const mockFindById = jest.fn();
  const mockFindByCompanyId = jest.fn();
  const mockFindByUserId = jest.fn();
  const mockFindByTarget = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();
  
  return {
    NoteRepository: jest.fn().mockImplementation(() => ({
      create: mockCreate,
      findById: mockFindById,
      findByCompanyId: mockFindByCompanyId,
      findByUserId: mockFindByUserId,
      findByTarget: mockFindByTarget,
      update: mockUpdate,
      delete: mockDelete,
    }))
  };
});

describe('Note Routes', () => {
  let mockCreate: jest.Mock;
  let mockFindById: jest.Mock;
  let mockFindByCompanyId: jest.Mock;
  let mockFindByUserId: jest.Mock;
  let mockFindByTarget: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockDelete: jest.Mock;

  beforeEach(() => {
    // Get the mock functions from the mocked class
    const mockRepo = new NoteRepository({} as any);
    mockCreate = mockRepo.create as jest.Mock;
    mockFindById = mockRepo.findById as jest.Mock;
    mockFindByCompanyId = mockRepo.findByCompanyId as jest.Mock;
    mockFindByUserId = mockRepo.findByUserId as jest.Mock;
    mockFindByTarget = mockRepo.findByTarget as jest.Mock;
    mockUpdate = mockRepo.update as jest.Mock;
    mockDelete = mockRepo.delete as jest.Mock;
    
    // Clear mocks
    jest.clearAllMocks();
  });

  const mockNote = {
    id: 1,
    company_id: 1,
    user_id: 1,
    target_type: 'ticket' as const,
    target_id: 1,
    note: 'Test note',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  describe('POST /api/notes', () => {
    it('should create new note', async () => {
      mockCreate.mockResolvedValue(mockNote);

      const response = await request(app)
        .post('/api/notes')
        .send({
          company_id: 1,
          user_id: 1,
          target_type: 'ticket',
          target_id: 1,
          note: 'Test note'
        })
        .expect(201);

      expect(response.body).toEqual(mockNote);
      expect(mockCreate).toHaveBeenCalledWith({
        company_id: 1,
        user_id: 1,
        target_type: 'ticket',
        target_id: 1,
        note: 'Test note'
      });
    });

    it('should return 500 when creation fails', async () => {
      mockCreate.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/notes')
        .send({
          company_id: 1,
          user_id: 1,
          target_type: 'ticket',
          target_id: 1,
          note: 'Test note'
        })
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to create note' });
    });
  });

  describe('GET /api/notes/:id', () => {
    it('should return note by id', async () => {
      mockFindById.mockResolvedValue(mockNote);

      const response = await request(app)
        .get('/api/notes/1')
        .expect(200);

      expect(response.body).toEqual(mockNote);
    });

    it('should return 404 when note not found', async () => {
      mockFindById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/notes/999')
        .expect(404);

      expect(response.body).toEqual({ error: 'Note not found' });
    });
  });

  describe('GET /api/notes/company/:companyId', () => {
    it('should return company notes', async () => {
      const mockNotes = [mockNote];
      mockFindByCompanyId.mockResolvedValue(mockNotes);

      const response = await request(app)
        .get('/api/notes/company/1')
        .expect(200);

      expect(response.body).toEqual(mockNotes);
    });
  });

  describe('GET /api/notes/user/:userId', () => {
    it('should return user notes', async () => {
      const mockNotes = [mockNote];
      mockFindByUserId.mockResolvedValue(mockNotes);

      const response = await request(app)
        .get('/api/notes/user/1')
        .expect(200);

      expect(response.body).toEqual(mockNotes);
    });
  });

  describe('GET /api/notes/target/:targetType/:targetId', () => {
    it('should return target notes', async () => {
      const mockNotes = [mockNote];
      mockFindByTarget.mockResolvedValue(mockNotes);

      const response = await request(app)
        .get('/api/notes/target/ticket/1')
        .expect(200);

      expect(response.body).toEqual(mockNotes);
      expect(mockFindByTarget).toHaveBeenCalledWith('ticket', 1);
    });
  });

  describe('PATCH /api/notes/:id', () => {
    it('should update note', async () => {
      const updatedNote = { ...mockNote, note: 'Updated note' };
      mockUpdate.mockResolvedValue(updatedNote);

      const response = await request(app)
        .patch('/api/notes/1')
        .send({ note: 'Updated note' })
        .expect(200);

      expect(response.body).toEqual(updatedNote);
    });
  });

  describe('DELETE /api/notes/:id', () => {
    it('should delete note', async () => {
      mockDelete.mockResolvedValue(undefined);

      await request(app)
        .delete('/api/notes/1')
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
          .get('/api/notes/1');
        
        if (response.status === 429) {
          limitHit = true;
          expect(response.body).toEqual({
            error: 'Too many note read attempts, please try again later'
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
          .post('/api/notes')
          .send({
            company_id: 1,
            user_id: 1,
            target_type: 'ticket',
            target_id: 1,
            note: 'Test note'
          });
        
        if (response.status === 429) {
          limitHit = true;
          expect(response.body).toEqual({
            error: 'Too many note write attempts, please try again later'
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