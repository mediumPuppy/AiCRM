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

export interface Note {
  id: number
  content: string
  created_at: string
  created_by: {
    id: number
    name: string
  }
}

export interface HistoryEntry {
  id: number
  action: string
  details: string
  created_at: string
  created_by: {
    id: number
    name: string
  }
}

export interface CreateContactData {
  company_id: number
  full_name: string
  email?: string
  phone?: string
  status?: 'active' | 'archived'
}

export type UpdateContactData = Partial<Omit<Contact, 'id' | 'created_at' | 'updated_at' | 'company_id'>> 