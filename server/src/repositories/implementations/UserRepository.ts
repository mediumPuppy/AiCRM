import { SupabaseClient } from '@supabase/supabase-js';
import { IUserRepository } from '../interfaces/IUserRepository';
import { User, CreateUserDTO, UpdateUserDTO } from '../../types/user.types';
import { UserEntity } from '../../domain/entities/user';

export class UserRepository implements IUserRepository {
  private readonly tableName = 'users';

  constructor(private readonly supabase: SupabaseClient) {}

  async create(data: CreateUserDTO): Promise<User> {
    console.log('A. Starting user creation');
    
    // First insert the user
    const { data: inserted, error: insertError } = await this.supabase
      .from(this.tableName)
      .insert(data);

    if (insertError) {
      console.error('B. Insert error:', insertError);
      throw insertError;
    }

    // Then fetch the newly created user
    const { data: user, error: selectError } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('email', data.email)
      .single();

    if (selectError) {
      console.error('C. Select error:', selectError);
      throw selectError;
    }

    console.log('D. User fetched:', { id: user.id, email: user.email });
    return new UserEntity(user);
  }

  async findById(id: number): Promise<User | null> {
    const { data: user, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    return user ? new UserEntity(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const { data: user, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('Find by email error:', error);
      throw error;
    }
    return user ? new UserEntity(user) : null;
  }

  async findByCompanyId(companyId: number): Promise<User[]> {
    const { data: users, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('company_id', companyId);

    if (error) throw error;
    return users.map(user => new UserEntity(user));
  }

  async findByTeamId(teamId: number): Promise<User[]> {
    const { data: users, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('team_id', teamId);

    if (error) throw error;
    return users.map(user => new UserEntity(user));
  }

  async update(id: number, data: UpdateUserDTO): Promise<User> {
    const { data: user, error } = await this.supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return new UserEntity(user);
  }

  async archive(id: number): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .update({ archived_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
} 