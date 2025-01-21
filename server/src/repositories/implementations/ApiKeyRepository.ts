import { SupabaseClient } from '@supabase/supabase-js';
import { IApiKeyRepository } from '@/repositories/interfaces/IApiKeyRepository';
import { ApiKey, CreateApiKeyDTO, UpdateApiKeyDTO } from '@/types/api-key.types';
import { ApiKeyEntity } from '@/domain/entities/api-key';
import { generateApiKey } from '@/utils/api-key';

export class ApiKeyRepository implements IApiKeyRepository {
  private readonly tableName = 'api_keys';

  constructor(private readonly supabase: SupabaseClient) {
    console.log('ApiKeyRepository constructed with:', supabase);
  }

  async create(data: CreateApiKeyDTO): Promise<ApiKey> {
    const apiKey = generateApiKey();
    
    // Create ISO string directly for 7 days from now
    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: createdKey, error } = await this.supabase
      .from(this.tableName)
      .insert({ ...data, api_key: apiKey, expires_at })
      .select()
      .single();


    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    return new ApiKeyEntity(createdKey);
  }

  async findById(id: number): Promise<ApiKey | null> {
    const { data: apiKey, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    return apiKey ? new ApiKeyEntity(apiKey) : null;
  }

  async findByKey(apiKey: string): Promise<ApiKey | null> {
    const { data: key, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('api_key', apiKey)
      .single();

    if (error) throw error;
    return key ? new ApiKeyEntity(key) : null;
  }

  async findByCompanyId(companyId: number): Promise<ApiKey[]> {
    const { data: apiKeys, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('company_id', companyId);

    if (error) throw error;
    return apiKeys.map(key => new ApiKeyEntity(key));
  }

  async findActiveByCompanyId(companyId: number): Promise<ApiKey[]> {
    const now = new Date().toISOString();
    const { data: apiKeys, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('company_id', companyId)
      .or(`expires_at.gt.${now},expires_at.is.null`);

    if (error) throw error;
    return apiKeys.map(key => new ApiKeyEntity(key));
  }

  async update(id: number, data: UpdateApiKeyDTO): Promise<ApiKey> {
    const { data: apiKey, error } = await this.supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return new ApiKeyEntity(apiKey);
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
} 