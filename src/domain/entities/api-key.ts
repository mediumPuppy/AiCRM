import { ApiKey } from '../../types/api-key.types';

export class ApiKeyEntity implements ApiKey {
  id: number;
  company_id: number;
  api_key: string;
  label: string | null;
  created_at: Date;
  updated_at: Date;
  expires_at: Date | null;

  constructor(data: ApiKey) {
    this.id = data.id;
    this.company_id = data.company_id;
    this.api_key = data.api_key;
    this.label = data.label;
    this.created_at = new Date(data.created_at);
    this.updated_at = new Date(data.updated_at);
    this.expires_at = data.expires_at ? new Date(data.expires_at) : null;
  }
} 