import { SupabaseClient } from '@supabase/supabase-js';
import { ITicketRepository } from '../interfaces/ITicketRepository';
import { Ticket, CreateTicketDTO, UpdateTicketDTO } from '../../types/ticket.types';
import { TicketEntity } from '../../domain/entities/ticket';

export class TicketRepository implements ITicketRepository {
  private readonly tableName = 'tickets';

  constructor(private readonly supabase: SupabaseClient) {}

  async create(data: CreateTicketDTO): Promise<Ticket> {
    const { data: ticket, error } = await this.supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return new TicketEntity(ticket);
  }

  async findById(id: number): Promise<Ticket | null> {
    const { data: ticket, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    return ticket ? new TicketEntity(ticket) : null;
  }

  async findByCompanyId(companyId: number): Promise<Ticket[]> {
    const { data: tickets, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('company_id', companyId);

    if (error) throw error;
    return tickets.map(ticket => new TicketEntity(ticket));
  }

  async findByContactId(contactId: number): Promise<Ticket[]> {
    const { data: tickets, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('contact_id', contactId);

    if (error) throw error;
    return tickets.map(ticket => new TicketEntity(ticket));
  }

  async findByAssignedUser(userId: number): Promise<Ticket[]> {
    const { data: tickets, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('assigned_to', userId);

    if (error) throw error;
    return tickets.map(ticket => new TicketEntity(ticket));
  }

  async findByStatus(companyId: number, status: Ticket['status']): Promise<Ticket[]> {
    const { data: tickets, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('company_id', companyId)
      .eq('status', status);

    if (error) throw error;
    return tickets.map(ticket => new TicketEntity(ticket));
  }

  async update(id: number, data: UpdateTicketDTO): Promise<Ticket> {
    const { data: ticket, error } = await this.supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return new TicketEntity(ticket);
  }

  async updateStatus(id: number, status: Ticket['status']): Promise<Ticket> {
    return this.update(id, { status });
  }

  async updateAssignment(id: number, userId: number | null): Promise<Ticket> {
    return this.update(id, { assigned_to: userId });
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
} 