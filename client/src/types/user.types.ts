export interface User {
  id: number
  company_id: number
  role: 'customer' | 'agent' | 'admin'
  full_name: string
  email: string
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  team_id: number | null
  created_at: string
  updated_at: string
  archived_at: string | null
  last_login_ip: string | null
} 