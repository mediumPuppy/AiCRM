import { SupabaseClient } from '@supabase/supabase-js';
import { INoteRepository } from '../interfaces/INoteRepository';
import { Note, CreateNoteDTO, UpdateNoteDTO } from '../../types/note.types';
import { NoteEntity } from '../../domain/entities/note';

export class NoteRepository implements INoteRepository {
  private readonly tableName = 'notes';

  constructor(private readonly supabase: SupabaseClient) {}

  async create(data: CreateNoteDTO): Promise<Note> {
    const { data: note, error } = await this.supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return new NoteEntity(note);
  }

  async findById(id: number): Promise<Note | null> {
    const { data: note, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    return note ? new NoteEntity(note) : null;
  }

  async findByCompanyId(companyId: number): Promise<Note[]> {
    const { data: notes, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('company_id', companyId);

    if (error) throw error;
    return notes.map(note => new NoteEntity(note));
  }

  async findByUserId(userId: number): Promise<Note[]> {
    const { data: notes, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('user_id', userId);

    if (error) throw error;
    return notes.map(note => new NoteEntity(note));
  }

  async findByTarget(targetType: Note['target_type'], targetId: number): Promise<Note[]> {
    const { data: notes, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('target_type', targetType)
      .eq('target_id', targetId);

    if (error) throw error;
    return notes.map(note => new NoteEntity(note));
  }

  async update(id: number, data: UpdateNoteDTO): Promise<Note> {
    const { data: note, error } = await this.supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return new NoteEntity(note);
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
} 