export type UserRole = 'customer' | 'agent' | 'admin';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export type User = {
  id: number;
  company_id: number;
  role: UserRole;
  full_name: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
  archived_at: Date | null;
  status: UserStatus;
  team_id: number | null;
  last_login_ip: string | null;
};

export type CreateUserDTO = Omit<User, 'id' | 'created_at' | 'updated_at' | 'archived_at'>;
export type UpdateUserDTO = Partial<Omit<CreateUserDTO, 'company_id'>>; 