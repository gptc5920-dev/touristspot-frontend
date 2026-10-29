import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight, CalendarRange, Check, CircleAlert, ImagePlus, Info,
  Link2, MapPin, MapPinned, RefreshCw, Save, ShieldCheck, Sparkles, Trash2, Upload,
} from '../../fontawesome-icons'
import {
  ACCESSIBILITY_SUGGESTIONS, CATEGORY_ACTIVITY_SUGGESTIONS, COMPANION_SUGGESTIONS,
  DESTINATION_CATEGORIES, INTERESTS, OPERATING_DAYS, SAFETY_SUGGESTIONS,
  TRANSPORT_SUGGESTIONS,
} from '../../config/travel'
import LocationMapModal from '../common/LocationMapModal'
import LocationFields from './LocationFields'

function FieldError({ field, errors }) {
  if (!errors[field]) return null
  return <small id={`${field}-error`} className="admin-field-error"><CircleAlert size={13} /> {errors[field]}</small>
}

function DestinationSection({ sectionId, title, description, icon, complete, optional = false, children }) {
  const wide = ['basic', 'experience'].includes(sectionId)
  return <section id={`destination-section-${sectionId}`} className={`destination-card${wide ? ' destination-card-wide' : ''}`} aria-labelledby={`destination-heading-${sectionId}`}>
    <header className="destination-card-heading">
      <span className="destination-card-icon" aria-hidden="true">{icon}</span>
      <div><h3 id={`destination-heading-${sectionId}`}>{title}</h3><p>{description}</p></div>
      <span className={`destination-card-status${complete ? ' complete' : ''}`}>{complete ? <><Check size={12} aria-hidden="true" /> Complete</> : optional ? 'Optional' : 'Required'}</span>
    </header>
    <div className="destination-card-body">{children}</div>
  </section>
}

export default function DestinationEditor({ apiFetch, dashboard, draft, errors, focusErrors, pendingImage, removingImage, saving, selectedId, onChange, onChooseImage, onRemoveImage, onDelete, onSubmit, onToggleList }) {
  const [showMapModal, setShowMapModal] = useState(false)
  const formRef = useRef(null)
  const activitySuggestions = CATEGORY_ACTIVITY_SUGGESTIONS[draft.category] || ['Sightseeing', 'Photography', 'Guided tour']
  const pendingImagePreview = useMemo(() => pendingImage ? URL.createObjectURL(pendingImage) : '', [pendingImage])
  const coverPreview = pendingImagePreview || draft.saved_image_url || draft.image_url
  const requiredChecks = [
    draft.name.trim().length >= 3,
    DESTINATION_CATEGORIES.includes(draft.category),
    draft.description.trim().length >= 20,
    draft.interests.length > 0,
    draft.area.trim().length > 0,
    draft.address.trim().length >= 5,
    draft.latitude !== '' && Number.isFinite(Number(draft.latitude)),
    draft.longitude !== '' && Number.isFinite(Number(draft.longitude)),
    draft.operating_days.length > 0,
    Boolean(draft.opening_time && draft.closing_time),
  ]
  const completedRequired = requiredChecks.filter(Boolean).length
  const completionPercent = Math.round((completedRequired / requiredChecks.length) * 100)
  const validationEntries = Object.entries(errors).filter(([, message]) => Boolean(message))
  const sectionCompletion = {
    basic: requiredChecks.slice(0, 4).every(Boolean),
    location: requiredChecks.slice(4, 8).every(Boolean),
    schedule: requiredChecks.slice(8).every(Boolean) && Number(draft.visit_minutes) >= 15 && Number(draft.entrance_fee) >= 0,
    experience: Boolean(draft.activities.length || draft.transportation_options.length || draft.accessibility || draft.contact_information),
    media: Boolean(coverPreview),
    publishing: draft.is_active && draft.is_verified,
  }

  useEffect(() => () => {
    if (pendingImagePreview) URL.revokeObjectURL(pendingImagePreview)
  }, [pendingImagePreview])

  useEffect(() => {
    if (Object.values(focusErrors).some(Boolean)) {
      formRef.current?.querySelector('.field-invalid, .choice-fieldset.invalid, .media-upload-card.invalid')?.focus()
    }
  }, [focusErrors])

  function toggleTextSuggestion(field, value) {
    const values = draft[field].split(',').map((item) => item.trim()).filter(Boolean)
    onChange(field, values.includes(value) ? values.filter((item) => item !== value).join(', ') : [...values, value].join(', '))
  }

  function hasTextSuggestion(field, value) {
    return draft[field].split(',').map((item) => item.trim()).includes(value)
  }

  function invalidClass(field) {
    return errors[field] ? 'field-invalid' : ''
  }

  return <section className="admin-editor destination-editor destination-editor-open">
    <div className="editor-heading destination-editor-heading">
      <div><span className="eyebrow"><MapPin size={14} /> {selectedId ? 'Edit destination' : 'New destination'}</span><h2>{selectedId ? draft.name || 'Destination details' : 'Add a destination'}</h2><p>Keep visitor information accurate and up to date. Fields marked <span className="destination-required">*</span> are required.</p></div>
      <div className="destination-header-actions"><span className="staff-badge"><ShieldCheck size={14} aria-hidden="true" /> Staff only</span><button type="submit" form="destination-form" className="admin-primary-button" disabled={saving}>{saving ? <RefreshCw className="spin" size={16} /> : <Save size={16} aria-hidden="true" />}{saving ? 'Saving...' : selectedId ? 'Save changes' : 'Add destination'}</button></div>
    </div>

    <div className="form-completeness" aria-label={`${completionPercent}% of required details complete`}>
      <div><span>Required details</span><strong>{completedRequired} of {requiredChecks.length} complete</strong></div>
      <span role="progressbar" aria-label="Required destination details" aria-valuenow={completedRequired} aria-valuemin={0} aria-valuemax={requiredChecks.length}><i style={{ width: `${completionPercent}%` }} /></span>
    </div>

    {validationEntries.length > 0 && <div className="destination-validation" role="alert"><CircleAlert size={18} aria-hidden="true" /><div><strong>Review these details before saving</strong><ul>{validationEntries.map(([field, message]) => <li key={field}>{message}</li>)}</ul></div></div>}

    <form ref={formRef} id="destination-form" className="destination-form destination-open-form" onSubmit={onSubmit} noValidate>
      <DestinationSection sectionId="basic" title="Basic information" description="Visitor-facing name, category, description, and interests" icon={<Info size={17} />} complete={sectionCompletion.basic}>
        <div className="admin-form-grid two-columns">
          <label>Destination name <b>*</b><input className={invalidClass('name')} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} value={draft.name} maxLength="180" onChange={(event) => onChange('name', event.target.value)} placeholder="e.g. Osmeña Heritage Park" autoComplete="off" /><FieldError field="name" errors={errors} /></label>
          <label>Category <b>*</b><select className={invalidClass('category')} aria-invalid={Boolean(errors.category)} value={draft.category} onChange={(event) => onChange('category', event.target.value)}><option value="">Select a category</option>{DESTINATION_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select><FieldError field="category" errors={errors} /></label>
        </div>
        <label className="wide-label">Description <b>*</b><textarea className={invalidClass('description')} aria-invalid={Boolean(errors.description)} value={draft.description} maxLength="1200" onChange={(event) => onChange('description', event.target.value)} placeholder="Describe what visitors will experience, what makes the place special, and any important context." /><span className="field-meta"><span>Suggestion: mention the main attraction and ideal visitor experience.</span><strong>{draft.description.length}/1200</strong></span><FieldError field="description" errors={errors} /></label>
        <fieldset tabIndex={errors.interests ? -1 : undefined} className={errors.interests ? 'choice-fieldset invalid' : 'choice-fieldset'}><legend>Traveler interests <b>*</b></legend><p>Select every interest that accurately describes this place.</p><div className="choice-chips">{INTERESTS.map(([value, label]) => <button key={value} type="button" className={draft.interests.includes(value) ? 'selected' : ''} aria-pressed={draft.interests.includes(value)} onClick={() => onToggleList('interests', value)}>{draft.interests.includes(value) && <Check size={13} />}{label}</button>)}</div><FieldError field="interests" errors={errors} /></fieldset>
      </DestinationSection>

      <DestinationSection sectionId="location" title="Location" description="Address, map coordinates, and route-planning pin" icon={<MapPinned size={17} />} complete={sectionCompletion.location}>
        <LocationFields apiFetch={apiFetch} draft={draft} onChange={onChange} />
        <div className="destination-map-action"><button type="button" className="open-map-button" onClick={() => setShowMapModal(true)}><MapPinned size={15} /> Choose on map</button></div>
        <div className="admin-form-grid two-columns">
          <label>Area or barangay <b>*</b><input className={invalidClass('area')} aria-invalid={Boolean(errors.area)} value={draft.area} maxLength="100" onChange={(event) => onChange('area', event.target.value)} placeholder="e.g. Poblacion" /><FieldError field="area" errors={errors} /></label>
          <label>Complete address <b>*</b><input className={invalidClass('address')} aria-invalid={Boolean(errors.address)} value={draft.address} maxLength="255" onChange={(event) => onChange('address', event.target.value)} placeholder="Street, barangay, municipality" /><FieldError field="address" errors={errors} /></label>
        </div>
        <div className="admin-form-grid two-columns coordinate-fields">
          <label>Latitude <b>*</b><input className={invalidClass('latitude')} aria-invalid={Boolean(errors.latitude)} type="number" min="-90" max="90" step="0.000001" value={draft.latitude} onChange={(event) => onChange('latitude', event.target.value)} placeholder="8.300095" /><FieldError field="latitude" errors={errors} /></label>
          <label>Longitude <b>*</b><input className={invalidClass('longitude')} aria-invalid={Boolean(errors.longitude)} type="number" min="-180" max="180" step="0.000001" value={draft.longitude} onChange={(event) => onChange('longitude', event.target.value)} placeholder="123.505903" /><FieldError field="longitude" errors={errors} /></label>
        </div>
        <div className="form-suggestion"><Info size={14} /><span>Choose a pin on the map, then provide the complete visitor-facing address above.</span>{draft.latitude !== '' && draft.longitude !== '' && Number.isFinite(Number(draft.latitude)) && Number.isFinite(Number(draft.longitude)) && <a href={`https://www.google.com/maps?q=${draft.latitude},${draft.longitude}`} target="_blank" rel="noreferrer">Open full map <ArrowRight size={13} /></a>}</div>
      </DestinationSection>

      <DestinationSection sectionId="schedule" title="Schedule and availability" description="Operating days, opening hours, seasonal dates, duration, and fees" icon={<CalendarRange size={17} />} complete={sectionCompletion.schedule}>
        <fieldset tabIndex={errors.operating_days ? -1 : undefined} className={errors.operating_days ? 'choice-fieldset invalid' : 'choice-fieldset'}><legend>Operating days <b>*</b></legend><div className="choice-chips weekday-chips">{OPERATING_DAYS.map((day) => <button key={day} type="button" className={draft.operating_days.includes(day) ? 'selected' : ''} aria-pressed={draft.operating_days.includes(day)} onClick={() => onToggleList('operating_days', day)}>{day.slice(0, 3)}</button>)}<button type="button" className={draft.operating_days.length === 7 ? 'selected all-days' : 'all-days'} onClick={() => onChange('operating_days', draft.operating_days.length === 7 ? [] : OPERATING_DAYS)}>Every day</button></div><FieldError field="operating_days" errors={errors} /></fieldset>
        <div className="admin-form-grid four-columns">
          <label>Opens <b>*</b><input className={invalidClass('opening_time')} aria-invalid={Boolean(errors.opening_time)} type="time" value={draft.opening_time} onChange={(event) => onChange('opening_time', event.target.value)} /><FieldError field="opening_time" errors={errors} /></label>
          <label>Closes <b>*</b><input className={invalidClass('closing_time')} aria-invalid={Boolean(errors.closing_time)} type="time" value={draft.closing_time} onChange={(event) => onChange('closing_time', event.target.value)} /><FieldError field="closing_time" errors={errors} /></label>
          <label>Available from <small>Optional</small><input type="date" value={draft.availability_start} onChange={(event) => onChange('availability_start', event.target.value)} /></label>
          <label>Available until <small>Optional</small><input className={invalidClass('availability_end')} aria-invalid={Boolean(errors.availability_end)} type="date" min={draft.availability_start || undefined} value={draft.availability_end} onChange={(event) => onChange('availability_end', event.target.value)} /><FieldError field="availability_end" errors={errors} /></label>
        </div>
        <div className="admin-form-grid two-columns">
          <label>Suggested visit duration <b>*</b><span className="input-with-suffix"><input className={invalidClass('visit_minutes')} aria-invalid={Boolean(errors.visit_minutes)} min="15" max="720" step="15" type="number" value={draft.visit_minutes} onChange={(event) => onChange('visit_minutes', event.target.value)} /><span>minutes</span></span><div className="field-presets">{[30, 60, 90, 120].map((minutes) => <button type="button" key={minutes} onClick={() => onChange('visit_minutes', String(minutes))}>{minutes < 60 ? `${minutes} min` : `${minutes / 60} hr${minutes > 60 ? 's' : ''}`}</button>)}</div><FieldError field="visit_minutes" errors={errors} /></label>
          <label>Entrance fee <b>*</b><span className="input-with-prefix"><span>₱</span><input className={invalidClass('entrance_fee')} aria-invalid={Boolean(errors.entrance_fee)} min="0" step="0.01" type="number" value={draft.entrance_fee} onChange={(event) => onChange('entrance_fee', event.target.value)} /></span><div className="field-presets"><button type="button" onClick={() => onChange('entrance_fee', '0')}>Free entry</button></div><FieldError field="entrance_fee" errors={errors} /></label>
        </div>
      </DestinationSection>

      <DestinationSection sectionId="experience" title="Visitor experience" description="Activities, transportation, accessibility, contacts, and advisories" icon={<Sparkles size={17} />} complete={sectionCompletion.experience} optional>
        <fieldset className="choice-fieldset"><legend>Suggested activities</legend><p>Suggestions adapt to the selected category.</p><div className="choice-chips">{activitySuggestions.map((activity) => <button key={activity} type="button" className={draft.activities.includes(activity) ? 'selected' : ''} aria-pressed={draft.activities.includes(activity)} onClick={() => onToggleList('activities', activity)}>{draft.activities.includes(activity) && <Check size={13} />}{activity}</button>)}</div></fieldset>
        <fieldset className="choice-fieldset"><legend>Transportation options</legend><div className="choice-chips">{TRANSPORT_SUGGESTIONS.map((option) => <button key={option} type="button" className={draft.transportation_options.includes(option) ? 'selected' : ''} aria-pressed={draft.transportation_options.includes(option)} onClick={() => onToggleList('transportation_options', option)}>{option}</button>)}</div></fieldset>
        <fieldset className="choice-fieldset"><legend>Recommended for</legend><div className="choice-chips">{COMPANION_SUGGESTIONS.map((option) => <button key={option} type="button" className={draft.recommended_companions.includes(option) ? 'selected' : ''} aria-pressed={draft.recommended_companions.includes(option)} onClick={() => onToggleList('recommended_companions', option)}>{option}</button>)}</div></fieldset>
        <label className="wide-label">Accessibility details <small>Optional</small><input value={draft.accessibility} maxLength="255" onChange={(event) => onChange('accessibility', event.target.value)} placeholder="Describe accessible entrances, paths, restrooms, or assistance." /><div className="field-presets wrap">{ACCESSIBILITY_SUGGESTIONS.map((option) => <button type="button" className={hasTextSuggestion('accessibility', option) ? 'selected' : ''} key={option} onClick={() => toggleTextSuggestion('accessibility', option)}>{option}</button>)}</div></label>
        <label className="wide-label">Contact information <small>Optional</small><input value={draft.contact_information} maxLength="255" onChange={(event) => onChange('contact_information', event.target.value)} placeholder="Phone, email, official page, or tourism office contact" /></label>
        <fieldset className="choice-fieldset"><legend>Safety reminders</legend><div className="choice-chips">{SAFETY_SUGGESTIONS.map((option) => <button key={option} type="button" className={draft.safety_reminders.includes(option) ? 'selected' : ''} aria-pressed={draft.safety_reminders.includes(option)} onClick={() => onToggleList('safety_reminders', option)}>{option}</button>)}</div></fieldset>
        <label className="wide-label">Current advisory <small>Optional</small><textarea value={draft.advisory} maxLength="255" onChange={(event) => onChange('advisory', event.target.value)} placeholder="Temporary closures, restricted areas, weather notices, or booking requirements" /><span className="field-meta"><span>Leave blank when there is no current advisory.</span><strong>{draft.advisory.length}/255</strong></span></label>
      </DestinationSection>

      <DestinationSection sectionId="media" title="Cover image" description="Uploaded image or official external image URL" icon={<ImagePlus size={17} />} complete={sectionCompletion.media} optional>
        <div className="destination-media-grid">
          <div tabIndex={errors.image ? -1 : undefined} className={errors.image ? 'media-upload-card invalid' : 'media-upload-card'}>
            {coverPreview ? <div className="media-preview"><img src={coverPreview} alt={`Cover preview for ${draft.name || 'destination'}`} /><button type="button" onClick={onRemoveImage} disabled={removingImage || saving}><Trash2 size={15} /> {removingImage ? 'Removing...' : pendingImage ? 'Discard image' : 'Remove image'}</button></div> : <label className="media-dropzone"><span><Upload size={22} /></span><strong>Upload cover image</strong><small>JPG, PNG, or WebP · maximum 5 MB</small><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { onChooseImage(event.target.files?.[0]); event.target.value = '' }} /></label>}
            {pendingImage && <p className="selected-file"><Check size={14} /> {pendingImage.name} · {(pendingImage.size / 1024 / 1024).toFixed(1)} MB</p>}
            <FieldError field="image" errors={errors} />
          </div>
          <div className="media-url-field"><span className="media-or">or</span><label>External image URL <small>Optional fallback</small><span className="input-with-leading-icon"><Link2 size={16} /><input className={invalidClass('image_url')} aria-invalid={Boolean(errors.image_url)} type="url" value={draft.image_url} onChange={(event) => onChange('image_url', event.target.value)} placeholder="https://example.com/destination.jpg" /></span><FieldError field="image_url" errors={errors} /></label><p>Use an official, stable HTTPS image link. An uploaded image takes priority.</p></div>
        </div>
      </DestinationSection>

      <DestinationSection sectionId="publishing" title="Publishing status" description="Availability and tourism-office verification" icon={<ShieldCheck size={17} />} complete={sectionCompletion.publishing}>
        <div className="record-flags destination-switches"><label><input type="checkbox" checked={draft.is_active} onChange={(event) => onChange('is_active', event.target.checked)} /><span><strong>Available to visitors</strong><small>Allow this destination to be considered by the planner.</small></span></label><label><input type="checkbox" checked={draft.is_verified} onChange={(event) => onChange('is_verified', event.target.checked)} /><span><strong>Tourism office verified</strong><small>Confirm the details were checked against an official source.</small></span></label></div>
      </DestinationSection>

      <div className="editor-footer destination-editor-footer"><p><CircleAlert size={15} /> Review opening hours, fees, and advisories regularly.</p><div className="destination-editor-actions">{selectedId && <button type="button" className="admin-danger-button" onClick={onDelete} disabled={saving || removingImage}><Trash2 size={16} /> Delete</button>}<button type="submit" className="admin-primary-button" disabled={saving}>{saving ? <RefreshCw className="spin" size={17} /> : <Save size={17} />}{saving ? ' Saving destination...' : selectedId ? ' Save changes' : ' Add destination'}</button></div></div>
    </form>
    {showMapModal && <LocationMapModal draft={draft} onClose={() => setShowMapModal(false)} onApply={({ address, latitude, longitude }) => { if (address) onChange('address', address); onChange('latitude', latitude); onChange('longitude', longitude); setShowMapModal(false) }} />}
    <div className="interest-summary"><span>Popular interest signals</span>{dashboard?.popular_interests?.map(([interest, count]) => <strong key={interest}>{interest} <small>{count}</small></strong>)}</div>
  </section>
}
