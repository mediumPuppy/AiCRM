export interface Ticket {
  id: number
  company_id: number
  contact_id: number
  assigned_to: number
  subject: string
  description: string
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  created_at: string
  updated_at: string
  tags: string[]
  internal_notes: string[]
} 