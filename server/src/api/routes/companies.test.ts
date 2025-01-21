import request from 'supertest'
import app from '../../index'
import { CompanyRepository } from '@/repositories/implementations/CompanyRepository'
import { ApiKeyRepository } from '@/repositories/implementations/ApiKeyRepository'

// Mock functions need to be declared inside the mock
jest.mock('@/repositories/implementations/CompanyRepository', () => {
  const mockCreate = jest.fn()
  const mockFindById = jest.fn()
  const mockUpdate = jest.fn()
  const mockUpdateSettings = jest.fn()
  const mockDelete = jest.fn()
  
  return {
    CompanyRepository: jest.fn().mockImplementation(() => ({
      create: mockCreate,
      findById: mockFindById,
      update: mockUpdate,
      updateSettings: mockUpdateSettings,
      delete: mockDelete,
    }))
  }
})

// Add ApiKeyRepository mock alongside CompanyRepository mock
jest.mock('@/repositories/implementations/ApiKeyRepository', () => {
  const mockFindByKey = jest.fn()
  return {
    ApiKeyRepository: jest.fn().mockImplementation(() => ({
      findByKey: mockFindByKey
    }))
  }
})

describe('Company Routes', () => {
  let mockCreate: jest.Mock
  let mockFindById: jest.Mock
  let mockUpdate: jest.Mock
  let mockUpdateSettings: jest.Mock
  let mockDelete: jest.Mock
  let mockApiKeyFind: jest.Mock
  const validApiKey = 'test-api-key'

  beforeEach(() => {
    // Setup API key validation mock
    const mockApiKeyRepo = new ApiKeyRepository({} as any)
    mockApiKeyFind = mockApiKeyRepo.findByKey as jest.Mock
    mockApiKeyFind.mockResolvedValue({ 
      id: 1, 
      company_id: 1,
      api_key: validApiKey 
    })

    const mockRepo = new CompanyRepository({} as any)
    mockCreate = mockRepo.create as jest.Mock
    mockFindById = mockRepo.findById as jest.Mock
    mockUpdate = mockRepo.update as jest.Mock
    mockUpdateSettings = mockRepo.updateSettings as jest.Mock
    mockDelete = mockRepo.delete as jest.Mock
    
    jest.clearAllMocks()
  })

  const mockCompany = {
    id: 1,
    name: 'Test Company',
    domain: 'test.com',
    settings: { theme: 'light' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  describe('POST /api/companies', () => {
    it('should create new company with valid API key', async () => {
      mockCreate.mockResolvedValue(mockCompany)

      const response = await request(app)
        .post('/api/companies')
        .set('x-api-key', validApiKey)
        .send({
          name: 'Test Company',
          domain: 'test.com',
          settings: { theme: 'light' }
        })
        .expect(201)

      expect(response.body).toEqual(mockCompany)
    })

    it('should return 401 without API key', async () => {
      const response = await request(app)
        .post('/api/companies')
        .send({
          name: 'Test Company'
        })
        .expect(401)

      expect(response.body).toEqual({ error: 'API key required' })
    })

    it('should return 500 when creation fails', async () => {
      mockCreate.mockRejectedValue(new Error('Database error'))

      const response = await request(app)
        .post('/api/companies')
        .set('x-api-key', validApiKey)
        .send({
          name: 'Test Company'
        })
        .expect(500)

      expect(response.body).toEqual({ error: 'Failed to create company' })
    })
  })

  describe('GET /api/companies/:id', () => {
    it('should return company details', async () => {
      mockFindById.mockResolvedValue(mockCompany)

      const response = await request(app)
        .get('/api/companies/1')
        .expect(200)

      expect(response.body).toEqual(mockCompany)
    })

    it('should return 404 when company not found', async () => {
      mockFindById.mockResolvedValue(null)

      const response = await request(app)
        .get('/api/companies/999')
        .expect(404)

      expect(response.body).toEqual({ error: 'Company not found' })
    })
  })

  describe('PATCH /api/companies/:id', () => {
    it('should update company details', async () => {
      const updatedCompany = { ...mockCompany, name: 'Updated Company' }
      mockUpdate.mockResolvedValue(updatedCompany)

      const response = await request(app)
        .patch('/api/companies/1')
        .send({ name: 'Updated Company' })
        .expect(200)

      expect(response.body).toEqual(updatedCompany)
    })
  })

  describe('PATCH /api/companies/:id/settings', () => {
    it('should update company settings', async () => {
      const updatedCompany = { ...mockCompany, settings: { theme: 'dark' } }
      mockUpdateSettings.mockResolvedValue(updatedCompany)

      const response = await request(app)
        .patch('/api/companies/1/settings')
        .send({ theme: 'dark' })
        .expect(200)

      expect(response.body).toEqual(updatedCompany)
    })
  })

  describe('DELETE /api/companies/:id', () => {
    it('should delete company with valid API key', async () => {
      mockDelete.mockResolvedValue(undefined)

      await request(app)
        .delete('/api/companies/1')
        .set('x-api-key', validApiKey)
        .expect(204)
    })

    it('should return 401 without API key', async () => {
      const response = await request(app)
        .delete('/api/companies/1')
        .expect(401)

      expect(response.body).toEqual({ error: 'API key required' })
    })
  })

  describe('Error Handling', () => {
    const errorTests = [
      {
        description: 'findById error',
        route: '/api/companies/1',
        method: 'get',
        mockFn: () => mockFindById.mockRejectedValue(new Error()),
        expectedError: 'Failed to fetch company'
      },
      {
        description: 'update error',
        route: '/api/companies/1',
        method: 'patch',
        mockFn: () => mockUpdate.mockRejectedValue(new Error()),
        expectedError: 'Failed to update company'
      },
      {
        description: 'updateSettings error',
        route: '/api/companies/1/settings',
        method: 'patch',
        mockFn: () => mockUpdateSettings.mockRejectedValue(new Error()),
        expectedError: 'Failed to update company settings'
      },
      {
        description: 'delete error',
        route: '/api/companies/1',
        method: 'delete',
        mockFn: () => mockDelete.mockRejectedValue(new Error()),
        expectedError: 'Failed to delete company',
        requiresAuth: true
      }
    ]

    errorTests.forEach(({ description, route, method, mockFn, expectedError, requiresAuth }) => {
      it(`should handle ${description}`, async () => {
        mockFn()
        
        const req = (request(app) as any)[method](route)
        if (requiresAuth) {
          req.set('x-api-key', validApiKey)
        }
        
        const response = await req.expect(500)
        expect(response.body).toEqual({ error: expectedError })
      })
    })
  })
}) 