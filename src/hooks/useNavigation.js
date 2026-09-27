import { useCallback, useEffect, useState } from 'react'
import { ROUTES } from '../config/travel'
import { viewFromPath } from '../lib/app'

export default function useNavigation() {
  const [view, setView] = useState(() => viewFromPath(window.location.pathname))

  const navigateTo = useCallback((nextView, { replace = false } = {}) => {
    const resolvedView = Object.hasOwn(ROUTES, nextView) ? nextView : 'home'
    const path = ROUTES[resolvedView]
    setView(resolvedView)
    if (window.location.pathname !== path) {
      window.history[replace ? 'replaceState' : 'pushState']({}, '', path)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const syncViewWithHistory = () => {
      const nextView = viewFromPath(window.location.pathname)
      const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/'
      const isKnownPath = Object.values(ROUTES)
        .some((path) => (path.replace(/\/+$/, '') || '/') === normalizedPath)

      setView(nextView)
      if (!isKnownPath) window.history.replaceState({}, '', ROUTES.home)
    }

    syncViewWithHistory()
    window.addEventListener('popstate', syncViewWithHistory)
    return () => window.removeEventListener('popstate', syncViewWithHistory)
  }, [])

  return { view, navigateTo }
}
