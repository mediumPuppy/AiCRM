"use client"

import { createContext, useContext, useEffect } from "react"
import { useCompanyBranding } from "../../hooks/useCompanyBranding"
import { CompanyBranding } from "../../lib/dashboard/types"

type CompanyThemeProviderProps = {
  children: React.ReactNode
  companyId?: number
}

type CompanyThemeState = {
  branding: CompanyBranding | null
}

const CompanyThemeContext = createContext<CompanyThemeState | undefined>(undefined)

export function useCompanyTheme() {
  const context = useContext(CompanyThemeContext)
  if (!context) throw new Error("useCompanyTheme must be used within CompanyThemeProvider")
  return context
}

export function CompanyThemeProvider({
  children,
  companyId = 1,
}: CompanyThemeProviderProps) {
  const { branding } = useCompanyBranding(companyId)

  useEffect(() => {
    if (!branding) return

    const root = document.documentElement
    root.style.setProperty("--primary", branding.primary_color)
    root.style.setProperty("--secondary", branding.secondary_color)
    root.style.setProperty("--accent", branding.accent_color)
    root.style.setProperty("--radius", branding.border_radius)
    root.style.setProperty("--font-family", branding.font_family)
  }, [branding])

  return (
    <CompanyThemeContext.Provider value={{ branding: branding || null }}>
      {children}
    </CompanyThemeContext.Provider>
  )
} 