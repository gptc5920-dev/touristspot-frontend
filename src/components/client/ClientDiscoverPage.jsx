import { useMemo, useState } from 'react'
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

export default function ClientDiscoverPage({ destinations, loading, error, onPlan, onFeedback }) {
  const { settings } = useSiteSettings()
  const [query, setQuery] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [freeOnly, setFreeOnly] = useState(false)
  const [savedOnly, setSavedOnly] = useState(false)
  const [sortBy, setSortBy] = useState('rating')
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
    setSearchTerm('')
    setCategory('')
    setFreeOnly(false)
    setSavedOnly(false)
    setSortBy('rating')
  }

  return <main className="discover-page">
    <div className="discover-container">
      <header className="discover-heading"><h1>Discover your next escape. Browse curated local experiences and hidden gems in {settings.municipality_name}.</h1></header>
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

      <section className="discover-results" aria-labelledby="discover-categories-title">
        {error && !destinations.length && !loading && <p className="discover-load-error" role="alert">{error}</p>}
        <div className="discover-category-row"><h2 id="discover-categories-title">Explore by Category</h2><div className="discover-category-list"><button type="button" className={!category ? 'selected' : ''} aria-pressed={!category} onClick={() => setCategory('')}>All places</button>{categories.map((item) => { const [emoji, label] = CATEGORY_DETAILS[item] || ['📍', item]; return <button type="button" key={item} className={category === item ? 'selected' : ''} aria-pressed={category === item} onClick={() => setCategory((current) => current === item ? '' : item)}><span aria-hidden="true">{emoji}</span> {label}</button> })}</div></div>
        <p className="discover-result-count" aria-live="polite">{loading ? 'Loading verified destinations…' : `${visibleDestinations.length} destination${visibleDestinations.length === 1 ? '' : 's'} to explore`}</p>
        <div className="discover-grid">
          {loading ? [1, 2, 3, 4, 5].map((item) => <div key={item} className="discover-card-skeleton" />)
            : visibleDestinations.length ? visibleDestinations.map((destination) => {
              const saved = savedIds.includes(String(destination.id))
              const [emoji, label] = CATEGORY_DETAILS[destination.category] || ['📍', destination.category]
              return <article className="discover-card" key={destination.id}>
                <div className="discover-card-image">{destination.image_url ? <img src={destination.image_url} alt={destination.name} loading="lazy" /> : <span className="discover-image-placeholder"><MapPinned size={32} /></span>}
                  <button type="button" className={`discover-bookmark ${saved ? 'saved' : ''}`} aria-pressed={saved} aria-label={`${saved ? 'Remove' : 'Save'} ${destination.name}${saved ? ' from saved places' : ' to saved places'}`} onClick={() => toggleSaved(destination.id)}><Bookmark size={15} /></button>
                  <button type="button" className="discover-add" onClick={() => onPlan(destination.id)}><Plus size={12} /> Add to itinerary</button>
                </div>
                <div className="discover-card-body"><h3>{destination.name}</h3><button type="button" className="discover-rating" onClick={() => onFeedback(destination)} aria-label={`Read reviews for ${destination.name}`}><Star size={14} fill={destination.average_rating ? 'currentColor' : 'none'} /><strong>{destination.average_rating ?? 'New'}</strong><span>· {destination.category}</span></button><span className="discover-category-tag"><span aria-hidden="true">{emoji}</span> {label}</span><a className="discover-card-map" href={mapUrl(destination)} target="_blank" rel="noopener noreferrer"><MapPin size={12} /> View map</a></div>
              </article>
            }) : <div className="discover-empty"><Search size={26} /><h3>{destinations.length ? 'No matching destinations' : 'No destinations available yet'}</h3><p>{destinations.length ? 'Try another search or clear the filters to explore all verified places.' : 'Verified places will appear here when the tourism team publishes them.'}</p>{destinations.length > 0 && <button type="button" onClick={clearFilters}>Show all places</button>}</div>}
        </div>
      </section>
    </div>
    <a className="discover-floating-map" href={GOOGLE_MAP_URL} target="_blank" rel="noopener noreferrer"><MapPinned size={17} /> View Map <span aria-hidden="true">🗺️</span></a>
    <footer className="discover-footer"><span>{settings.site_name}</span><span>© {new Date().getFullYear()} {settings.municipality_name}. All rights reserved.</span></footer>
  </main>
}
