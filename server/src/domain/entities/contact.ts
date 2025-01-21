import { Contact } from '../../types/contact.types';

export class ContactEntity implements Contact {
  id: number;
  company_id: number;
  full_name: string;
  email: string | null;
  phone: string | null;
  created_at: Date;
  updated_at: Date;
  metadata: Record<string, any> | null;
  archived_at: Date | null;
  status: 'active' | 'archived';
  portal_enabled: boolean;
  portal_email: string | null;
  portal_username: string | null;
  portal_password: string | null;
  last_portal_login: Date | null;

  constructor(data: Contact) {
    this.id = data.id;
    this.company_id = data.company_id;
    this.full_name = data.full_name;
    this.email = data.email;
    this.phone = data.phone;
    this.created_at = new Date(data.created_at);
    this.updated_at = new Date(data.updated_at);
    this.metadata = data.metadata;
    this.archived_at = data.archived_at ? new Date(data.archived_at) : null;
    this.status = data.status;
    this.portal_enabled = data.portal_enabled;
    this.portal_email = data.portal_email;
    this.portal_username = data.portal_username;
    this.portal_password = data.portal_password;
    this.last_portal_login = data.last_portal_login ? new Date(data.last_portal_login) : null;
  }
} 