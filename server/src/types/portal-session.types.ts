export type PortalSession = {
  id: number;
  company_id: number;
  contact_id: number;
  token: string;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
  last_accessed_at: Date;
  user_agent: string | null;
  ip_address: string | null;
};

export type CreatePortalSessionDTO = Omit<PortalSession, 'id' | 'created_at' | 'updated_at' | 'last_accessed_at'>;
export type UpdatePortalSessionDTO = Pick<PortalSession, 'last_accessed_at'>; 