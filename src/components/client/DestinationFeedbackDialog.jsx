import { useEffect, useState } from 'react'
import {
  BadgeCheck, CircleAlert, LogIn, MessageCircle, RefreshCw, Send, Star, UserRound, X,
} from '../../fontawesome-icons'
import { readApiJson } from '../../api'
import { apiErrorMessage, requestErrorMessage } from '../../lib/app'

export default function DestinationFeedbackDialog({ destination, user, apiFetch, onClose, onRequireAuth }) {
  const [feedback, setFeedback] = useState(null)
  const [form, setForm] = useState({ rating: 5, comment: '', suggestion: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function loadFeedback() {
      setLoading(true)
      try {
        const response = await apiFetch(`/destinations/${destination.id}/feedback/`)
        const body = await readApiJson(response)
        if (!response.ok) throw new Error(apiErrorMessage(body, 'Could not load destination feedback.'))
        if (cancelled) return
        setFeedback(body)
        if (body.own_review) setForm({ rating: body.own_review.rating, comment: body.own_review.comment, suggestion: body.own_review.suggestion })
      } catch (requestError) {
        if (!cancelled) setError(requestErrorMessage(requestError, 'Could not load destination feedback.'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadFeedback()
    return () => { cancelled = true }
  }, [apiFetch, destination.id])

  async function submitFeedback(event) {
    event.preventDefault()
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      const response = await apiFetch(`/destinations/${destination.id}/feedback/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
      const body = await readApiJson(response)
      if (!response.ok) throw new Error(apiErrorMessage(body, 'Could not save your feedback.'))
      setFeedback(body)
      setSaved(true)
    } catch (requestError) {
      setError(requestErrorMessage(requestError, 'Could not save your feedback.'))
    } finally {
      setSaving(false)
    }
  }

  return <div className="modal-backdrop destination-feedback-backdrop" role="presentation"><section className="destination-feedback-dialog" role="dialog" aria-modal="true" aria-labelledby="destination-feedback-title"><header><div><span className="feedback-destination-icon"><MessageCircle size={21} /></span><div><span className="eyebrow">Traveler community</span><h2 id="destination-feedback-title">{destination.name}</h2></div></div><button className="dialog-close" type="button" title="Close destination feedback" onClick={onClose}><X size={18} /></button></header>{loading ? <div className="feedback-loading"><RefreshCw className="spin" size={20} /> Loading traveler feedback</div> : <div className="destination-feedback-layout"><aside className="review-list-panel"><div className="rating-summary"><strong>{feedback?.average_rating ?? 'New'}</strong><span><span className="summary-stars">{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={16} fill={feedback?.average_rating >= star ? 'currentColor' : 'none'} />)}</span><small>{feedback?.review_count ? `${feedback.review_count} traveler rating${feedback.review_count === 1 ? '' : 's'}` : 'No ratings yet'}</small></span></div><h3>Traveler comments</h3>{feedback?.reviews?.length ? <div className="review-list">{feedback.reviews.map((review) => <article key={review.id}><div><span className="review-avatar">{review.author.charAt(0).toUpperCase()}</span><span><strong>{review.author}</strong><small>{new Date(review.updated_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</small></span><span className="review-stars"><Star size={13} fill="currentColor" /> {review.rating}</span></div><p>{review.comment}</p></article>)}</div> : <div className="empty-reviews"><MessageCircle size={24} /><strong>Start the conversation</strong><p>Be the first traveler to share a helpful comment about this destination.</p></div>}</aside><section className="feedback-form-panel"><div><span className="eyebrow"><Send size={14} /> Your feedback</span><h3>{feedback?.own_review ? 'Update your review' : 'Help future travelers'}</h3><p>Rate your visit, leave a public comment, and send a private suggestion to improve destination information.</p></div>{user.role === 'tourist' ? <form onSubmit={submitFeedback}><fieldset><legend>Your rating</legend><div className="star-rating" role="radiogroup" aria-label="Destination rating">{[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" role="radio" aria-checked={form.rating === star} aria-label={`${star} star${star === 1 ? '' : 's'}`} className={form.rating >= star ? 'selected' : ''} onClick={() => { setForm((current) => ({ ...current, rating: star })); setSaved(false) }}><Star size={23} fill="currentColor" /></button>)}</div><small>{form.rating} out of 5 stars</small></fieldset><label>Public comment<textarea value={form.comment} onChange={(event) => { setForm((current) => ({ ...current, comment: event.target.value })); setSaved(false) }} maxLength="1200" placeholder="What should other travelers know?" /><small>{form.comment.length}/1200 Â· Shown with your display name</small></label><label>Suggestion for the tourism team<textarea value={form.suggestion} onChange={(event) => { setForm((current) => ({ ...current, suggestion: event.target.value })); setSaved(false) }} maxLength="1200" placeholder="Suggest an update, amenity, or improvement." /><small>{form.suggestion.length}/1200 Â· Kept private from public comments</small></label>{error && <div className="login-error" role="alert"><CircleAlert size={16} /><span>{error}</span></div>}{saved && <div className="profile-saved"><BadgeCheck size={16} /> Feedback saved. Thank you for helping travelers.</div>}<button type="submit" className="generate-button" disabled={saving}>{saving ? <RefreshCw className="spin" size={17} /> : <Send size={17} />}{saving ? ' Saving...' : feedback?.own_review ? ' Update feedback' : ' Submit feedback'}</button></form> : <div className="feedback-signin-card"><UserRound size={25} /><strong>Share your experience</strong><p>Sign in or create a tourist account to rate, comment, and send suggestions.</p><button type="button" className="generate-button" onClick={onRequireAuth}><LogIn size={16} /> Sign in to contribute</button></div>}</section></div>}{error && !feedback && <div className="feedback-dialog-error"><CircleAlert size={18} /> {error}</div>}</section></div>
}
