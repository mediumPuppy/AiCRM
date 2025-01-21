import { SupabaseClient } from '@supabase/supabase-js';
import { ITeamRepository } from '../interfaces/ITeamRepository';
import { Team, CreateTeamDTO, UpdateTeamDTO } from '../../types/team.types';
import { TeamEntity } from '../../domain/entities/team';

export class TeamRepository implements ITeamRepository {
  private readonly tableName = 'teams';

  constructor(private readonly supabase: SupabaseClient) {}

  async create(data: CreateTeamDTO): Promise<Team> {
    const { data: team, error } = await this.supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return new TeamEntity(team);
  }

  async findById(id: number): Promise<Team | null> {
    const { data: team, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    return team ? new TeamEntity(team) : null;
  }

  async findByCompanyId(companyId: number): Promise<Team[]> {
    const { data: teams, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('company_id', companyId);

    if (error) throw error;
    return teams.map(team => new TeamEntity(team));
  }

  async update(id: number, data: UpdateTeamDTO): Promise<Team> {
    const { data: team, error } = await this.supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return new TeamEntity(team);
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
} 