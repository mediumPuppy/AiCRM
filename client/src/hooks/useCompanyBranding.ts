import { useQuery } from '@tanstack/react-query'
import { CompanyBranding } from '../lib/dashboard/types'

export function useCompanyBranding(companyId: number = 1) {
  const { data: branding, isLoading } = useQuery<CompanyBranding>({
    queryKey: ['company-branding', companyId],
    queryFn: async () => {
      const response = await fetch(`/api/companies/${companyId}/branding`)
      return response.json()
    }
  })

  return { branding, isLoading }
} 