import { Webhook } from '../../types/webhook.types';

export class WebhookEntity implements Webhook {
  id: number;
  company_id: number;
  webhook_type: Webhook['webhook_type'];
  endpoint: string;
  secret: string | null;
  created_at: Date;
  updated_at: Date;
  events: Webhook['events'];

  constructor(data: Webhook) {
    this.id = data.id;
    this.company_id = data.company_id;
    this.webhook_type = data.webhook_type;
    this.endpoint = data.endpoint;
    this.secret = data.secret;
    this.created_at = new Date(data.created_at);
    this.updated_at = new Date(data.updated_at);
    this.events = data.events;
  }
} 