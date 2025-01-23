import { ChatSession, ChatSessionStatus } from '../../types/chat.types';
import { Contact } from '../../types/contact.types';
import { User } from '../../types/user.types';
import { Ticket } from '../../types/ticket.types';

export class ChatSessionEntity implements ChatSession {
  id: number;
  company_id: number;
  contact_id: number | null;
  agent_id: number | null;
  ticket_id: number | null;
  status: ChatSessionStatus;
  started_at: Date;
  ended_at: Date | null;
  last_message_at: Date | null;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  contact?: Contact;
  agent?: User;
  ticket?: Ticket;

  constructor(data: any) {
    this.id = data.id;
    this.company_id = data.company_id;
    this.contact_id = data.contact_id;
    this.agent_id = data.agent_id;
    this.ticket_id = data.ticket_id;
    this.status = data.status;
    this.started_at = new Date(data.started_at);
    this.ended_at = data.ended_at ? new Date(data.ended_at) : null;
    this.last_message_at = data.last_message_at ? new Date(data.last_message_at) : null;
    this.metadata = data.metadata ?? {};
    this.created_at = new Date(data.created_at);
    this.updated_at = new Date(data.updated_at);
    this.contact = data.contact;
    this.agent = data.agent;
    this.ticket = data.ticket;
  }
} 