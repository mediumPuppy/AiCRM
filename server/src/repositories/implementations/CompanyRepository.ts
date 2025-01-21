import { SupabaseClient } from '@supabase/supabase-js';
import { ICompanyRepository } from '../interfaces/ICompanyRepository';
import { Company, CreateCompanyDTO, UpdateCompanyDTO } from '../../types/company.types';
import { CompanyEntity } from '../../domain/entities/company';

export class CompanyRepository implements ICompanyRepository {
  private readonly tableName = 'companies';

  constructor(private readonly supabase: SupabaseClient) {}

  async create(data: CreateCompanyDTO): Promise<Company> {
    const { data: company, error } = await this.supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return new CompanyEntity(company);
  }

  async findById(id: number): Promise<Company | null> {
    const { data: company, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    return company ? new CompanyEntity(company) : null;
  }

  async findAll(): Promise<Company[]> {
    const { data: companies, error } = await this.supabase
      .from(this.tableName)
      .select();

    if (error) throw error;
    return companies.map(company => new CompanyEntity(company));
  }

  async update(id: number, data: UpdateCompanyDTO): Promise<Company> {
    const { data: company, error } = await this.supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return new CompanyEntity(company);
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
