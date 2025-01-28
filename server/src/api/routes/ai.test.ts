import request from 'supertest'
import express from 'express'
import aiRoutes from './ai'
import { generateOutreachMessage } from '../../services/llm'

// Mock the LLM service
jest.mock('../../services/llm')
const mockGenerateOutreachMessage = generateOutreachMessage as jest.MockedFunction<typeof generateOutreachMessage>

// Mock Supabase client
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              id: 1,
              full_name: 'John Doe',
              email: 'john@example.com'
            },
            error: null
          }))
        }))
      })),
      insert: jest.fn(() => ({ error: null }))
    }))
  }
}))

describe('AI Routes', () => {
  let app: express.Application

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/api/ai', aiRoutes)
    mockGenerateOutreachMessage.mockClear()
  })

  describe('POST /api/ai/outreach-gpt', () => {
    it('should generate outreach message successfully', async () => {
      const mockMessage = 'Hello John, this is a test message.'
      mockGenerateOutreachMessage.mockResolvedValueOnce(mockMessage)

      const response = await request(app)
        .post('/api/ai/outreach-gpt')
        .send({
          contactId: 1,
          instruction: 'Write a welcome message'
        })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ draft: mockMessage })
      expect(mockGenerateOutreachMessage).toHaveBeenCalledTimes(1)
    })

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/ai/outreach-gpt')
        .send({
          contactId: 1
          // Missing instruction
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
    })

    it('should return 404 if contact is not found', async () => {
      // Override the mock to return no data
      jest.spyOn(require('../../lib/supabase').supabase, 'from').mockImplementationOnce(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: null,
              error: new Error('Not found')
            }))
          }))
        }))
      }))

      const response = await request(app)
        .post('/api/ai/outreach-gpt')
        .send({
          contactId: 999,
          instruction: 'Write a welcome message'
        })

      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty('error')
    })
  })
}) 