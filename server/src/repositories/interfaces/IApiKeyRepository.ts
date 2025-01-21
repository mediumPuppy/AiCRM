import { ApiKey, CreateApiKeyDTO, UpdateApiKeyDTO } from '../../types/api-key.types';

export interface IApiKeyRepository {
  create(data: CreateApiKeyDTO): Promise<ApiKey>;
  findById(id: number): Promise<ApiKey | null>;
  findByKey(apiKey: string): Promise<ApiKey | null>;
  findByCompanyId(companyId: number): Promise<ApiKey[]>;
  findActiveByCompanyId(companyId: number): Promise<ApiKey[]>;
  update(id: number, data: UpdateApiKeyDTO): Promise<ApiKey>;
  delete(id: number): Promise<void>;
  deleteExpired(): Promise<void>;
} 