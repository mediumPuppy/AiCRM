export type ApiKey = {
  id: number;
  company_id: number;
  api_key: string;
  label: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
};

export type CreateApiKeyDTO = Omit<ApiKey, 'id' | 'created_at' | 'updated_at' | 'api_key'>;
export type UpdateApiKeyDTO = Pick<ApiKey, 'label' | 'expires_at'>; 