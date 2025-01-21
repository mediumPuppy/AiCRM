import { RealtimeChannel } from '@supabase/supabase-js';
import { 
  ChatSession, 
  ChatMessage, 
  CreateChatSessionDTO, 
  UpdateChatSessionDTO,
  CreateChatMessageDTO,
  UpdateChatMessageDTO,
  ChatSessionStatus
} from '../../types/chat.types';

export interface IChatRepository {
  // Session methods
  createSession(data: CreateChatSessionDTO): Promise<ChatSession>;
  findSessionById(id: number): Promise<ChatSession | null>;
  findSessionsByCompanyId(companyId: number): Promise<ChatSession[]>;
  findSessionsByStatus(companyId: number, status: ChatSessionStatus): Promise<ChatSession[]>;
  findSessionsByContact(contactId: number): Promise<ChatSession[]>;
  findSessionsByAgent(agentId: number): Promise<ChatSession[]>;
  updateSession(id: number, data: UpdateChatSessionDTO): Promise<ChatSession>;
  closeSession(id: number): Promise<ChatSession>;
  
  // Message methods
  createMessage(data: CreateChatMessageDTO): Promise<ChatMessage>;
  findMessageById(id: number): Promise<ChatMessage | null>;
  findMessagesBySessionId(sessionId: number): Promise<ChatMessage[]>;
  markMessageAsRead(id: number): Promise<ChatMessage>;
  updateMessage(id: number, data: UpdateChatMessageDTO): Promise<ChatMessage>;
  
  // Realtime methods
  subscribeToSession(sessionId: number, callback: (message: ChatMessage) => void): RealtimeChannel;
  unsubscribeFromSession(channel: RealtimeChannel): void;
} 