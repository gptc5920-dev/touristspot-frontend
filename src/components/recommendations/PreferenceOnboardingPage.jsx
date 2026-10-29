import { useEffect, useState } from 'react'
import {
  Accessibility, BadgeCheck, Camera, Check, Church, CircleAlert, Compass, Heart,
  Landmark, Languages, Leaf, LocateFixed, MapPin, MapPinned, Mountain, RefreshCw,
  Route, ShieldCheck, ShoppingBag, Sparkles, Sun, Utensils, WalletCards, Waves,
} from '../../fontawesome-icons'
import { DESTINATION_CATEGORIES, INTERESTS } from '../../config/travel'
import { PACE_OPTIONS, TRANSPORTATION_OPTIONS, TRAVELER_OPTIONS } from '../../config/preferences'
import LocationMapModal from '../common/LocationMapModal'

const inputClass = 'preference-input'
const interestIcons = { Leaf, Landmark, Utensils, Mountain, Church, Waves, Heart, Camera, ShoppingBag, Sun }

function FieldError({ children }) {
  return children ? <span className="preference-field-error"><CircleAlert size={14} aria-hidden="true" /> {children}</span> : null
}

export default function PreferenceOnboardingPage({
  user, checking, preferences, loading, saving, generating, errors, error,
  onChange, onToggle, onSubmit, onSignIn,
}) {
  const [locationEnabled, setLocationEnabled] = useState(Boolean(preferences.starting_location || preferences.latitude))
  const [mapOpen, setMapOpen] = useState(false)
  const [locating, setLocating] = useState(false)
  const isUpdating = Boolean(preferences.onboarding_completed)

  useEffect(() => {
    if (preferences.starting_location || preferences.latitude) setLocationEnabled(true)
  }, [preferences.latitude, preferences.starting_location])

  function toggleLocation() {
    setLocationEnabled((current) => {
      if (current) {
        onChange('starting_location', '')
        onChange('latitude', '')
        onChange('longitude', '')
      }
      return !current
    })
  }

  function useCurrentLocation() {
    if (!locationEnabled || !navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const latitude = coords.latitude.toFixed(6)
        const longitude = coords.longitude.toFixed(6)
        onChange('latitude', latitude)
        onChange('longitude', longitude)
        onChange('starting_location', `Current location (${latitude}, ${longitude})`)
        setLocating(false)
      },
      () => {
        setLocating(false)
        setMapOpen(true)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    )
  }

  if (checking || loading) return <main className="grid min-h-[calc(100vh-64px)] place-items-center bg-slate-50 px-5"><div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-5 text-sm font-bold text-slate-600 shadow-sm"><RefreshCw className="spin text-teal-600" size={20} /> Loading your travel preferences</div></main>
  if (!user.is_authenticated) return <main className="grid min-h-[calc(100vh-64px)] place-items-center bg-slate-50 px-5"><section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-teal-50 text-teal-700"><ShieldCheck size={27} /></span><h1 className="mt-5 text-3xl font-bold text-slate-900">Sign in to personalize your trip</h1><p className="mt-3 text-base leading-7 text-slate-600">Your recommendations and travel preferences are private to your tourist account.</p><button type="button" className="mt-6 min-h-12 rounded-xl bg-teal-700 px-6 text-sm font-bold text-white hover:bg-teal-800" onClick={onSignIn}>Sign in as tourist</button></section></main>

  return <main className="preferences-page min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
    <div className="preferences-content mx-auto w-full max-w-7xl">
      <header className="preferences-heading">
        <div><span className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.12em] text-teal-800"><Sparkles size={14} /> AI preference setup</span><h1 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">{isUpdating ? 'Update your travel preferences' : 'Let’s find places that fit you'}</h1><p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">Tell us how you like to travel. We use only these trip preferences to rank active, tourism-office-verified destinations—never invented places or details.</p></div>
        <div className="preferences-progress grid grid-cols-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" aria-label="Recommendation progress"><span className="border-r border-slate-200 bg-teal-50 px-3 py-3 text-center text-xs font-extrabold text-teal-800" aria-current="step">1. Preferences</span><span className="border-r border-slate-200 px-3 py-3 text-center text-xs font-bold text-slate-500">2. AI ranking</span><span className="px-3 py-3 text-center text-xs font-bold text-slate-500">3. Your spots</span></div>
      </header>

      {error && <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800" role="alert"><CircleAlert className="mt-0.5 shrink-0" size={18} /><span>{error}</span></div>}

      <form className="mt-8 grid gap-6" onSubmit={onSubmit} noValidate>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:p-8">
          <div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Compass size={22} /></span><div><h2 className="text-xl font-extrabold text-slate-900">What do you want to experience?</h2><p className="mt-1 text-sm leading-6 text-slate-500">Select as many as you like. Required fields are marked with an asterisk.</p></div></div>
          <fieldset className="mt-7"><legend className="text-sm font-extrabold text-slate-800">Preferred tourism categories <span className="text-red-500">*</span></legend><div className="mt-3 flex flex-wrap gap-2.5">{DESTINATION_CATEGORIES.map((category) => { const selected = preferences.preferred_categories.includes(category); return <button key={category} type="button" aria-pressed={selected} onClick={() => onToggle('preferred_categories', category)} className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-bold transition ${selected ? 'border-teal-700 bg-teal-700 text-white shadow-md shadow-teal-100' : 'border-slate-300 bg-white text-slate-700 hover:border-teal-400 hover:bg-teal-50'}`}>{selected && <Check size={15} />}{category}</button> })}</div><FieldError>{errors.preferred_categories}</FieldError></fieldset>
          <fieldset className="mt-8 border-t border-slate-100 pt-7"><legend className="text-sm font-extrabold text-slate-800">Travel interests <span className="text-red-500">*</span></legend><p className="mt-1 text-sm text-slate-500">These interests have the strongest influence on your match score.</p><div className="preferences-interest-grid">{INTERESTS.map(([value, label, iconName]) => {
            const selected = preferences.selected_interests.includes(value)
            const InterestIcon = interestIcons[iconName] || Compass
            return <button key={value} type="button" aria-pressed={selected} onClick={() => onToggle('selected_interests', value)} className="preference-interest">
              <span className="preference-interest-label"><InterestIcon size={18} aria-hidden="true" /><span>{label}</span></span>
              <span className="preference-interest-check" aria-hidden="true">{selected && <Check size={12} />}</span>
            </button>
          })}</div><FieldError>{errors.selected_interests}</FieldError></fieldset>
        </section>

        <div className="preferences-detail-grid">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700"><WalletCards size={21} /></span><div><h2 className="text-xl font-extrabold text-slate-900">Budget and available time</h2><p className="mt-1 text-sm leading-6 text-slate-500">Used to avoid impractical fees and visits that do not fit your day.</p></div></div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2"><label className="text-sm font-bold text-slate-700">Minimum budget (PHP) <span className="text-red-500">*</span><input className={inputClass} type="number" min="0" step="50" value={preferences.budget_min} required aria-invalid={Boolean(errors.budget_min)} onChange={(event) => onChange('budget_min', event.target.value)} /><FieldError>{errors.budget_min}</FieldError></label><label className="text-sm font-bold text-slate-700">Maximum budget (PHP) <span className="text-red-500">*</span><input className={inputClass} type="number" min="0" step="50" value={preferences.budget_max} required aria-invalid={Boolean(errors.budget_max)} onChange={(event) => onChange('budget_max', event.target.value)} /><FieldError>{errors.budget_max}</FieldError></label><label className="text-sm font-bold text-slate-700">Available from <span className="text-red-500">*</span><input className={inputClass} type="time" value={preferences.available_start_time} onChange={(event) => onChange('available_start_time', event.target.value)} required aria-invalid={Boolean(errors.available_start_time)} /><FieldError>{errors.available_start_time}</FieldError></label><label className="text-sm font-bold text-slate-700">Available until <span className="text-red-500">*</span><input className={inputClass} type="time" value={preferences.available_end_time} onChange={(event) => onChange('available_end_time', event.target.value)} required aria-invalid={Boolean(errors.available_end_time)} /><FieldError>{errors.available_end_time}</FieldError></label></div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700"><Route size={21} /></span><div><h2 className="text-xl font-extrabold text-slate-900">Your travel style</h2><p className="mt-1 text-sm leading-6 text-slate-500">We compare these choices with visit duration, transport, and traveler suitability.</p></div></div>
            <fieldset className="mt-6"><legend className="text-sm font-bold text-slate-700">Preferred pace <span className="text-red-500">*</span></legend><div className="mt-3 grid gap-3 sm:grid-cols-3">{PACE_OPTIONS.map(([value, label, detail]) => <button key={value} type="button" aria-pressed={preferences.travel_pace === value} onClick={() => onChange('travel_pace', value)} className={`rounded-xl border p-4 text-left transition ${preferences.travel_pace === value ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-100' : 'border-slate-200 hover:border-teal-300'}`}><strong className="block text-sm text-slate-900">{label}</strong><small className="mt-1 block leading-5 text-slate-500">{detail}</small></button>)}</div><FieldError>{errors.travel_pace}</FieldError></fieldset>
            <div className="mt-5 grid gap-5 sm:grid-cols-2"><label className="text-sm font-bold text-slate-700">Transportation <span className="text-red-500">*</span><select className={inputClass} value={preferences.transportation_preference} required aria-invalid={Boolean(errors.transportation_preference)} onChange={(event) => onChange('transportation_preference', event.target.value)}>{TRANSPORTATION_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><FieldError>{errors.transportation_preference}</FieldError></label><label className="text-sm font-bold text-slate-700">Travel companion <span className="text-red-500">*</span><select className={inputClass} value={preferences.traveler_type} required aria-invalid={Boolean(errors.traveler_type)} onChange={(event) => onChange('traveler_type', event.target.value)}>{TRAVELER_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><FieldError>{errors.traveler_type}</FieldError></label></div>
          </section>
        </div>

        <section className="preferences-comfort-grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="preferences-comfort-panel p-5 sm:p-7">
            <div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-purple-50 text-purple-700"><Accessibility size={21} aria-hidden="true" /></span><div><h2 className="text-xl font-extrabold text-slate-900">Comfort and accessibility</h2><p className="mt-1 text-sm leading-6 text-slate-500">Optional requirements help prioritize destinations with matching facilities.</p></div></div>
            <label className="mt-6 block text-sm font-bold text-slate-700">Accessibility requirements<textarea className="preference-input preference-textarea" maxLength="255" value={preferences.accessibility_requirements} onChange={(event) => onChange('accessibility_requirements', event.target.value)} placeholder="e.g. wheelchair access, senior-friendly paths, frequent rest areas" /><span className="preferences-field-hint"><span>Leave blank if you have no specific requirements.</span><span>{preferences.accessibility_requirements.length}/255</span></span><FieldError>{errors.accessibility_requirements}</FieldError></label>
            <label className="mt-5 block text-sm font-bold text-slate-700"><span className="inline-flex items-center gap-2"><Languages size={16} /> Preferred language <span className="text-red-500">*</span></span><select className={inputClass} value={preferences.preferred_language} required aria-invalid={Boolean(errors.preferred_language)} onChange={(event) => onChange('preferred_language', event.target.value)}><option>English</option><option>Filipino</option><option>Cebuano</option></select><FieldError>{errors.preferred_language}</FieldError></label>
          </div>

          <div className="bg-slate-50/60 p-5 sm:p-7">
            <div className="flex items-start justify-between gap-5"><div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-700"><MapPinned size={21} /></span><div><h2 className="text-xl font-extrabold text-slate-900">Location-based matching</h2><p className="mt-1 text-sm leading-6 text-slate-500">Optional. Enable this to consider distance and estimated travel time.</p></div></div><button type="button" role="switch" aria-checked={locationEnabled} aria-label="Enable location-based recommendations" onClick={toggleLocation} className={`relative mt-1 h-7 w-12 shrink-0 rounded-full transition ${locationEnabled ? 'bg-teal-600' : 'bg-slate-300'}`}><span className={`absolute top-1 size-5 rounded-full bg-white shadow transition ${locationEnabled ? 'left-6' : 'left-1'}`} /></button></div>
            {locationEnabled ? <div className="mt-6"><label className="block text-sm font-bold text-slate-700">Current or preferred starting point<input className={inputClass} maxLength="255" value={preferences.starting_location} onChange={(event) => onChange('starting_location', event.target.value)} placeholder="e.g. Poblacion, Sergio Osmeña Sr." /></label><div className="mt-3 grid gap-3 sm:grid-cols-2"><button type="button" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 hover:border-teal-400 hover:bg-teal-50" onClick={useCurrentLocation} disabled={locating}>{locating ? <RefreshCw className="spin" size={16} /> : <LocateFixed size={16} />} Use current location</button><button type="button" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 hover:border-teal-400 hover:bg-teal-50" onClick={() => setMapOpen(true)}><MapPin size={16} /> Choose on map</button></div>{preferences.latitude !== '' && <p className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800"><BadgeCheck size={14} /> Location pin saved: {preferences.latitude}, {preferences.longitude}</p>}<FieldError>{errors.starting_location || errors.coordinates || errors.latitude || errors.longitude}</FieldError></div> : <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-5 text-sm leading-6 text-slate-500"><ShieldCheck className="mb-3 text-slate-400" size={21} />Location permission will not be requested. Recommendations will still use your interests, budget, available time, and travel style.</div>}
          </div>
        </section>

        <footer className="preferences-actions"><p><ShieldCheck size={17} aria-hidden="true" /> Preferences stay under your account and can be updated at any time.</p><button type="submit" disabled={saving || generating}>{saving || generating ? <RefreshCw className="spin" size={18} /> : <Sparkles size={18} aria-hidden="true" />}{saving ? 'Saving preferences…' : generating ? 'Generating recommendations…' : 'Continue and view recommendations'}</button></footer>
      </form>
    </div>

    {mapOpen && <LocationMapModal
      draft={{ address: preferences.starting_location, latitude: preferences.latitude, longitude: preferences.longitude }}
      eyebrow="Location-based recommendations"
      title="Choose your starting point"
      description="Set the place used to estimate distance and travel time. You can adjust this later."
      applyLabel="Use this starting point"
      onClose={() => setMapOpen(false)}
      onApply={({ address, latitude, longitude }) => {
        onChange('starting_location', address || `${latitude}, ${longitude}`)
        onChange('latitude', latitude)
        onChange('longitude', longitude)
        setMapOpen(false)
      }}
    />}
  </main>
}
