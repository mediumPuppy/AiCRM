import { Webhook, CreateWebhookDTO, UpdateWebhookDTO, WebhookEventType } from '../../types/webhook.types';

export interface IWebhookRepository {
  create(data: CreateWebhookDTO): Promise<Webhook>;
  findById(id: number): Promise<Webhook | null>;
  findByCompanyId(companyId: number): Promise<Webhook[]>;
  findByEvent(companyId: number, event: WebhookEventType): Promise<Webhook[]>;
  update(id: number, data: UpdateWebhookDTO): Promise<Webhook>;
  delete(id: number): Promise<void>;
} 