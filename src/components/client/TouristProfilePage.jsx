import { useEffect, useState } from 'react'
import {
  BadgeCheck, CalendarDays, Check, CircleAlert, LogIn, RefreshCw, Save,
  ShieldCheck, SlidersHorizontal, Sparkles, UserPlus, UserRound,
} from '../../fontawesome-icons'
import { readApiJson } from '../../api'
import { INTERESTS } from '../../config/travel'
import { apiErrorMessage, authUserFromPayload, requestErrorMessage } from '../../lib/app'

export default function TouristProfilePage({ apiFetch, user, checking, onSignIn, onSignUp, onBack, onUserChange, onUsePreferences }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!user.is_authenticated || user.role !== 'tourist') {
      setLoading(false)
      return () => { cancelled = true }
    }
    async function loadProfile() {
      setLoading(true)
      setError('')
      try {
        const response = await apiFetch('/tourist/profile/')
        const body = await readApiJson(response)
        if (!response.ok) throw new Error(apiErrorMessage(body, 'Could not load your travel profile.'))
        if (!cancelled) setProfile(body.profile)
      } catch (requestError) {
        if (!cancelled) setError(requestErrorMessage(requestError, 'Could not load your travel profile.'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadProfile()
    return () => { cancelled = true }
  }, [apiFetch, user.is_authenticated, user.role])

  function updateProfile(field, value) {
    setSaved(false)
    setError('')
    setProfile((current) => ({ ...current, [field]: value }))
  }

  function toggleProfileInterest(value) {
    const current = profile.interests || []
    updateProfile('interests', current.includes(value) ? current.filter((item) => item !== value) : [...current, value])
  }

  async function saveProfile(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    const payload = {
      full_name: profile.full_name,
      email: profile.email,
      home_location: profile.home_location,
      bio: profile.bio,
      interests: profile.interests,
      preferred_pace: profile.preferred_pace,
      preferred_transportation: profile.preferred_transportation,
      preferred_language: profile.preferred_language,
      accessibility_needs: profile.accessibility_needs,
      typical_budget: profile.typical_budget,
    }
    try {
      const response = await apiFetch('/tourist/profile/', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
      const body = await readApiJson(response)
      if (!response.ok) throw new Error(apiErrorMessage(body, 'Could not save your travel profile.'))
      setProfile(body.profile)
      onUserChange(authUserFromPayload(body.user))
      setSaved(true)
    } catch (requestError) {
      setError(requestErrorMessage(requestError, 'Could not save your travel profile.'))
    } finally {
      setSaving(false)
    }
  }

  if (checking || loading) return <main className="profile-page"><div className="profile-loading"><RefreshCw className="spin" size={22} /> Loading your travel profile</div></main>
  if (!user.is_authenticated) return <main className="profile-page"><section className="profile-access-card"><span><UserRound size={26} /></span><h1>Your traveler profile</h1><p>Sign in to save preferences, keep itineraries, and share trusted destination feedback.</p><div><button type="button" className="outline-button" onClick={onSignIn}><LogIn size={16} /> Sign in</button><button type="button" className="generate-button" onClick={onSignUp}><UserPlus size={16} /> Create tourist account</button></div><button type="button" className="profile-back-link" onClick={onBack}>Back to planner</button></section></main>
  if (user.role !== 'tourist') return <main className="profile-page"><section className="profile-access-card"><ShieldCheck size={30} /><h1>Administrator account</h1><p>Tourist preferences and reviews are available from a traveler account.</p><button type="button" className="outline-button" onClick={onBack}>Back to planner</button></section></main>
  if (!profile) return <main className="profile-page"><section className="profile-access-card"><CircleAlert size={30} /><h1>Profile unavailable</h1><p>{error || 'Your profile could not be loaded.'}</p><button type="button" className="outline-button" onClick={onBack}>Back to planner</button></section></main>

  const initial = (profile.full_name || profile.username || 'T').charAt(0).toUpperCase()
  return <main className="profile-page">
    <header className="profile-heading"><div><span className="eyebrow"><UserRound size={15} /> Tourist account</span><h1>Profile & preferences</h1><p>Keep your traveler details in one place and reuse them in the personal planner.</p></div><button type="button" className="outline-button" onClick={() => onUsePreferences(profile)}><SlidersHorizontal size={16} /> Use in planner</button></header>
    <div className="profile-layout">
      <aside className="profile-summary-card"><span className="profile-avatar">{initial}</span><h2>{profile.full_name}</h2><p>@{profile.username}</p><span>{profile.email}</span><div className="profile-stats"><div><strong>{profile.saved_itinerary_count}</strong><small>Saved trips</small></div><div><strong>{profile.review_count}</strong><small>Reviews</small></div></div><p className="profile-privacy"><ShieldCheck size={15} /> Your preferences are private. Comments and ratings appear publicly with your display name.</p>{profile.recent_itineraries?.length > 0 && <div className="profile-recent"><strong>Recent itineraries</strong>{profile.recent_itineraries.map((item) => <span key={item.id}><CalendarDays size={14} /><span>{item.name}<small>{new Date(`${item.travel_date}T00:00:00`).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</small></span></span>)}</div>}</aside>
      <form className="profile-form-card" onSubmit={saveProfile}>
        <section><div className="profile-section-title"><UserRound size={18} /><div><strong>Personal details</strong><small>How your account appears across Travel Osmena.</small></div></div><div className="profile-form-grid"><label>Full name<input value={profile.full_name} onChange={(event) => updateProfile('full_name', event.target.value)} maxLength="120" required /></label><label>Email address<input type="email" value={profile.email} onChange={(event) => updateProfile('email', event.target.value)} required /></label><label className="wide-label">Home or starting location<input value={profile.home_location} onChange={(event) => updateProfile('home_location', event.target.value)} maxLength="180" placeholder="e.g. Poblacion, Sergio Osmeña Sr." /></label><label className="wide-label">About your travel style<textarea value={profile.bio} onChange={(event) => updateProfile('bio', event.target.value)} maxLength="500" placeholder="Tell us what makes a good trip for you." /><small className="field-count">{profile.bio.length}/500</small></label></div></section>
        <section><div className="profile-section-title"><Sparkles size={18} /><div><strong>Travel interests</strong><small>Used by the hybrid recommendation engine to rank destinations.</small></div></div><div className="profile-interest-grid">{INTERESTS.map(([value, label]) => <button key={value} type="button" className={profile.interests.includes(value) ? 'selected' : ''} onClick={() => toggleProfileInterest(value)}>{profile.interests.includes(value) && <Check size={13} />}{label}</button>)}</div></section>
        <section><div className="profile-section-title"><SlidersHorizontal size={18} /><div><strong>Planner defaults</strong><small>You can still change these for each itinerary.</small></div></div><div className="profile-form-grid"><label>Preferred pace<select value={profile.preferred_pace} onChange={(event) => updateProfile('preferred_pace', event.target.value)}><option value="relaxed">Relaxed</option><option value="balanced">Balanced</option><option value="fast">Fast-paced</option></select></label><label>Transportation<select value={profile.preferred_transportation} onChange={(event) => updateProfile('preferred_transportation', event.target.value)}><option value="public">Public transit</option><option value="motorcycle">Motorcycle taxi</option><option value="private">Private vehicle</option><option value="walking">Walking</option></select></label><label>Language<select value={profile.preferred_language} onChange={(event) => updateProfile('preferred_language', event.target.value)}><option>English</option><option>Filipino</option><option>Cebuano</option></select></label><label>Typical budget (PHP)<input type="number" min="0" step="100" value={profile.typical_budget} onChange={(event) => updateProfile('typical_budget', event.target.value)} placeholder="Optional" /></label><label className="wide-label">Accessibility or special requirements<input value={profile.accessibility_needs} onChange={(event) => updateProfile('accessibility_needs', event.target.value)} maxLength="255" placeholder="e.g. wheelchair access or frequent rest stops" /></label></div></section>
        {error && <div className="login-error" role="alert"><CircleAlert size={16} /><span>{error}</span></div>}{saved && <div className="profile-saved" role="status"><BadgeCheck size={16} /> Profile and preferences saved.</div>}
        <footer className="profile-form-actions"><button type="button" className="outline-button" onClick={() => onUsePreferences(profile)}><SlidersHorizontal size={16} /> Apply to planner</button><button type="submit" className="generate-button" disabled={saving}>{saving ? <RefreshCw className="spin" size={17} /> : <Save size={17} />}{saving ? ' Saving...' : ' Save profile'}</button></footer>
      </form>
    </div>
  </main>
}
