export type Contact = {
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
};

export type CreateContactDTO = Omit<Contact, 'id' | 'created_at' | 'updated_at' | 'archived_at' | 'last_portal_login'>;
export type UpdateContactDTO = Partial<Omit<CreateContactDTO, 'company_id'>>; 