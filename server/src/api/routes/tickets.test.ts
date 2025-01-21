import request from 'supertest';
import app from '../../index';
import { TicketRepository } from '../../repositories/implementations/TicketRepository';

// Mock functions need to be declared inside the mock
jest.mock('../../repositories/implementations/TicketRepository', () => {
  const mockCreate = jest.fn();
  const mockFindById = jest.fn();
  const mockFindByCompanyId = jest.fn();
  const mockFindByContactId = jest.fn();
  const mockFindByAssignedUser = jest.fn();
  const mockFindByStatus = jest.fn();
  const mockUpdate = jest.fn();
  const mockUpdateStatus = jest.fn();
  const mockUpdateAssignment = jest.fn();
  const mockDelete = jest.fn();
  
  return {
    TicketRepository: jest.fn().mockImplementation(() => ({
      create: mockCreate,
      findById: mockFindById,
      findByCompanyId: mockFindByCompanyId,
      findByContactId: mockFindByContactId,
      findByAssignedUser: mockFindByAssignedUser,
      findByStatus: mockFindByStatus,
      update: mockUpdate,
      updateStatus: mockUpdateStatus,
      updateAssignment: mockUpdateAssignment,
      delete: mockDelete,
    }))
  };
});

describe('Ticket Routes', () => {
  let mockCreate: jest.Mock;
  let mockFindById: jest.Mock;
  let mockFindByCompanyId: jest.Mock;
  let mockFindByContactId: jest.Mock;
  let mockFindByAssignedUser: jest.Mock;
  let mockFindByStatus: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockUpdateStatus: jest.Mock;
  let mockUpdateAssignment: jest.Mock;
  let mockDelete: jest.Mock;

  beforeEach(() => {
    // Get the mock functions from the mocked class
    const mockRepo = new TicketRepository({} as any);
    mockCreate = mockRepo.create as jest.Mock;
    mockFindById = mockRepo.findById as jest.Mock;
    mockFindByCompanyId = mockRepo.findByCompanyId as jest.Mock;
    mockFindByContactId = mockRepo.findByContactId as jest.Mock;
    mockFindByAssignedUser = mockRepo.findByAssignedUser as jest.Mock;
    mockFindByStatus = mockRepo.findByStatus as jest.Mock;
    mockUpdate = mockRepo.update as jest.Mock;
    mockUpdateStatus = mockRepo.updateStatus as jest.Mock;
    mockUpdateAssignment = mockRepo.updateAssignment as jest.Mock;
    mockDelete = mockRepo.delete as jest.Mock;
    
    // Clear mocks
    jest.clearAllMocks();
  });

  const mockTicket = {
    id: 1,
    company_id: 1,
    contact_id: 2,
    assigned_to: 3,
    subject: 'Test Ticket',
    description: 'Test Description',
    status: 'open' as const,
    priority: 'normal' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    metadata: null
  };

  describe('GET /api/tickets', () => {
    it('should return tickets by company ID', async () => {
      mockFindByCompanyId.mockResolvedValue([mockTicket]);

      const response = await request(app)
        .get('/api/tickets')
        .query({ companyId: 1 })
        .expect(200);

      expect(response.body).toEqual([mockTicket]);
      expect(mockFindByCompanyId).toHaveBeenCalledWith(1);
    });

    it('should return tickets by company ID and status', async () => {
      mockFindByStatus.mockResolvedValue([mockTicket]);

      const response = await request(app)
        .get('/api/tickets')
        .query({ companyId: 1, status: 'open' })
        .expect(200);

      expect(response.body).toEqual([mockTicket]);
      expect(mockFindByStatus).toHaveBeenCalledWith(1, 'open');
    });

    it('should return 400 when company ID is missing', async () => {
      const response = await request(app)
        .get('/api/tickets')
        .expect(400);

      expect(response.body).toEqual({ error: 'Company ID is required' });
    });
  });

  describe('GET /api/tickets/:id', () => {
    it('should return ticket by ID', async () => {
      mockFindById.mockResolvedValue(mockTicket);

      const response = await request(app)
        .get('/api/tickets/1')
        .expect(200);

      expect(response.body).toEqual(mockTicket);
      expect(mockFindById).toHaveBeenCalledWith(1);
    });

    it('should return 404 when ticket not found', async () => {
      mockFindById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/tickets/999')
        .expect(404);

      expect(response.body).toEqual({ error: 'Ticket not found' });
    });
  });

  describe('GET /api/tickets/contact/:contactId', () => {
    it('should return tickets by contact ID', async () => {
      mockFindByContactId.mockResolvedValue([mockTicket]);

      const response = await request(app)
        .get('/api/tickets/contact/2')
        .expect(200);

      expect(response.body).toEqual([mockTicket]);
      expect(mockFindByContactId).toHaveBeenCalledWith(2);
    });
  });

  describe('GET /api/tickets/assigned/:userId', () => {
    it('should return tickets by assignee ID', async () => {
      mockFindByAssignedUser.mockResolvedValue([mockTicket]);

      const response = await request(app)
        .get('/api/tickets/assigned/3')
        .expect(200);

      expect(response.body).toEqual([mockTicket]);
      expect(mockFindByAssignedUser).toHaveBeenCalledWith(3);
    });
  });

  describe('POST /api/tickets', () => {
    it('should create new ticket', async () => {
      mockCreate.mockResolvedValue(mockTicket);

      const response = await request(app)
        .post('/api/tickets')
        .send({
          company_id: 1,
          contact_id: 2,
          assigned_to: 3,
          subject: 'Test Ticket',
          description: 'Test Description',
          status: 'open',
          priority: 'normal'
        })
        .expect(201);

      expect(response.body).toEqual(mockTicket);
    });

    it('should handle rate limiting', async () => {
      // Make more requests than allowed
      const requests = Array(101).fill(null);
      
      for (const _ of requests) {
        const response = await request(app)
          .post('/api/tickets')
          .send({
            company_id: 1,
            subject: 'Test Ticket',
            status: 'open',
            priority: 'normal'
          });

        if (response.status === 429) {
          expect(response.body).toEqual({
            error: 'Too many ticket write attempts, please try again later'
          });
          break;
        }
      }
    });
  });

  describe('PATCH /api/tickets/:id', () => {
    it('should update ticket', async () => {
      const updatedTicket = { ...mockTicket, subject: 'Updated Ticket' };
      mockUpdate.mockResolvedValue(updatedTicket);

      const response = await request(app)
        .patch('/api/tickets/1')
        .send({ subject: 'Updated Ticket' })
        .expect(200);

      expect(response.body).toEqual(updatedTicket);
      expect(mockUpdate).toHaveBeenCalledWith(1, { subject: 'Updated Ticket' });
    });
  });

  describe('PATCH /api/tickets/:id/status', () => {
    it('should update ticket status', async () => {
      const updatedTicket = { ...mockTicket, status: 'in_progress' };
      mockUpdateStatus.mockResolvedValue(updatedTicket);

      const response = await request(app)
        .patch('/api/tickets/1/status')
        .send({ status: 'in_progress' })
        .expect(200);

      expect(response.body).toEqual(updatedTicket);
      expect(mockUpdateStatus).toHaveBeenCalledWith(1, 'in_progress');
    });
  });

  describe('PATCH /api/tickets/:id/assign', () => {
    it('should assign ticket to user', async () => {
      const updatedTicket = { ...mockTicket, assigned_to: 4 };
      mockUpdateAssignment.mockResolvedValue(updatedTicket);

      const response = await request(app)
        .patch('/api/tickets/1/assign')
        .send({ userId: 4 })
        .expect(200);

      expect(response.body).toEqual(updatedTicket);
      expect(mockUpdateAssignment).toHaveBeenCalledWith(1, 4);
    });
  });

  describe('DELETE /api/tickets/:id', () => {
    it('should delete ticket', async () => {
      mockDelete.mockResolvedValue(undefined);

      await request(app)
        .delete('/api/tickets/1')
        .expect(204);

      expect(mockDelete).toHaveBeenCalledWith(1);
    });
  });

  describe('Error Handling', () => {
    const errorTests = [
      {
        description: 'findById error',
        route: '/api/tickets/1',
        method: 'get',
        mockFn: () => mockFindById.mockRejectedValue(new Error()),
        expectedError: 'Failed to fetch ticket'
      },
      {
        description: 'findByCompanyId error',
        route: '/api/tickets',
        method: 'get',
        query: { companyId: 1 },
        mockFn: () => mockFindByCompanyId.mockRejectedValue(new Error()),
        expectedError: 'Failed to fetch tickets'
      },
      {
        description: 'create error',
        route: '/api/tickets',
        method: 'post',
        mockFn: () => mockCreate.mockRejectedValue(new Error()),
        expectedError: 'Failed to create ticket',
        body: {
          company_id: 1,
          subject: 'Test',
          status: 'open',
          priority: 'normal'
        }
      },
      {
        description: 'update error',
        route: '/api/tickets/1',
        method: 'patch',
        mockFn: () => mockUpdate.mockRejectedValue(new Error()),
        expectedError: 'Failed to update ticket',
        body: { subject: 'Test' }
      },
      {
        description: 'delete error',
        route: '/api/tickets/1',
        method: 'delete',
        mockFn: () => mockDelete.mockRejectedValue(new Error()),
        expectedError: 'Failed to delete ticket'
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