import { SupabaseClient } from '@supabase/supabase-js';
import { IContactRepository } from '../interfaces/IContactRepository';
import { Contact, CreateContactDTO, UpdateContactDTO } from '../../types/contact.types';
import { ContactEntity } from '../../domain/entities/contact';

export class ContactRepository implements IContactRepository {
  private readonly tableName = 'contacts';

  constructor(private readonly supabase: SupabaseClient) {}

  async create(data: CreateContactDTO): Promise<Contact> {
    
    // First insert the contact
    const { data: inserted, error: insertError } = await this.supabase
      .from(this.tableName)
      .insert(data);

    if (insertError) {
      throw insertError;
    }

    // Then fetch the newly created contact
    const { data: contact, error: selectError } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('email', data.email)
      .maybeSingle();

    if (selectError) {
      throw selectError;
    }

    return new ContactEntity(contact);
  }

  async findById(id: number): Promise<Contact | null> {
    const { data: contact, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    return contact ? new ContactEntity(contact) : null;
  }

  async findByEmail(email: string): Promise<Contact | null> {
    const { data: contact, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      throw error;
    }
    return contact ? new ContactEntity(contact) : null;
  }

  async findByCompanyId(companyId: number): Promise<Contact[]> {
    const { data: contacts, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('company_id', companyId);

    if (error) throw error;
    return contacts.map(contact => new ContactEntity(contact));
  }

  async update(id: number, data: UpdateContactDTO): Promise<Contact> {
    const { data: contact, error } = await this.supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return new ContactEntity(contact);
  }

  async archive(id: number): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .update({
        archived_at: new Date().toISOString(),
        status: 'archived'
      })
      .eq('id', id);

    if (error) throw error;
  }

  async enablePortal(id: number, portalData: { email: string; username: string; password: string }): Promise<Contact> {
    const { data: contact, error } = await this.supabase
      .from(this.tableName)
      .update({
        portal_enabled: true,
        portal_email: portalData.email,
        portal_username: portalData.username,
        portal_password: portalData.password
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return new ContactEntity(contact);
  }

  async disablePortal(id: number): Promise<Contact> {
    const { data: contact, error } = await this.supabase
      .from(this.tableName)
      .update({
        portal_enabled: false,
        portal_email: null,
        portal_username: null,
        portal_password: null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return new ContactEntity(contact);
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
} 