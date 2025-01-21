import { ApiKey } from '@/types/api-key.types';

export class ApiKeyEntity implements ApiKey {
  id: number;
  company_id: number;
  api_key: string;
  label: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;

  constructor(data: ApiKey) {
    this.id = data.id;
    this.company_id = data.company_id;
    this.api_key = data.api_key;
    this.label = data.label;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.expires_at = data.expires_at;
  }
} 