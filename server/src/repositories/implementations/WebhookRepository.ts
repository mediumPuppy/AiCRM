import { SupabaseClient } from '@supabase/supabase-js';
import { IWebhookRepository } from '../interfaces/IWebhookRepository';
import { Webhook, CreateWebhookDTO, UpdateWebhookDTO, WebhookEventType } from '../../types/webhook.types';
import { WebhookEntity } from '../../domain/entities/webhook';

export class WebhookRepository implements IWebhookRepository {
  private readonly tableName = 'webhooks';

  constructor(private readonly supabase: SupabaseClient) {}

  async create(data: CreateWebhookDTO): Promise<Webhook> {
    const { data: webhook, error } = await this.supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return new WebhookEntity(webhook);
  }

  async findById(id: number): Promise<Webhook | null> {
    const { data: webhook, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    return webhook ? new WebhookEntity(webhook) : null;
  }

  async findByCompanyId(companyId: number): Promise<Webhook[]> {
    const { data: webhooks, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('company_id', companyId);

    if (error) throw error;
    return webhooks.map(webhook => new WebhookEntity(webhook));
  }

  async findByEvent(companyId: number, event: WebhookEventType): Promise<Webhook[]> {
    const { data: webhooks, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('company_id', companyId)
      .contains('events', [event]);

    if (error) throw error;
    return webhooks.map(webhook => new WebhookEntity(webhook));
  }

  async update(id: number, data: UpdateWebhookDTO): Promise<Webhook> {
    const { data: webhook, error } = await this.supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return new WebhookEntity(webhook);
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
} 