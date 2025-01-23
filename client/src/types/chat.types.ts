import { User } from './user.types'
import { Contact } from './contact.types'
import { Ticket } from './ticket.types'
import { DateRange } from "react-day-picker"

export type ChatSessionStatus = 'active' | 'closed' | 'archived'

export type ChatMessageType = 'text' | 'image' | 'file' | 'system'

export type ChatSenderType = 'contact' | 'agent' | 'system'

export interface ChatSession {
  id: number
  company_id: number
  contact_id: number | null
  agent_id: number | null
  ticket_id: number | null
  status: ChatSessionStatus
  started_at: string
  ended_at: string | null
  last_message_at: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  // Populated relations (optional)
  contact?: Contact
  agent?: User
  ticket?: Ticket
}

export interface ChatMessage {
  id: number
  company_id: number
  session_id: number
  sender_type: ChatSenderType
  sender_id: number
  message: string
  message_type: ChatMessageType
  metadata: Record<string, any>
  read_at: string | null
  created_at: string
  updated_at: string
}

export interface ChatSessionFilters {
  status?: ChatSessionStatus[]
  dateRange?: DateRange
  search?: string
  agentId?: number
  contactId?: number
}

export interface ChatSessionsPagination {
  page: number
  limit: number
}

export interface ChatSessionsResponse {
  sessions: ChatSession[]
  total: number
}

export interface CreateChatSessionDTO {
  company_id: number
  contact_id?: number
  agent_id?: number
  ticket_id?: number
  metadata?: Record<string, any>
}

export interface UpdateChatSessionDTO {
  agent_id?: number
  status?: ChatSessionStatus
  ended_at?: string
  metadata?: Record<string, any>
}

export interface CreateChatMessageDTO {
  company_id: number
  session_id: number
  sender_type: ChatSenderType
  sender_id: number
  message: string
  message_type: ChatMessageType
  metadata?: Record<string, any>
} 