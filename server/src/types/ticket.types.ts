export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';

export type Ticket = {
  id: number;
  company_id: number;
  contact_id: number | null;
  assigned_to: number | null;
  subject: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: Date;
  updated_at: Date;
  metadata: Record<string, any> | null;
};

export type CreateTicketDTO = Omit<Ticket, 'id' | 'created_at' | 'updated_at'>;
export type UpdateTicketDTO = Partial<Omit<CreateTicketDTO, 'company_id'>>; 