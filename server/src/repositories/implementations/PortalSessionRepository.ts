import { SupabaseClient } from '@supabase/supabase-js';
import { IPortalSessionRepository } from '../interfaces/IPortalSessionRepository';
import { PortalSession, CreatePortalSessionDTO, UpdatePortalSessionDTO } from '../../types/portal-session.types';
import { PortalSessionEntity } from '../../domain/entities/portal-session';

export class PortalSessionRepository implements IPortalSessionRepository {
  private readonly tableName = 'portal_sessions';

  constructor(private readonly supabase: SupabaseClient) {}

  async create(data: CreatePortalSessionDTO): Promise<PortalSession> {
    const { data: session, error } = await this.supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return new PortalSessionEntity(session);
  }

  async findById(id: number): Promise<PortalSession | null> {
    const { data: session, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    return session ? new PortalSessionEntity(session) : null;
  }

  async findByToken(token: string): Promise<PortalSession | null> {
    const { data: session, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('token', token)
      .single();

    if (error) throw error;
    return session ? new PortalSessionEntity(session) : null;
  }

  async findByContactId(contactId: number): Promise<PortalSession[]> {
    const { data: sessions, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('contact_id', contactId);

    if (error) throw error;
    return sessions.map(session => new PortalSessionEntity(session));
  }

  async findActiveByContactId(contactId: number): Promise<PortalSession[]> {
    const { data: sessions, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('contact_id', contactId)
      .gt('expires_at', new Date().toISOString());

    if (error) throw error;
    return sessions.map(session => new PortalSessionEntity(session));
  }

  async updateLastAccessed(id: number): Promise<PortalSession> {
    const { data: session, error } = await this.supabase
      .from(this.tableName)
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return new PortalSessionEntity(session);
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async deleteExpired(): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) throw error;
  }

  async update(id: number, data: UpdatePortalSessionDTO): Promise<PortalSession> {
    const { data: session, error } = await this.supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return new PortalSessionEntity(session);
  }
} 