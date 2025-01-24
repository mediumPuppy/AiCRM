import request from 'supertest'
import app from '../../index'
import { ChatRepository } from '@/repositories/implementations/ChatRepository'
import { ChatSession, ChatSessionStatus } from '@/types/chat.types'

// Mock the ChatRepository
jest.mock('@/repositories/implementations/ChatRepository', () => {
  const mockCreateSession = jest.fn()
  const mockFindSessionById = jest.fn()
  const mockFindSessionsByCompanyId = jest.fn()
  const mockFindSessionsByStatus = jest.fn()
  const mockFindSessionsByContact = jest.fn()
  const mockFindSessionsByAgent = jest.fn()
  const mockUpdateSession = jest.fn()
  const mockCloseSession = jest.fn()
  
  return {
    ChatRepository: jest.fn().mockImplementation(() => ({
      createSession: mockCreateSession,
      findSessionById: mockFindSessionById,
      findSessionsByCompanyId: mockFindSessionsByCompanyId,
      findSessionsByStatus: mockFindSessionsByStatus,
      findSessionsByContact: mockFindSessionsByContact,
      findSessionsByAgent: mockFindSessionsByAgent,
      updateSession: mockUpdateSession,
      closeSession: mockCloseSession
    }))
  }
})

describe('Chat Sessions Routes', () => {
  let mockRepo: jest.Mocked<ChatRepository>

  beforeEach(() => {
    // Get the mock functions from the mocked class
    mockRepo = new ChatRepository({} as any) as jest.Mocked<ChatRepository>
    // Clear all mocks
    jest.clearAllMocks()
  })

  const mockSession: ChatSession = {
    id: 1,
    company_id: 1,
    contact_id: 2,
    agent_id: 3,
    ticket_id: 4,
    status: 'active' as ChatSessionStatus,
    started_at: new Date(),
    ended_at: null,
    metadata: {},
    created_at: new Date(),
    updated_at: new Date(),
    last_message_at: new Date()
  }

  describe('POST /chat/sessions', () => {
    it('should create a new chat session', async () => {
      mockRepo.createSession.mockResolvedValue(mockSession)

      const response = await request(app)
        .post('/api/chat/sessions')
        .send({
          company_id: 1,
          contact_id: 2,
          agent_id: 3,
          ticket_id: 4
        })
        .expect(201)

      expect(response.body).toEqual(expect.objectContaining({
        company_id: 1,
        contact_id: 2,
        agent_id: 3,
        ticket_id: 4
      }))
    })

    it('should return 500 when creation fails', async () => {
      mockRepo.createSession.mockRejectedValue(new Error('Database error'))

      const response = await request(app)
        .post('/api/chat/sessions')
        .send({
          company_id: 1,
          contact_id: 2
        })
        .expect(500)

      expect(response.body).toEqual({ error: 'Failed to create chat session' })
    })
  })

  describe('GET /chat/sessions/:id', () => {
    it('should return a chat session', async () => {
      mockRepo.findSessionById.mockResolvedValue(mockSession)

      const response = await request(app)
        .get('/api/chat/sessions/1')
        .expect(200)

      expect(response.body).toEqual(expect.objectContaining({
        id: 1,
        company_id: 1
      }))
    })

    it('should return 404 when session not found', async () => {
      mockRepo.findSessionById.mockResolvedValue(null)

      const response = await request(app)
        .get('/api/chat/sessions/999')
        .expect(404)

      expect(response.body).toEqual({ error: 'Chat session not found' })
    })
  })

  describe('GET /chat/sessions/company/:companyId', () => {
    it('should return company sessions', async () => {
      mockRepo.findSessionsByCompanyId.mockResolvedValue([mockSession])

      const response = await request(app)
        .get('/api/chat/sessions/company/1')
        .expect(200)

      expect(response.body).toHaveLength(1)
      expect(response.body[0]).toEqual(expect.objectContaining({
        company_id: 1
      }))
    })
  })

  describe('GET /chat/sessions/company/:companyId/status/:status', () => {
    it('should return sessions by status', async () => {
      mockRepo.findSessionsByStatus.mockResolvedValue([mockSession])

      const response = await request(app)
        .get('/api/chat/sessions/company/1/status/active')
        .expect(200)

      expect(response.body).toHaveLength(1)
      expect(response.body[0].status).toBe('active')
    })
  })

  describe('GET /chat/sessions/contact/:contactId', () => {
    it('should return contact sessions', async () => {
      mockRepo.findSessionsByContact.mockResolvedValue([mockSession])

      const response = await request(app)
        .get('/api/chat/sessions/contact/2')
        .expect(200)

      expect(response.body).toHaveLength(1)
      expect(response.body[0].contact_id).toBe(2)
    })
  })

  describe('GET /chat/sessions/agent/:agentId', () => {
    it('should return agent sessions', async () => {
      mockRepo.findSessionsByAgent.mockResolvedValue([mockSession])

      const response = await request(app)
        .get('/api/chat/sessions/agent/3')
        .expect(200)

      expect(response.body).toHaveLength(1)
      expect(response.body[0].agent_id).toBe(3)
    })
  })

  describe('PATCH /chat/sessions/:id', () => {
    it('should update a chat session', async () => {
      const updatedSession = { ...mockSession, agent_id: 5 }
      mockRepo.updateSession.mockResolvedValue(updatedSession)

      const response = await request(app)
        .patch('/api/chat/sessions/1')
        .send({ agent_id: 5 })
        .expect(200)

      expect(response.body.agent_id).toBe(5)
    })
  })

  describe('POST /chat/sessions/:id/close', () => {
    it('should close a chat session', async () => {
      const closedSession = { ...mockSession, status: 'closed' as ChatSessionStatus, ended_at: new Date() }
      mockRepo.closeSession.mockResolvedValue(closedSession)

      const response = await request(app)
        .post('/api/chat/sessions/1/close')
        .expect(200)

      expect(response.body.status).toBe('closed')
      expect(response.body.ended_at).toBeTruthy()
    })
  })

  describe('Error Handling', () => {
    const errorTests = [
      {
        description: 'findSessionsByCompanyId error',
        route: '/api/chat/sessions/company/1',
        method: 'get',
        mockFn: () => mockRepo.findSessionsByCompanyId.mockRejectedValue(new Error()),
        expectedError: 'Failed to fetch company chat sessions'
      },
      {
        description: 'findSessionsByStatus error',
        route: '/api/chat/sessions/company/1/status/active',
        method: 'get',
        mockFn: () => mockRepo.findSessionsByStatus.mockRejectedValue(new Error()),
        expectedError: 'Failed to fetch chat sessions by status'
      },
      {
        description: 'findSessionsByContact error',
        route: '/api/chat/sessions/contact/1',
        method: 'get',
        mockFn: () => mockRepo.findSessionsByContact.mockRejectedValue(new Error()),
        expectedError: 'Failed to fetch contact chat sessions'
      },
      {
        description: 'findSessionsByAgent error',
        route: '/api/chat/sessions/agent/1',
        method: 'get',
        mockFn: () => mockRepo.findSessionsByAgent.mockRejectedValue(new Error()),
        expectedError: 'Failed to fetch agent chat sessions'
      },
      {
        description: 'updateSession error',
        route: '/api/chat/sessions/1',
        method: 'patch',
        mockFn: () => mockRepo.updateSession.mockRejectedValue(new Error()),
        expectedError: 'Failed to update chat session'
      },
      {
        description: 'closeSession error',
        route: '/api/chat/sessions/1/close',
        method: 'post',
        mockFn: () => mockRepo.closeSession.mockRejectedValue(new Error()),
        expectedError: 'Failed to close chat session'
      }
    ]

    errorTests.forEach(({ description, route, method, mockFn, expectedError }) => {
      it(`should handle ${description}`, async () => {
        mockFn()
        
        const response = await (request(app) as any)[method](route).expect(500)
        expect(response.body).toEqual({ error: expectedError })
      })
    })
  })
}) 