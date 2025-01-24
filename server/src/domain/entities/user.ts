import { User } from '../../types/user.types';

export class UserEntity implements User {
  id: number;
  company_id: number;
  role: User['role'];
  full_name: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
  archived_at: Date | null;
  status: User['status'];
  team_id: number | null;
  last_login_ip: string | null;

  constructor(data: User) {
    this.id = data.id;
    this.company_id = data.company_id;
    this.role = data.role;
    this.full_name = data.full_name;
    this.email = data.email;
    this.password = data.password;
    this.created_at = data.created_at ? new Date(data.created_at) : new Date();
    this.updated_at = data.updated_at ? new Date(data.updated_at) : new Date();
    this.archived_at = data.archived_at ? new Date(data.archived_at) : null;
    this.status = data.status;
    this.team_id = data.team_id;
    this.last_login_ip = data.last_login_ip;
  }
} 