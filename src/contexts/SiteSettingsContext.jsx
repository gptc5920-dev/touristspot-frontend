import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiEndpoint, readApiJson, resolveMediaUrl } from '../api'
import { DEFAULT_SITE_SETTINGS } from '../config/siteSettings'
import { SiteSettingsContext } from './siteSettingsState'

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SITE_SETTINGS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function loadSettings() {
      try {
        const response = await fetch(apiEndpoint('/settings/'), { credentials: 'include' })
        const body = await readApiJson(response)
        if (active && response.ok && body.settings) {
          setSettings((current) => ({ ...current, ...body.settings, logo_url: resolveMediaUrl(body.settings.logo_url) }))
        }
      } catch {
        // Keep the local defaults available when the API is temporarily offline.
      } finally {
        if (active) setLoading(false)
      }
    }
    loadSettings()
    return () => { active = false }
  }, [])

  useEffect(() => {
    document.title = settings.site_name
  }, [settings.site_name])

  const updateSettings = useCallback((nextSettings) => {
    setSettings((current) => ({ ...current, ...nextSettings, logo_url: resolveMediaUrl(nextSettings.logo_url ?? current.logo_url) }))
  }, [])

  const value = useMemo(() => ({
    settings,
    loading,
    updateSettings,
  }), [loading, settings, updateSettings])

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>
}
