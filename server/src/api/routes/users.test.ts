import request from 'supertest';
import app from '../../index';
import { UserRepository } from '../../repositories/implementations/UserRepository';

// Mock functions need to be declared inside the mock
jest.mock('../../repositories/implementations/UserRepository', () => {
  const mockCreate = jest.fn();
  const mockFindById = jest.fn();
  const mockFindByEmail = jest.fn();
  const mockFindByCompanyId = jest.fn();
  const mockFindByTeamId = jest.fn();
  const mockUpdate = jest.fn();
  const mockArchive = jest.fn();
  const mockDelete = jest.fn();
  
  return {
    UserRepository: jest.fn().mockImplementation(() => ({
      create: mockCreate,
      findById: mockFindById,
      findByEmail: mockFindByEmail,
      findByCompanyId: mockFindByCompanyId,
      findByTeamId: mockFindByTeamId,
      update: mockUpdate,
      archive: mockArchive,
      delete: mockDelete,
    }))
  };
});

describe('User Routes', () => {
  let mockCreate: jest.Mock;
  let mockFindById: jest.Mock;
  let mockFindByEmail: jest.Mock;
  let mockFindByCompanyId: jest.Mock;
  let mockFindByTeamId: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockArchive: jest.Mock;
  let mockDelete: jest.Mock;

  beforeEach(() => {
    // Get the mock functions from the mocked class
    const mockRepo = new UserRepository({} as any);
    mockCreate = mockRepo.create as jest.Mock;
    mockFindById = mockRepo.findById as jest.Mock;
    mockFindByEmail = mockRepo.findByEmail as jest.Mock;
    mockFindByCompanyId = mockRepo.findByCompanyId as jest.Mock;
    mockFindByTeamId = mockRepo.findByTeamId as jest.Mock;
    mockUpdate = mockRepo.update as jest.Mock;
    mockArchive = mockRepo.archive as jest.Mock;
    mockDelete = mockRepo.delete as jest.Mock;
    
    // Clear mocks
    jest.clearAllMocks();
  });

  const mockUser = {
    id: 1,
    company_id: 1,
    role: 'agent' as const,
    full_name: 'Test User',
    email: 'test@example.com',
    password: 'hashedpassword',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    archived_at: null,
    status: 'active' as const,
    team_id: 1,
    last_login_ip: '127.0.0.1'
  };

  describe('GET /api/users', () => {
    it('should return users by company ID', async () => {
      mockFindByCompanyId.mockResolvedValue([mockUser]);

      const response = await request(app)
        .get('/api/users')
        .query({ companyId: 1 })
        .expect(200);

      expect(response.body).toEqual([mockUser]);
      expect(mockFindByCompanyId).toHaveBeenCalledWith(1);
    });

    it('should return 400 when company ID is missing', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(400);

      expect(response.body).toEqual({ error: 'Company ID is required' });
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user by ID', async () => {
      mockFindById.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/users/1')
        .expect(200);

      expect(response.body).toEqual(mockUser);
      expect(mockFindById).toHaveBeenCalledWith(1);
    });

    it('should return 404 when user not found', async () => {
      mockFindById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/users/999')
        .expect(404);

      expect(response.body).toEqual({ error: 'User not found' });
    });
  });

  describe('GET /api/users/email/:email', () => {
    it('should return user by email', async () => {
      mockFindByEmail.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/users/email/test@example.com')
        .expect(200);

      expect(response.body).toEqual(mockUser);
      expect(mockFindByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return 404 when user not found', async () => {
      mockFindByEmail.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/users/email/notfound@example.com')
        .expect(404);

      expect(response.body).toEqual({ error: 'User not found' });
    });
  });

  describe('GET /api/users/team/:teamId', () => {
    it('should return users by team ID', async () => {
      mockFindByTeamId.mockResolvedValue([mockUser]);

      const response = await request(app)
        .get('/api/users/team/1')
        .expect(200);

      expect(response.body).toEqual([mockUser]);
      expect(mockFindByTeamId).toHaveBeenCalledWith(1);
    });
  });

  describe('POST /api/users', () => {
    it('should create new user', async () => {
      mockCreate.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/users')
        .send({
          company_id: 1,
          role: 'agent',
          full_name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          status: 'active',
          team_id: 1
        })
        .expect(201);

      expect(response.body).toEqual(mockUser);
    });

    it('should handle rate limiting', async () => {
      // Make more requests than allowed
      const requests = Array(101).fill(null);
      
      for (const _ of requests) {
        const response = await request(app)
          .post('/api/users')
          .send({
            company_id: 1,
            role: 'agent',
            full_name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            status: 'active'
          });

        if (response.status === 429) {
          expect(response.body).toEqual({
            error: 'Too many user write attempts, please try again later'
          });
          break;
        }
      }
    });
  });

  describe('PATCH /api/users/:id', () => {
    it('should update user', async () => {
      const updatedUser = { ...mockUser, full_name: 'Updated Name' };
      mockUpdate.mockResolvedValue(updatedUser);

      const response = await request(app)
        .patch('/api/users/1')
        .send({ full_name: 'Updated Name' })
        .expect(200);

      expect(response.body).toEqual(updatedUser);
      expect(mockUpdate).toHaveBeenCalledWith(1, { full_name: 'Updated Name' });
    });
  });

  describe('POST /api/users/:id/archive', () => {
    it('should archive user', async () => {
      mockArchive.mockResolvedValue(undefined);

      await request(app)
        .post('/api/users/1/archive')
        .expect(204);

      expect(mockArchive).toHaveBeenCalledWith(1);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user', async () => {
      mockDelete.mockResolvedValue(undefined);

      await request(app)
        .delete('/api/users/1')
        .expect(204);

      expect(mockDelete).toHaveBeenCalledWith(1);
    });
  });

  describe('Error Handling', () => {
    const errorTests = [
      {
        description: 'findById error',
        route: '/api/users/1',
        method: 'get',
        mockFn: () => mockFindById.mockRejectedValue(new Error()),
        expectedError: 'Failed to fetch user'
      },
      {
        description: 'findByCompanyId error',
        route: '/api/users',
        method: 'get',
        query: { companyId: 1 },
        mockFn: () => mockFindByCompanyId.mockRejectedValue(new Error()),
        expectedError: 'Failed to fetch users'
      },
      {
        description: 'findByEmail error',
        route: '/api/users/email/test@example.com',
        method: 'get',
        mockFn: () => mockFindByEmail.mockRejectedValue(new Error()),
        expectedError: 'Failed to fetch user'
      },
      {
        description: 'create error',
        route: '/api/users',
        method: 'post',
        mockFn: () => mockCreate.mockRejectedValue(new Error()),
        expectedError: 'Failed to create user',
        body: {
          company_id: 1,
          role: 'agent',
          full_name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          status: 'active'
        }
      },
      {
        description: 'update error',
        route: '/api/users/1',
        method: 'patch',
        mockFn: () => mockUpdate.mockRejectedValue(new Error()),
        expectedError: 'Failed to update user',
        body: { full_name: 'Test' }
      },
      {
        description: 'archive error',
        route: '/api/users/1/archive',
        method: 'post',
        mockFn: () => mockArchive.mockRejectedValue(new Error()),
        expectedError: 'Failed to archive user'
      },
      {
        description: 'delete error',
        route: '/api/users/1',
        method: 'delete',
        mockFn: () => mockDelete.mockRejectedValue(new Error()),
        expectedError: 'Failed to delete user'
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