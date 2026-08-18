import {
  ArrowUp, BadgeCheck, CalendarDays, CarFront, ChevronDown, CircleAlert, Clock3,
  Download, LocateFixed, MapPin, MapPinned, MessageCircle, Navigation, Plus,
  Printer, RefreshCw, Route, Save, Sparkles, Star, Trash2, Users, Utensils,
  WandSparkles,
} from '../../fontawesome-icons'
import { GOOGLE_MAP_EMBED_URL, GOOGLE_MAP_URL, INTERESTS } from '../../config/travel'
import { formatEstimate, peso } from '../../lib/app'

export default function PlannerPage({
  form,
  destinations,
  itinerary,
  loading,
  generating,
  error,
  notice,
  focusedStop,
  plannerOpenSection,
  plannerCoordinates,
  fieldErrors,
  selectedDestinationIds,
  onToggleSection,
  onUpdateForm,
  onPlannerCoordinatesChange,
  onOpenMap,
  onToggleInterest,
  onToggleDestination,
  onRegenerate,
  onSave,
  onDownload,
  onFocusStop,
  onFeedback,
  onMoveEarlier,
  onRemoveStop,
  onAddAlternative,
  onDismissError,
  onDismissNotice,
}) {
  return (
    <main id="planner" className="planner-layout">
            <aside className="preference-panel" aria-label="Itinerary preferences">
              <div className="panel-heading">
                <span className="eyebrow"><Sparkles size={15} /> Personal planner</span>
                <h1>Build your day</h1>
                <p>Choose what matters. We will organize only active, tourism-office verified places.</p>
              </div>
              {Object.keys(fieldErrors).length > 0 && <div className="field-error-summary" role="alert">{Object.entries(fieldErrors).map(([field, messages]) => <p key={field}><strong>{field.replaceAll('_', ' ')}:</strong> {messages?.[0]}</p>)}</div>}
    
              <section className={plannerOpenSection === 'when' ? 'form-section planner-accordion open' : 'form-section planner-accordion'}>
                <button type="button" className="section-title planner-accordion-trigger" aria-expanded={plannerOpenSection === 'when'} onClick={() => onToggleSection('when')}><CalendarDays size={17} /><span><strong>When and where</strong><small>{form.starting_location || 'Set your date and starting point'}</small></span><ChevronDown size={17} /></button>
                {plannerOpenSection === 'when' && <div className="planner-accordion-panel">
                <div className="form-grid two-columns">
                  <label>Date<input type="date" value={form.travel_date} onChange={(event) => onUpdateForm('travel_date', event.target.value)} /></label>
                  <label>Days<select value={form.travel_days} onChange={(event) => onUpdateForm('travel_days', event.target.value)}><option value="1">1 day</option><option value="2">2 days</option><option value="3">3 days</option></select></label>
                </div>
                <label className="wide-label"><span>Starting point</span><span className="input-with-icon"><MapPin size={17} /><input value={form.starting_location} onChange={(event) => { onUpdateForm('starting_location', event.target.value); onPlannerCoordinatesChange({ latitude: '', longitude: '' }) }} placeholder="Enter starting location" /></span></label>
                <div className="planner-location-actions"><button type="button" onClick={() => onOpenMap()}><MapPinned size={16} /> Choose starting point on map</button>{plannerCoordinates.latitude && <span><BadgeCheck size={14} /> Map pin selected</span>}</div>
                <div className="form-grid two-columns">
                  <label>Start time<input type="time" value={form.start_time} onChange={(event) => onUpdateForm('start_time', event.target.value)} /></label>
                  <label>Return by<input type="time" value={form.end_time} onChange={(event) => onUpdateForm('end_time', event.target.value)} /></label>
                </div>
                </div>}
              </section>
    
              <section className={plannerOpenSection === 'interests' ? 'form-section planner-accordion open' : 'form-section planner-accordion'}>
                <button type="button" className="section-title planner-accordion-trigger" aria-expanded={plannerOpenSection === 'interests'} onClick={() => onToggleSection('interests')}><Sparkles size={17} /><span><strong>What do you enjoy?</strong><small>{form.interests.length ? `${form.interests.length} interests selected` : 'Choose at least one interest'}</small></span><ChevronDown size={17} /></button>
                {plannerOpenSection === 'interests' && <div className="planner-accordion-panel">
                <div className="interest-grid">
                  {INTERESTS.map(([value, label]) => (
                    <button key={value} type="button" className={form.interests.includes(value) ? 'interest-chip selected' : 'interest-chip'} onClick={() => onToggleInterest(value)}>{label}</button>
                  ))}
                </div>
                </div>}
              </section>
    
              <section id="places" className={plannerOpenSection === 'places' ? 'form-section planner-accordion open' : 'form-section planner-accordion'}>
                <button type="button" className="section-title planner-accordion-trigger" aria-expanded={plannerOpenSection === 'places'} onClick={() => onToggleSection('places')}><MapPin size={17} /><span><strong>Places to include</strong><small>{selectedDestinationIds.size ? `${selectedDestinationIds.size} preferred places` : 'Optional destination choices'}</small></span><ChevronDown size={17} /></button>
                {plannerOpenSection === 'places' && <div className="planner-accordion-panel">
                <div className="destination-picker">
                  {loading && <p className="subtle">Loading verified destinations...</p>}
                  {!loading && !destinations.length && <p className="subtle empty-data-message">No verified destinations are available. Sign in as an administrator to add tourism-office records.</p>}
                  {destinations.map((destination) => (
                    <label key={destination.id} className={selectedDestinationIds.has(destination.id) ? 'destination-option checked' : 'destination-option'}>
                      <input type="checkbox" checked={selectedDestinationIds.has(destination.id)} onChange={() => onToggleDestination(destination.id)} />
                      <span className="checkbox-visual" aria-hidden="true" />
                      <span className="destination-option-copy"><strong>{destination.name}</strong><small>{destination.category} · {destination.hours}</small><small className="destination-rating"><Star size={11} fill="currentColor" /> {destination.average_rating ?? 'New'}{destination.review_count ? ` (${destination.review_count})` : ' · No reviews yet'}</small><span className="destination-option-fee"><span>Entrance fee</span><b>{peso.format(Number(destination.entrance_fee || 0))}</b></span></span>
                    </label>
                  ))}
                </div>
                </div>}
              </section>
    
              <section className={plannerOpenSection === 'style' ? 'form-section compact-section planner-accordion open' : 'form-section compact-section planner-accordion'}>
                <button type="button" className="section-title planner-accordion-trigger" aria-expanded={plannerOpenSection === 'style'} onClick={() => onToggleSection('style')}><Users size={17} /><span><strong>Travel style</strong><small>{form.pace} pace · {form.transportation}</small></span><ChevronDown size={17} /></button>
                {plannerOpenSection === 'style' && <div className="planner-accordion-panel">
                <div className="form-grid two-columns">
                  <label>Traveling as<select value={form.companion} onChange={(event) => onUpdateForm('companion', event.target.value)}><option value="solo">Solo</option><option value="couple">Couple</option><option value="family">Family</option><option value="friends">Friends</option><option value="seniors">Senior travelers</option><option value="children">With children</option></select></label>
                  <label>Travelers<input min="1" max="30" type="number" value={form.travelers} onChange={(event) => onUpdateForm('travelers', event.target.value)} /></label>
                  <label>Transport<select value={form.transportation} onChange={(event) => onUpdateForm('transportation', event.target.value)}><option value="public">Public transit</option><option value="motorcycle">Motorcycle taxi</option><option value="private">Private vehicle</option><option value="walking">Walking</option></select></label>
                  <label>Language<select value={form.language} onChange={(event) => onUpdateForm('language', event.target.value)}><option>English</option><option>Filipino</option><option>Cebuano</option></select></label>
                </div>
                <label className="wide-label budget-label"><span>Estimated budget <strong>{form.budget ? peso.format(Number(form.budget)) : 'Not set'}</strong></span><input min="0" type="number" value={form.budget} onChange={(event) => onUpdateForm('budget', event.target.value)} placeholder="Optional amount in PHP" /></label>
                <div className="pace-control" role="group" aria-label="Preferred travel pace">
                  {['relaxed', 'balanced', 'fast'].map((pace) => <button key={pace} type="button" onClick={() => onUpdateForm('pace', pace)} className={form.pace === pace ? 'selected' : ''}>{pace === 'fast' ? 'Fast-paced' : pace[0].toUpperCase() + pace.slice(1)}</button>)}
                </div>
                <label className="wide-label"><span>Accessibility or special requirements</span><input value={form.accessibility} onChange={(event) => onUpdateForm('accessibility', event.target.value)} placeholder="e.g. wheelchair access, frequent rest stops" /></label>
                </div>}
              </section>
    
              <button className="generate-button" type="button" disabled={generating || loading} onClick={onRegenerate}>{generating ? <RefreshCw className="spin" size={19} /> : <WandSparkles size={19} />} {generating ? 'Organizing your route...' : 'Generate itinerary'}</button>
              <p className="privacy-note"><LocateFixed size={14} /> Location is used only to plan this route. Times and costs remain estimates.</p>
            </aside>
    
            <section id="itinerary" className="itinerary-area">
              <div className="itinerary-topline">
                <div>
                  <span className="eyebrow"><Route size={15} /> Your route</span>
                  <h2>{itinerary?.title || 'Your personalized itinerary'}</h2>
                  <p>{itinerary ? `${itinerary.summary.destinations} verified stops · ${itinerary.summary.travel_minutes} min estimated travel` : 'Generate a route to see an organized day plan.'}</p>
                  {itinerary?.summary?.recommendation_engine && <div className="recommendation-engine-badge"><Sparkles size={14} /><span>Hybrid personalized</span><small>{itinerary.summary.recommendation_engine.collaborative_enabled ? `Learned from ${itinerary.summary.recommendation_engine.history_samples} similar saved ${itinerary.summary.recommendation_engine.history_samples === 1 ? 'trip' : 'trips'}` : 'Content and trip-context recommendations'}</small></div>}
                </div>
                <div className="itinerary-actions">
                  <button type="button" className="outline-button" onClick={onRegenerate} disabled={generating}><RefreshCw size={16} /> Regenerate</button>
                  <button type="button" className="outline-button" onClick={onSave} disabled={!itinerary}><Save size={16} /> Save</button>
                  <div className="action-menu">
                    <button type="button" className="icon-button" title="Download itinerary" onClick={onDownload} disabled={!itinerary}><Download size={18} /></button>
                    <button type="button" className="icon-button" title="Print itinerary" onClick={() => window.print()} disabled={!itinerary}><Printer size={18} /></button>
                  </div>
                </div>
              </div>
    
              {error && <div className="alert error"><CircleAlert size={18} /><span>{error}</span><button type="button" title="Dismiss message" onClick={() => onDismissError()}>×</button></div>}
              {notice && <div className="alert success"><BadgeCheck size={18} /><span>{notice}</span><button type="button" title="Dismiss message" onClick={() => onDismissNotice()}>×</button></div>}
    
              {loading ? <div className="route-loading"><RefreshCw className="spin" size={24} /> Loading verified destination data</div> : itinerary ? <>
                {itinerary.adjustments?.length > 0 && <div className="adjustments">{itinerary.adjustments.map((adjustment) => <div key={adjustment}><CircleAlert size={16} /> {adjustment}</div>)}</div>}
                <div className="route-grid">
                  <div className="schedule-column">
                    <div className="day-heading"><div><span>{itinerary.day.label}</span><strong>{new Date(`${itinerary.day.date}T00:00:00`).toLocaleDateString('en-PH', { weekday: 'long', month: 'short', day: 'numeric' })}</strong></div><span className="day-status">Balanced plan</span></div>
                    <ol className="timeline">
                      {itinerary.stops.map((stop, index) => <li key={`${stop.title}-${index}`} className={`timeline-item ${stop.type} ${focusedStop === stop.id ? 'focused' : ''}`}>
                        <time>{stop.start}<small>{stop.end}</small></time>
                        <span className="timeline-node" />
                        <article className="stop-card" onClick={() => stop.id && onFocusStop(stop.id)}>
                          <div className="stop-meta"><span className={`stop-type ${stop.type}`}>{stop.type === 'destination' ? 'Place' : stop.type === 'meal' ? 'Break' : 'Route'}</span><span><Clock3 size={13} /> {stop.duration_minutes} min</span></div>
                          <div className="stop-title-row"><div><h3>{stop.title}</h3><p>{stop.description}</p></div>{stop.image_url && <img src={stop.image_url} alt="" />}</div>
                          {stop.type === 'destination' && <>
                            <p className="stop-address"><MapPin size={14} /> {stop.address}</p>
                            {stop.recommendation && <div className="recommendation-explanation"><span><Sparkles size={13} /> {stop.recommendation.match_percent}% match</span><div>{stop.recommendation.reasons.map((reason) => <small key={reason}>{reason}</small>)}</div></div>}
                            <div className="activity-tags">{stop.activities?.slice(0, 3).map((activity) => <span key={activity}>{activity}</span>)}</div>
                            <div className="stop-footer"><span className="stop-entrance-fee"><small>Entrance fee</small><strong>{formatEstimate(stop.estimated_cost)}</strong></span><div><button type="button" className="review-trigger" title={`Read or add reviews for ${stop.title}`} onClick={(event) => { event.stopPropagation(); onFeedback({ id: stop.id, name: stop.title }) }}><MessageCircle size={15} /><span>{stop.review_count ? `${stop.average_rating} · ${stop.review_count}` : 'Review'}</span></button><button type="button" title="Move this place earlier" onClick={(event) => { event.stopPropagation(); onMoveEarlier(stop.id) }}><ArrowUp size={15} /></button><button type="button" title="Remove this place" onClick={(event) => { event.stopPropagation(); onRemoveStop(stop.id) }}><Trash2 size={15} /></button></div></div>
                          </>}
                          {stop.type === 'travel' || stop.type === 'return' ? <p className="travel-detail"><CarFront size={15} /> {stop.transportation === 'public' ? 'Public transit suggested' : `${stop.transportation} suggested`}</p> : null}
                          {stop.type === 'meal' ? <p className="travel-detail"><Utensils size={15} /> Meal price is currently unavailable</p> : null}
                        </article>
                      </li>)}
                    </ol>
                  </div>
    
                  <aside className="map-and-budget">
                    <div className="map-card">
                      <div className="map-header"><div><span className="eyebrow"><MapPin size={14} /> Live municipality map</span><strong>Sergio Osmeña Sr., Zamboanga del Norte</strong></div><a className="icon-button" title="Open in Google Maps" href={GOOGLE_MAP_URL} target="_blank" rel="noreferrer"><Navigation size={17} /></a></div>
                      <div className="google-map-surface"><iframe title="Google Map of Sergio Osmeña Sr., Zamboanga del Norte" src={GOOGLE_MAP_EMBED_URL} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>
                      <p className="map-caption"><MapPin size={14} /> Centered on the official municipality location supplied for Sergio Osmeña Sr.</p>
                    </div>
                    <div className="budget-panel">
                      <div className="budget-heading"><div><span className="eyebrow"><Sparkles size={14} /> Cost estimate</span><strong>{peso.format(itinerary.budget.total)}</strong></div><span>For {form.travelers} travelers</span></div>
                      <div className="cost-line"><span>Entrance fees</span><strong>{formatEstimate(itinerary.budget.entrance_fees)}</strong></div>
                      <div className="cost-line"><span>Transport</span><strong>{formatEstimate(itinerary.budget.transportation)}</strong></div>
                      <div className="cost-line"><span>Food and drinks</span><strong>{formatEstimate(itinerary.budget.food_and_drinks)}</strong></div>
                      <div className="cost-line"><span>Emergency allowance</span><strong>{formatEstimate(itinerary.budget.emergency_allowance)}</strong></div>
                      <p>{itinerary.budget.notice}</p>
                    </div>
                  </aside>
                </div>
    
                <section className="alternatives-section">
                  <div className="section-heading-row"><div><span className="eyebrow"><Sparkles size={15} /> Plan B</span><h3>Verified alternatives nearby</h3></div><span>Choose one to refresh your day</span></div>
                  <div className="alternatives-grid">
                    {itinerary.alternatives.map((destination) => <article key={destination.id} className="alternative-card"><img src={destination.image_url} alt="" /><div><span>{destination.category}</span><h4>{destination.name}</h4><p>{destination.visit_minutes} min{destination.recommendation ? ` · ${destination.recommendation.match_percent}% match` : ''}</p><p className="alternative-rating"><Star size={12} fill="currentColor" /> {destination.average_rating ?? 'New'}{destination.review_count ? ` from ${destination.review_count} traveler${destination.review_count === 1 ? '' : 's'}` : ' · Be the first to review'}</p><div className="alternative-entrance-fee"><small>Entrance fee</small><strong>{peso.format(Number(destination.entrance_fee || 0))}</strong></div><div className="alternative-actions"><button type="button" onClick={() => onAddAlternative(destination.id)}><Plus size={15} /> Add to route</button><button type="button" onClick={() => onFeedback(destination)}><MessageCircle size={15} /> Reviews</button></div></div></article>)}
                  </div>
                </section>
    
                <section className="travel-note"><CircleAlert size={18} /><div><strong>Before you go</strong><p>Travel times, weather, schedules, and prices can change. Confirm official advisories and destination details before leaving.</p></div></section>
              </> : <div className="empty-route"><WandSparkles size={34} /><h3>Your route will appear here</h3><p>Set your travel preferences, then generate a practical itinerary.</p></div>}
            </section>
          </main>
  )
}
