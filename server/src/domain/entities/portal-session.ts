import { PortalSession } from '../../types/portal-session.types';

export class PortalSessionEntity implements PortalSession {
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

  constructor(data: PortalSession) {
    this.id = data.id;
    this.company_id = data.company_id;
    this.contact_id = data.contact_id;
    this.token = data.token;
    this.expires_at = new Date(data.expires_at);
    this.created_at = new Date(data.created_at);
    this.updated_at = new Date(data.updated_at);
    this.last_accessed_at = new Date(data.last_accessed_at);
    this.user_agent = data.user_agent;
    this.ip_address = data.ip_address;
  }
} 