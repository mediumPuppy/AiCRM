import axios from 'axios';
import type { 
  ChatSession, 
  ChatMessage,
  ChatSessionsResponse,
  ChatSessionFilters,
  UpdateChatSessionDTO 
} from '@/types/chat.types'

export const chatsApi = {
  // Get all sessions for a company with filters
  getCompanySessions: async (
    companyId: number | string,
    params?: ChatSessionFilters & { page?: number; limit?: number }
  ): Promise<ChatSessionsResponse> => {
    try {
      const { data } = await axios.get(`/api/chat/sessions/company/${companyId}`, { params })
      return data
    } catch (error) {
      console.error('Failed to fetch chat sessions:', error)
      return { sessions: [], total: 0 }
    }
  },

  // Get single session details
  getSession: async (sessionId: number): Promise<ChatSession> => {
    try {
      const { data } = await axios.get(`/api/chat/sessions/${sessionId}`)
      return data
    } catch (error) {
      console.error('Failed to fetch chat session:', error)
      throw error
    }
  },

  // Get messages for a session
  getSessionMessages: async (sessionId: number): Promise<ChatMessage[]> => {
    try {
      const { data } = await axios.get(`/api/chat/sessions/${sessionId}/messages`)
      return data
    } catch (error) {
      console.error('Failed to fetch chat messages:', error)
      return []
    }
  },

  // Update session
  updateSession: async (
    sessionId: number, 
    updates: UpdateChatSessionDTO
  ): Promise<ChatSession> => {
    try {
      const { data } = await axios.patch(`/api/chat/sessions/${sessionId}`, updates)
      return data
    } catch (error) {
      console.error('Failed to update chat session:', error)
      throw error
    }
  },

  // Close session
  closeSession: async (sessionId: number): Promise<ChatSession> => {
    try {
      const { data } = await axios.post(`/api/chat/sessions/${sessionId}/close`)
      return data
    } catch (error) {
      console.error('Failed to close chat session:', error)
      throw error
    }
  },

  // Get sessions by status
  getSessionsByStatus: async (
    companyId: number | string,
    status: ChatSession['status']
  ): Promise<ChatSession[]> => {
    try {
      const { data } = await axios.get(
        `/api/chat/sessions/company/${companyId}/status/${status}`
      )
      return data
    } catch (error) {
      console.error('Failed to fetch chat sessions by status:', error)
      return []
    }
  },

  // Get sessions for a contact
  getContactSessions: async (contactId: number): Promise<ChatSession[]> => {
    try {
      const { data } = await axios.get(`/api/chat/sessions/contact/${contactId}`)
      return data
    } catch (error) {
      console.error('Failed to fetch contact chat sessions:', error)
      return []
    }
  },

  // Get sessions for an agent
  getAgentSessions: async (agentId: number): Promise<ChatSession[]> => {
    try {
      const { data } = await axios.get(`/api/chat/sessions/agent/${agentId}`)
      return data
    } catch (error) {
      console.error('Failed to fetch agent chat sessions:', error)
      return []
    }
  },

  // Customer specific methods
  getCustomerSessions: async (
    contactId: number, 
    params: { page: number; limit: number }
  ): Promise<ChatSessionsResponse> => {
    try {
      const { data } = await axios.get(`/api/chat/sessions/customer/${contactId}/sessions`, { params })
      return data
    } catch (error) {
      console.error('Failed to fetch customer chat sessions:', error)
      return { sessions: [], total: 0 }
    }
  },

  getCustomerSession: async (sessionId: number): Promise<ChatSession> => {
    try {
      const { data } = await axios.get(`/api/chat/sessions/customer/sessions/${sessionId}`)
      return data
    } catch (error) {
      console.error('Failed to fetch customer chat session:', error)
      throw error
    }
  },

  startCustomerSession: async (contactId: number, companyId: number): Promise<ChatSession> => {
    try {
      const { data } = await axios.post(`/api/chat/sessions/customer/${contactId}/sessions`, {
        company_id: companyId
      })
      return data
    } catch (error) {
      console.error('Failed to start customer chat session:', error)
      throw error
    }
  },

  sendCustomerMessage: async (
    sessionId: number, 
    message: string,
    contactId: number = 1,  // TODO: Get from auth context
    companyId: number = 1   // TODO: Get from auth context
  ): Promise<ChatMessage> => {
    try {
      const { data } = await axios.post(
        `/api/chat/sessions/customer/sessions/${sessionId}/messages`,
        { 
          message,
          contact_id: contactId,
          company_id: companyId
        }
      )
      return data
    } catch (error) {
      console.error('Failed to send customer message:', error)
      throw error
    }
  },

  // Send message as agent
  sendAgentMessage: async (
    sessionId: number,
    message: string,
    agentId: number = 1,  // TODO: Get from auth context
    companyId: number = 1  // TODO: Get from auth context
  ): Promise<ChatMessage> => {
    try {
      const { data } = await axios.post(
        `/api/chat/sessions/${sessionId}/messages`,
        {
          message,
          agent_id: agentId,
          company_id: companyId
        }
      )
      return data
    } catch (error) {
      console.error('Failed to send agent message:', error)
      throw error
    }
  }
}; 