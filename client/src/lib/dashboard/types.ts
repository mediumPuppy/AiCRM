export type CompanyBranding = {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  logo_url: string | null;
  favicon_url: string | null;
  company_url: string | null;
  email_template: string | null;
  portal_theme: 'light' | 'dark';
  font_family: string;
  border_radius: string;
  button_style: 'rounded' | 'pill' | 'square';
  navigation_style: 'sidebar' | 'top' | 'minimal';
  card_style: 'flat' | 'raised' | 'bordered';
  loading_animation: 'pulse' | 'spinner' | 'skeleton';
  custom_css: string | null;
  layout_density: 'comfortable' | 'compact' | 'spacious';
}

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  totalContacts: number;
  activeChats: number;
  publishedArticles: number;
} 