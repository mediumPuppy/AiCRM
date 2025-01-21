export type ChatSessionStatus = 'active' | 'closed' | 'archived';
export type ChatMessageType = 'text' | 'image' | 'file' | 'system';
export type SenderType = 'contact' | 'agent' | 'system';

export type ChatSession = {
  id: number;
  company_id: number;
  contact_id: number | null;
  agent_id: number | null;
  ticket_id: number | null;
  status: ChatSessionStatus;
  started_at: Date;
  ended_at: Date | null;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
};

export type ChatMessage = {
  id: number;
  company_id: number;
  session_id: number;
  sender_type: SenderType;
  sender_id: number;
  message: string;
  message_type: ChatMessageType;
  metadata: Record<string, any>;
  read_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type CreateChatSessionDTO = Omit<ChatSession, 'id' | 'created_at' | 'updated_at' | 'started_at'>;
export type UpdateChatSessionDTO = Partial<Pick<ChatSession, 'agent_id' | 'status' | 'ended_at' | 'metadata'>>;
export type CreateChatMessageDTO = Omit<ChatMessage, 'id' | 'created_at' | 'updated_at' | 'read_at'>;
export type UpdateChatMessageDTO = Pick<ChatMessage, 'read_at'>; 