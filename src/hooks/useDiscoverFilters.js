import { useCallback, useEffect, useState } from 'react'
import { readDiscoverFilters, writeDiscoverFilters } from '../lib/discoverFilters'

function readFilters() {
  return readDiscoverFilters(window.location.search)
}

export default function useDiscoverFilters() {
  const [filters, setFilters] = useState(readFilters)
  useEffect(() => {
    const sync = () => setFilters(readFilters())
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])
  const updateFilters = useCallback((changes) => {
    const next = { ...readFilters(), ...changes }
    const url = new URL(window.location.href)
    window.history.replaceState(window.history.state, '', writeDiscoverFilters(url, next))
    setFilters(next)
  }, [])
  return [filters, updateFilters]
}
