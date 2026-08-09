import { createContext, useContext } from 'react'

export const SiteSettingsContext = createContext(null)

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext)
  if (!context) throw new Error('useSiteSettings must be used within SiteSettingsProvider.')
  return context
}
