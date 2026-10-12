import DestinationImage from '../common/DestinationImage'
import DestinationDetailsDialog from '../recommendations/DestinationDetailsDialog'
import useDiscoverFilters from '../../hooks/useDiscoverFilters'
import { peso } from '../../lib/app'
import { useEffect, useMemo, useState } from 'react'
import { Bookmark, MapPin, MapPinned, Plus, Search, SlidersHorizontal, Star, X } from '../../fontawesome-icons'
import { GOOGLE_MAP_URL } from '../../config/travel'
import { useSiteSettings } from '../../contexts/siteSettingsState'

const SAVED_KEY = 'travel-osmena-discover-saved'
const CATEGORY_DETAILS = {
  'Nature & eco-tourism': ['🌿', 'Eco-Tourism'],
  'Beach & coastal': ['🏖️', 'Beaches'],
  'Waterfall & river': ['🌊', 'Waterfalls'],
  'Mountain & viewpoint': ['⛰️', 'Highlands & Viewpoints'],
  'Historical site': ['🏛️', 'Historical Sites'],
  'Cultural heritage': ['🎭', 'Cultural Heritage'],
  'Religious site': ['⛪', 'Faith & Heritage'],
  'Food & dining': ['☕', 'Food & Coffee'],
  'Adventure & recreation': ['🥾', 'Adventure'],
  'Park & family attraction': ['🌳', 'Parks & Family'],
  'Shopping & local products': ['🛍️', 'Local Finds'],
  Accommodation: ['⛺', 'Stays & Camps'],
}

function readSavedIds() {
  try {
    const value = JSON.parse(window.localStorage.getItem(SAVED_KEY) || '[]')
    return Array.isArray(value) ? value.map(String) : []
  } catch {
    return []
  }
}

function mapUrl(destination) {
  const [latitude, longitude] = destination.coordinates || []
  const query = Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude)) && latitude != null && longitude != null
    ? `${latitude},${longitude}`
    : [destination.name, destination.address || destination.area].filter(Boolean).join(', ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export default function ClientDiscoverPage({ destinations, loading, error, onRetry, onPlan, onFeedback }) {
  const { settings } = useSiteSettings()
  const [filters, updateFilters] = useDiscoverFilters()
  const { searchTerm, category, freeOnly, savedOnly, sortBy } = filters
  const [query, setQuery] = useState(searchTerm)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [details, setDetails] = useState(null)
  useEffect(() => setQuery(searchTerm), [searchTerm])
  const setSearchTerm = (value) => updateFilters({ searchTerm: value })
  const setCategory = (value) => updateFilters({ category: value })
  const setFreeOnly = (value) => updateFilters({ freeOnly: value })
  const setSavedOnly = (value) => updateFilters({ savedOnly: value })
  const setSortBy = (value) => updateFilters({ sortBy: value })
  const [savedIds, setSavedIds] = useState(readSavedIds)

  const categories = useMemo(() => [...new Set(destinations.map((item) => item.category).filter(Boolean))]
    .sort((first, second) => first.localeCompare(second)), [destinations])
  const visibleDestinations = useMemo(() => {
    const text = searchTerm.toLocaleLowerCase()
    return destinations.filter((item) => {
      const matchesSearch = !text || [item.name, item.category, item.area, item.address, item.description]
        .some((value) => String(value || '').toLocaleLowerCase().includes(text))
      return matchesSearch && (!category || item.category === category)
        && (!freeOnly || Number(item.entrance_fee || 0) === 0)
        && (!savedOnly || savedIds.includes(String(item.id)))
    }).sort((first, second) => sortBy === 'name'
      ? first.name.localeCompare(second.name)
      : Number(second.average_rating || 0) - Number(first.average_rating || 0)
        || Number(second.review_count || 0) - Number(first.review_count || 0)
        || first.name.localeCompare(second.name))
  }, [destinations, searchTerm, category, freeOnly, savedOnly, savedIds, sortBy])

  function toggleSaved(id) {
    const next = savedIds.includes(String(id)) ? savedIds.filter((item) => item !== String(id)) : [...savedIds, String(id)]
    setSavedIds(next)
    try { window.localStorage.setItem(SAVED_KEY, JSON.stringify(next)) } catch { /* Browsing remains available when storage is disabled. */ }
  }

  function clearFilters() {
    setQuery('')
    updateFilters({ searchTerm: '', category: '', freeOnly: false, savedOnly: false, sortBy: 'rating' })
  }

  return <main className="discover-page">
    <div className="discover-container">
      <header className="discover-heading"><h1>Discover your next escape.</h1><p>Browse curated local experiences and hidden gems in {settings.municipality_name}.</p></header>
      <div className="discover-toolbar">
        <form className="discover-search" role="search" onSubmit={(event) => { event.preventDefault(); setSearchTerm(query.trim()) }}>
          <label className="sr-only" htmlFor="discover-query">Search destinations</label>
          <input id="discover-query" type="search" value={query} onChange={(event) => { setQuery(event.target.value); if (!event.target.value) setSearchTerm('') }} placeholder="Search destinations, trails, farms, campsites..." />
          <button type="submit" aria-label="Search destinations"><Search size={17} /></button>
        </form>
        <button type="button" className={`discover-filter-trigger ${filtersOpen ? 'active' : ''}`} aria-expanded={filtersOpen} onClick={() => setFiltersOpen((current) => !current)}><SlidersHorizontal size={15} /> Filter</button>
      </div>
      {filtersOpen && <section className="discover-filters" aria-label="Additional filters">
        <label><input type="checkbox" checked={freeOnly} onChange={(event) => setFreeOnly(event.target.checked)} /> Free entrance</label>
        <label><input type="checkbox" checked={savedOnly} onChange={(event) => setSavedOnly(event.target.checked)} /> Saved places</label>
        <label>Sort by <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="rating">Top rated</option><option value="name">Name A–Z</option></select></label>
        <button type="button" onClick={clearFilters}><X size={13} /> Clear filters</button>
      </section>}

      <div className="discover-active-filters" aria-label="Active filters">
        {searchTerm && <button type="button" onClick={() => { setSearchTerm(''); setQuery('') }}>Search: {searchTerm} <X size={14} /><span className="sr-only">Remove search</span></button>}
        {category && <button type="button" onClick={() => setCategory('')}>{category} <X size={14} /><span className="sr-only">Remove category</span></button>}
        {freeOnly && <button type="button" onClick={() => setFreeOnly(false)}>Free entrance <X size={14} /><span className="sr-only">Remove filter</span></button>}
        {savedOnly && <button type="button" onClick={() => setSavedOnly(false)}>Saved places <X size={14} /><span className="sr-only">Remove filter</span></button>}
        {sortBy === 'name' && <button type="button" onClick={() => setSortBy('rating')}>Name A–Z <X size={14} /><span className="sr-only">Reset sort</span></button>}
      </div>
      <section className="discover-results" aria-labelledby="discover-categories-title">
        {error && !destinations.length && !loading && <div className="discover-load-error" role="alert"><p>Unable to load destinations. Please try again.</p><button type="button" onClick={onRetry}>Retry</button></div>}
        <div className="discover-category-row"><h2 id="discover-categories-title">Explore by Category</h2><div className="discover-category-list"><button type="button" className={!category ? 'selected' : ''} aria-pressed={!category} onClick={() => setCategory('')}>All places</button>{categories.map((item) => { const [emoji, label] = CATEGORY_DETAILS[item] || ['📍', item]; return <button type="button" key={item} className={category === item ? 'selected' : ''} aria-pressed={category === item} onClick={() => setCategory(category === item ? '' : item)}><span aria-hidden="true">{emoji}</span> {label}</button> })}</div></div>
        <p className="discover-result-count" aria-live="polite">{loading ? 'Loading verified destinations…' : error && !destinations.length ? 'Destinations unavailable' : `${visibleDestinations.length} destination${visibleDestinations.length === 1 ? '' : 's'} to explore`}</p>
        <div className="discover-grid">
          {loading ? [1, 2, 3, 4, 5].map((item) => <div key={item} className="discover-card-skeleton" />)
            : error && !destinations.length ? null : visibleDestinations.length ? visibleDestinations.map((destination) => {
              const saved = savedIds.includes(String(destination.id))
              const [emoji, label] = CATEGORY_DETAILS[destination.category] || ['📍', destination.category]
              return <article className="discover-card" key={destination.id}>
                <div className="discover-card-image"><DestinationImage destination={destination} />
                  <button type="button" className={`discover-bookmark ${saved ? 'saved' : ''}`} aria-pressed={saved} aria-label={`${saved ? 'Remove' : 'Save'} ${destination.name}${saved ? ' from saved places' : ' to saved places'}`} onClick={() => toggleSaved(destination.id)}><Bookmark size={15} /></button>
                  <button type="button" className="discover-add" onClick={() => onPlan(destination.id)}><Plus size={12} /> Add to itinerary</button>
                </div>
                <div className="discover-card-body"><h3><button type="button" className="discover-details-trigger" onClick={() => setDetails(destination)}>{destination.name}</button></h3><button type="button" className="discover-rating" onClick={() => onFeedback(destination)} aria-label={`Read reviews for ${destination.name}`}><Star size={14} fill={destination.average_rating ? 'currentColor' : 'none'} /><strong>{destination.average_rating ?? 'New'}</strong><span>· {destination.review_count || 0} review{destination.review_count === 1 ? '' : 's'}</span></button><p className="discover-location"><MapPin size={14} /> {destination.area || destination.address || 'Location not listed'}</p><dl className="discover-facts"><div><dt>Entrance</dt><dd>{destination.entrance_fee == null ? 'Not listed' : Number(destination.entrance_fee) === 0 ? 'Free' : peso.format(Number(destination.entrance_fee))}</dd></div><div><dt>Visit</dt><dd>{destination.visit_minutes ? `${destination.visit_minutes} min` : 'Not listed'}</dd></div></dl><span className="discover-category-tag"><span aria-hidden="true">{emoji}</span> {label}</span><a className="discover-card-map" href={mapUrl(destination)} target="_blank" rel="noopener noreferrer"><MapPin size={12} /> View map</a></div>
              </article>
            }) : <div className="discover-empty"><Search size={26} /><h3>{destinations.length ? 'No matching destinations' : 'No destinations available yet'}</h3><p>{destinations.length ? 'Try another search or clear the filters to explore all verified places.' : 'Verified places will appear here when the tourism team publishes them.'}</p>{destinations.length > 0 && <button type="button" onClick={clearFilters}>Show all places</button>}</div>}
        </div>
      </section>
    </div>
    <a className="discover-floating-map" href={GOOGLE_MAP_URL} target="_blank" rel="noopener noreferrer"><MapPinned size={17} /> View Map <span aria-hidden="true">🗺️</span></a>
    {details && <DestinationDetailsDialog destination={details} onClose={() => setDetails(null)} onAdd={(destination) => { setDetails(null); onPlan(destination.id) }} />}
    <footer className="discover-footer"><span>{settings.site_name}</span><span>© {new Date().getFullYear()} {settings.municipality_name}. All rights reserved.</span></footer>
  </main>
}
