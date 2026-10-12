import { useCallback, useEffect, useRef, useState } from 'react'
import { ROUTES } from '../config/travel'
import { viewFromPath } from '../lib/app'

export default function useNavigation() {
  const [view, setView] = useState(() => viewFromPath(window.location.pathname))

  const discoverSearch = useRef(viewFromPath(window.location.pathname) === 'discover' ? window.location.search : '')

  const navigateTo = useCallback((nextView, { replace = false } = {}) => {
    const resolvedView = Object.hasOwn(ROUTES, nextView) ? nextView : 'home'
    if (viewFromPath(window.location.pathname) === 'discover') discoverSearch.current = window.location.search
    const path = ROUTES[resolvedView] + (resolvedView === 'discover' ? discoverSearch.current : '')
    setView(resolvedView)
    if (`${window.location.pathname}${window.location.search}` !== path) {
      window.history[replace ? 'replaceState' : 'pushState']({}, '', path)
    }
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
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
