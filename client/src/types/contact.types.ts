export interface Contact {
  id: number
  company_id: number
  full_name: string
  email: string
  phone: string | null
  status: 'active' | 'archived'
  created_at: string
  updated_at: string
  portal_enabled?: boolean
  portal_username?: string
  last_portal_login?: string
  metadata?: Record<string, any>
} 