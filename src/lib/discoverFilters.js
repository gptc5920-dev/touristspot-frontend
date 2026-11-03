export function readDiscoverFilters(search) {
  const params = new URLSearchParams(search)
  return {
    searchTerm: params.get('q') || '',
    categories: [...new Set(params.getAll('category').filter((value) => value && value !== 'Beach & coastal'))],
    freeOnly: params.get('free') === '1',
    savedOnly: params.get('saved') === '1',
    sortBy: params.get('sort') === 'name' ? 'name' : 'rating',
  }
}

export function writeDiscoverFilters(url, filters) {
  for (const [key, value] of Object.entries({ q: filters.searchTerm, free: filters.freeOnly ? '1' : '', saved: filters.savedOnly ? '1' : '', sort: filters.sortBy === 'name' ? 'name' : '' })) {
    if (value) url.searchParams.set(key, value)
    else url.searchParams.delete(key)
  }
  url.searchParams.delete('category')
  for (const category of filters.categories) url.searchParams.append('category', category)
  return `${url.pathname}${url.search}${url.hash}`
}
