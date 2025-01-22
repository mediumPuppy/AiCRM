import { useQuery } from '@tanstack/react-query'
import { CompanyBranding } from '../lib/dashboard/types'

const mockBranding: CompanyBranding = {
  primary_color: '#000000',
  secondary_color: '#ffffff',
  accent_color: '#007AFF',
  logo_url: null,
  favicon_url: null,
  company_url: null,
  email_template: null,
  portal_theme: 'light',
  font_family: 'Inter',
  border_radius: '8px',
  button_style: 'rounded',
  navigation_style: 'sidebar',
  card_style: 'flat',
  loading_animation: 'pulse',
  custom_css: null,
  layout_density: 'comfortable'
}

export function useCompanyBranding(companyId: number = 1) {
  const { data: branding, isLoading } = useQuery<CompanyBranding>({
    queryKey: ['company-branding', companyId],
    queryFn: async () => {
      // Mock delay to simulate network request
      // const response = await fetch(`/api/companies/${companyId}/branding`)
      // return response.json()
      await new Promise(resolve => setTimeout(resolve, 100))
      return mockBranding
    }
  })

  return { branding, isLoading }
} 