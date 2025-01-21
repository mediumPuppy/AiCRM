import { ChatMessage } from '../../types/chat.types';

export class ChatMessageEntity implements ChatMessage {
  id: number;
  company_id: number;
  session_id: number;
  sender_type: ChatMessage['sender_type'];
  sender_id: number;
  message: string;
  message_type: ChatMessage['message_type'];
  metadata: Record<string, any>;
  read_at: Date | null;
  created_at: Date;
  updated_at: Date;

  constructor(data: ChatMessage) {
    this.id = data.id;
    this.company_id = data.company_id;
    this.session_id = data.session_id;
    this.sender_type = data.sender_type;
    this.sender_id = data.sender_id;
    this.message = data.message;
    this.message_type = data.message_type;
    this.metadata = data.metadata;
    this.read_at = data.read_at ? new Date(data.read_at) : null;
    this.created_at = new Date(data.created_at);
    this.updated_at = new Date(data.updated_at);
  }
} 