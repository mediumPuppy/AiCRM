export type WebhookEventType = 
  | 'contact.created'
  | 'contact.updated'
  | 'contact.archived'
  | 'ticket.created'
  | 'ticket.updated'
  | 'ticket.status_changed'
  | 'ticket.assigned';

export type WebhookType = 'incoming' | 'outgoing';

export type Webhook = {
  id: number;
  company_id: number;
  webhook_type: WebhookType;
  endpoint: string;
  secret: string | null;
  created_at: Date;
  updated_at: Date;
  events: WebhookEventType[];
};

export type CreateWebhookDTO = Omit<Webhook, 'id' | 'created_at' | 'updated_at'>;
export type UpdateWebhookDTO = Partial<Omit<CreateWebhookDTO, 'company_id'>>; 