import { SupabaseClient } from '@supabase/supabase-js';
import { IAttachmentRepository } from '../interfaces/IAttachmentRepository';
import { Attachment, CreateAttachmentDTO, UpdateAttachmentDTO } from '../../types/attachment.types';
import { AttachmentEntity } from '../../domain/entities/attachment';

export class AttachmentRepository implements IAttachmentRepository {
  private readonly tableName = 'attachments';

  constructor(private readonly supabase: SupabaseClient) {}

  async create(data: CreateAttachmentDTO): Promise<Attachment> {
    const { data: attachment, error } = await this.supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return new AttachmentEntity(attachment);
  }

  async findById(id: number): Promise<Attachment | null> {
    const { data: attachment, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    return attachment ? new AttachmentEntity(attachment) : null;
  }

  async findByCompanyId(companyId: number): Promise<Attachment[]> {
    const { data: attachments, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('company_id', companyId);

    if (error) throw error;
    return attachments.map(attachment => new AttachmentEntity(attachment));
  }

  async findByTarget(targetType: Attachment['target_type'], targetId: number): Promise<Attachment[]> {
    const { data: attachments, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('target_type', targetType)
      .eq('target_id', targetId);

    if (error) throw error;
    return attachments.map(attachment => new AttachmentEntity(attachment));
  }

  async update(id: number, data: UpdateAttachmentDTO): Promise<Attachment> {
    const { data: attachment, error } = await this.supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return new AttachmentEntity(attachment);
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async deleteByTarget(targetType: Attachment['target_type'], targetId: number): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('target_type', targetType)
      .eq('target_id', targetId);

    if (error) throw error;
  }
} 