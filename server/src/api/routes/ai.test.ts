import request from 'supertest'
import express from 'express'
import aiRoutes from './ai'
import { generateChatMessage } from '../../services/llm'

// Mock the LLM service
jest.mock('../../services/llm')
const mockGenerateChatMessage = generateChatMessage as jest.MockedFunction<typeof generateChatMessage>

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
    mockGenerateChatMessage.mockClear()
  })

  describe('POST /api/ai/outreach-gpt', () => {
    it('should generate outreach message and track metrics successfully', async () => {
      const mockDraft = 'Hello John, this is a test message.'
      mockGenerateChatMessage.mockResolvedValueOnce(mockDraft)

      const response = await request(app)
        .post('/api/ai/outreach-gpt')
        .send({
          contactId: 1,
          instruction: 'Write a welcome message',
          generationCount: 2,
          isFirstTry: false
        })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        draft: mockDraft,
        metrics: {
          generationTime: expect.any(Number),
          generationCount: 2
        }
      })

      // Verify metrics were logged
      const mockSupabase = require('../../lib/supabase').supabase
      expect(mockSupabase.from).toHaveBeenCalledWith('outreach_metrics')
      expect(mockSupabase.from().insert).toHaveBeenCalledWith(expect.objectContaining({
        contact_id: 1,
        instruction: 'Write a welcome message',
        total_generations: 2,
        accepted_on_first_try: false,
        generation_time_ms: expect.any(Number)
      }))
    })

    it('should use default values for metrics if not provided', async () => {
      const mockDraft = 'Hello John, this is a test message.'
      mockGenerateChatMessage.mockResolvedValueOnce(mockDraft)

      const response = await request(app)
        .post('/api/ai/outreach-gpt')
        .send({
          contactId: 1,
          instruction: 'Write a welcome message'
        })

      expect(response.status).toBe(200)
      expect(response.body.metrics).toEqual({
        generationTime: expect.any(Number),
        generationCount: 1
      })

      // Verify default metrics were logged
      const mockSupabase = require('../../lib/supabase').supabase
      expect(mockSupabase.from().insert).toHaveBeenCalledWith(expect.objectContaining({
        total_generations: 1,
        accepted_on_first_try: true
      }))
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