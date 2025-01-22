export type CompanyBranding = {
  primary_color: string
  secondary_color: string
  accent_color: string
  font_family: string
  border_radius: string
  button_style: 'rounded' | 'pill' | 'square'
  navigation_style: 'sidebar' | 'top' | 'minimal'
  card_style: 'flat' | 'raised' | 'bordered'
  loading_animation: 'pulse' | 'spinner' | 'skeleton'
  layout_density: 'comfortable' | 'compact' | 'spacious'
}

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  totalContacts: number;
  activeChats: number;
  publishedArticles: number;
} 