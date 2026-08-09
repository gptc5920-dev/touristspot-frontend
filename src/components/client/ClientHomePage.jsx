import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight, BadgeCheck, CalendarDays, ChevronLeft, ChevronRight, MapPin, MapPinned,
  MessageCircle, Navigation, Pause, Play, Plus, Route, SlidersHorizontal, Sparkles,
  Star, UserPlus, UserRound, WandSparkles,
} from '../../fontawesome-icons'
import { peso } from '../../lib/app'
import { useSiteSettings } from '../../contexts/siteSettingsState'

export default function ClientHomePage({ destinations, loading, user, onPlan, onSignUp, onProfile, onFeedback }) {
  const { settings } = useSiteSettings()
  const topDestinations = useMemo(() => [...destinations]
    .sort((first, second) => {
      const ratingDifference = Number(second.average_rating || 0) - Number(first.average_rating || 0)
      if (ratingDifference) return ratingDifference
      const reviewDifference = Number(second.review_count || 0) - Number(first.review_count || 0)
      if (reviewDifference) return reviewDifference
      return first.name.localeCompare(second.name)
    })
    .slice(0, 3), [destinations])
  const [activeSlide, setActiveSlide] = useState(0)
  const [carouselPaused, setCarouselPaused] = useState(false)
  const featured = topDestinations[activeSlide]
  const previewDestinations = topDestinations
  const categoryCount = new Set(destinations.map((destination) => destination.category)).size
  const freeDestinationCount = destinations.filter((destination) => Number(destination.entrance_fee || 0) === 0).length

  useEffect(() => {
    if (topDestinations.length < 2 || carouselPaused) return undefined
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % topDestinations.length)
    }, 6500)
    return () => window.clearInterval(timer)
  }, [carouselPaused, topDestinations.length])

  useEffect(() => {
    if (activeSlide >= topDestinations.length) setActiveSlide(0)
  }, [activeSlide, topDestinations.length])

  function moveCarousel(direction) {
    if (topDestinations.length < 2) return
    setCarouselPaused(true)
    setActiveSlide((current) => (current + direction + topDestinations.length) % topDestinations.length)
  }

  return <main className="client-home">
    <section className="home-hero">
      <div className="home-hero-copy">
        <span className="home-kicker"><Sparkles size={15} /> Explore {settings.municipality_name}</span>
        <h1>{settings.tagline}</h1>
        <p>Build a practical itinerary around verified destinations, your budget, preferred pace, and the experiences you care about most.</p>
        <div className="home-hero-actions"><button type="button" className="home-primary-action" onClick={() => onPlan()}><WandSparkles size={18} /> Build my itinerary <ArrowRight size={17} /></button>{user.role === 'tourist' ? <button type="button" className="home-secondary-action" onClick={onProfile}><UserRound size={17} /> My travel profile</button> : <button type="button" className="home-secondary-action" onClick={onSignUp}><UserPlus size={17} /> Create tourist account</button>}</div>
        <div className="home-hero-stats" aria-label="Travel Osmena overview"><div><strong>{destinations.length || 'â€”'}</strong><span>Verified places</span></div><div><strong>{categoryCount || 'â€”'}</strong><span>Travel categories</span></div><div><strong>{freeDestinationCount}</strong><span>Free entrances</span></div></div>
      </div>
      <div className="home-hero-visual" role="region" aria-roledescription="carousel" aria-label="Top three destinations">
        {featured?.image_url ? <img key={featured.id} className="home-carousel-image" src={featured.image_url} alt={featured.name} /> : <div className="home-hero-placeholder"><MapPinned size={48} /><span>Verified local destinations will appear here</span></div>}
        <div className="home-visual-shade" />
        {featured && <div className="home-featured-card" aria-live="polite" aria-atomic="true"><span>Top destination {activeSlide + 1} of {topDestinations.length} &middot; {featured.category}</span><h2>{featured.name}</h2><p><MapPin size={14} /> {featured.area}</p><div><strong>{peso.format(Number(featured.entrance_fee || 0))}</strong><button type="button" onClick={() => onPlan(featured.id)}>Plan this stop <ArrowRight size={14} /></button></div></div>}
        <div className="home-ai-badge"><Sparkles size={16} /><span><strong>Hybrid recommendations</strong><small>Personalized to your trip</small></span></div>
        {topDestinations.length > 1 && <div className="home-carousel-controls">
          <button type="button" onClick={() => moveCarousel(-1)} aria-label="Show previous top destination"><ChevronLeft size={17} /></button>
          <button type="button" onClick={() => setCarouselPaused((current) => !current)} aria-label={carouselPaused ? 'Play destination carousel' : 'Pause destination carousel'}>{carouselPaused ? <Play size={15} /> : <Pause size={15} />}</button>
          <button type="button" onClick={() => moveCarousel(1)} aria-label="Show next top destination"><ChevronRight size={17} /></button>
          <div className="home-carousel-dots" role="group" aria-label="Choose a top destination">{topDestinations.map((destination, index) => <button key={destination.id} type="button" className={activeSlide === index ? 'active' : ''} aria-current={activeSlide === index ? 'true' : undefined} aria-label={`Show ${destination.name}`} onClick={() => { setActiveSlide(index); setCarouselPaused(true) }} />)}</div>
        </div>}
      </div>
    </section>

    <section className="home-trust-strip" aria-label="Planning benefits">
      <div><BadgeCheck size={20} /><span><strong>Tourism-office verified</strong><small>Plan from maintained local records</small></span></div>
      <div><Route size={20} /><span><strong>Practical day routes</strong><small>Times, travel, and entrance fees together</small></span></div>
      <div><Star size={20} /><span><strong>Traveler-powered</strong><small>Community ratings and useful comments</small></span></div>
    </section>

    <section id="featured-destinations" className="home-section home-destinations">
      <header className="home-section-heading"><div><span className="home-kicker"><MapPinned size={15} /> Discover locally</span><h2>Places worth adding to your day</h2><p>Explore active, verified destinations before adding them to your personalized itinerary.</p></div><button type="button" className="home-text-action" onClick={() => onPlan()}><span>Open all in planner</span><ArrowRight size={16} /></button></header>
      <div className="home-destination-grid">
        {loading ? [1, 2, 3].map((item) => <div key={item} className="home-destination-skeleton" />) : previewDestinations.length ? previewDestinations.map((destination) => <article key={destination.id} className="home-destination-card">
          <div className="home-destination-image">{destination.image_url ? <img src={destination.image_url} alt={destination.name} /> : <span><MapPin size={28} /></span>}<em>{destination.category}</em></div>
          <div className="home-destination-content"><div className="home-destination-rating"><Star size={13} fill={destination.average_rating ? 'currentColor' : 'none'} /><span>{destination.average_rating ?? 'New'}</span><small>{destination.review_count ? `${destination.review_count} review${destination.review_count === 1 ? '' : 's'}` : 'No reviews yet'}</small></div><h3>{destination.name}</h3><p>{destination.description}</p><span className="home-destination-address"><MapPin size={13} /> {destination.area}</span><footer><span><small>Entrance fee</small><strong>{peso.format(Number(destination.entrance_fee || 0))}</strong></span><div><button type="button" onClick={() => onFeedback(destination)}><MessageCircle size={15} /> Reviews</button><button type="button" onClick={() => onPlan(destination.id)}>Add to planner <Plus size={15} /></button></div></footer></div>
        </article>) : <div className="home-empty-destinations"><MapPinned size={30} /><strong>Destinations are being prepared</strong><p>Verified places will appear here when the tourism team publishes them.</p></div>}
      </div>
    </section>

    <section className="home-section home-how-it-works">
      <header className="home-section-heading centered"><div><span className="home-kicker"><SlidersHorizontal size={15} /> Simple planning</span><h2>From preferences to a complete day</h2><p>Three quick steps turn your travel choices into a useful local route.</p></div></header>
      <div className="home-steps"><article><span>01</span><div><CalendarDays size={20} /><h3>Set your trip</h3><p>Choose your date, starting point, available hours, and group size.</p></div></article><article><span>02</span><div><Sparkles size={20} /><h3>Tell us what matters</h3><p>Add interests, budget, accessibility needs, pace, and transportation.</p></div></article><article><span>03</span><div><Route size={20} /><h3>Follow your route</h3><p>Receive a timed itinerary with verified stops, costs, and alternatives.</p></div></article></div>
    </section>

    <section className="home-cta"><div><span className="home-kicker"><Navigation size={15} /> Ready when you are</span><h2>Make your next day out feel effortless.</h2><p>Start with your preferences and let {settings.site_name} organize the details.</p></div><button type="button" className="home-primary-action" onClick={() => onPlan()}><WandSparkles size={18} /> Start planning <ArrowRight size={17} /></button></section>

    <footer className="client-home-footer"><a href="/" className="brand"><span className="brand-mark">{settings.logo_url ? <img className="h-full w-full object-contain" src={settings.logo_url} alt="" /> : <Navigation size={19} />}</span><span>{settings.site_name}</span></a><p>Verified local information from {settings.organization_name} for thoughtful travel in {settings.municipality_name}.</p>{(settings.support_email || settings.support_phone) && <p>{settings.support_email}{settings.support_email && settings.support_phone ? ' · ' : ''}{settings.support_phone}</p>}<span>Plan responsibly. Confirm advisories before traveling.</span></footer>
  </main>
}
