import { useCallback, useEffect, useState } from 'react'

function readFilters() {
  const params = new URLSearchParams(window.location.search)
  return {
    searchTerm: params.get('q') || '',
    category: params.get('category') || '',
    freeOnly: params.get('free') === '1',
    savedOnly: params.get('saved') === '1',
    sortBy: params.get('sort') === 'name' ? 'name' : 'rating',
  }
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
    for (const [key, value] of Object.entries({ q: next.searchTerm, category: next.category, free: next.freeOnly ? '1' : '', saved: next.savedOnly ? '1' : '', sort: next.sortBy === 'name' ? 'name' : '' })) {
      if (value) url.searchParams.set(key, value)
      else url.searchParams.delete(key)
    }
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
    setFilters(next)
  }, [])
  return [filters, updateFilters]
}
