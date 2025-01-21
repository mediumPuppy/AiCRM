import { Ticket } from '../../types/ticket.types';

export class TicketEntity implements Ticket {
  id: number;
  company_id: number;
  contact_id: number | null;
  assigned_to: number | null;
  subject: string;
  description: string | null;
  status: Ticket['status'];
  priority: Ticket['priority'];
  created_at: Date;
  updated_at: Date;
  metadata: Record<string, any> | null;

  constructor(data: Ticket) {
    this.id = data.id;
    this.company_id = data.company_id;
    this.contact_id = data.contact_id;
    this.assigned_to = data.assigned_to;
    this.subject = data.subject;
    this.description = data.description;
    this.status = data.status;
    this.priority = data.priority;
    this.created_at = new Date(data.created_at);
    this.updated_at = new Date(data.updated_at);
    this.metadata = data.metadata;
  }
} 