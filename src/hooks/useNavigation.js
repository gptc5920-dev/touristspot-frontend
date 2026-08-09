import { useCallback, useEffect, useState } from 'react'
import { ROUTES } from '../config/travel'
import { viewFromPath } from '../lib/app'

export default function useNavigation() {
  const [view, setView] = useState(() => viewFromPath(window.location.pathname))

  const navigateTo = useCallback((nextView, { replace = false } = {}) => {
    const path = ROUTES[nextView] || ROUTES.home
    setView(nextView)
    if (window.location.pathname !== path) {
      window.history[replace ? 'replaceState' : 'pushState']({}, '', path)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const syncViewWithHistory = () => setView(viewFromPath(window.location.pathname))
    window.addEventListener('popstate', syncViewWithHistory)
    return () => window.removeEventListener('popstate', syncViewWithHistory)
  }, [])

  return { view, navigateTo }
}
