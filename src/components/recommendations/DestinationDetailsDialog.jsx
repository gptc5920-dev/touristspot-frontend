import { useState } from 'react'
import DestinationCategoryTags from '../common/DestinationCategoryTags'
import { resolveMediaUrl } from '../../api'
import DestinationImage from '../common/DestinationImage'
import DialogSurface from '../common/DialogSurface'
import { Clock3, MapPin, Navigation, X } from '../../fontawesome-icons'
import { peso } from '../../lib/app'

function Detail({ label, children }) {
  return <div className="destination-detail-fact"><dt>{label}</dt><dd>{children || 'Not listed'}</dd></div>
}

function PhotoGallery({ destination }) {
  const [selected, setSelected] = useState(() => destination.image_url ? null : destination.supporting_photos?.[0]?.position ?? null)
  const photos = destination.supporting_photos || []
  const activePhoto = photos.find((photo) => photo.position === selected)
  const image = activePhoto ? { name: `${destination.name} — supporting photo ${selected + 1}`, image_url: resolveMediaUrl(activePhoto.image_url) } : destination
  return <section className="destination-gallery" aria-label={`Photos of ${destination.name}`}>
    <div className="destination-gallery-main"><DestinationImage destination={image} className="destination-gallery-image" /></div>
    <div className="destination-gallery-heading"><h3>Supporting tourist photos</h3><span>{photos.length} of 6 photos</span></div>
    <div className="destination-gallery-thumbnails">
      {Array.from({ length: 6 }, (_, position) => {
        const photo = photos.find((item) => item.position === position)
        return photo ? <button type="button" key={position} className={selected === position ? 'selected' : ''} aria-label={`View supporting photo ${position + 1} of ${destination.name}`} aria-pressed={selected === position} onClick={() => setSelected(position)}><DestinationImage destination={{ name: `${destination.name}, photo ${position + 1}`, image_url: resolveMediaUrl(photo.image_url) }} /><span>Photo {position + 1}</span></button>
          : <div key={position} className="destination-gallery-missing"><span>Photo {position + 1}</span><small>Not added yet</small></div>
      })}
    </div>
    {selected !== null && destination.image_url && <button className="destination-gallery-cover" type="button" onClick={() => setSelected(null)}>Back to cover photo</button>}
  </section>
}

export default function DestinationDetailsDialog({ destination, onClose, onAdd }) {
  if (!destination) return null
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((destination.coordinates?.length === 2 ? destination.coordinates.join(',') : [destination.name, destination.address || destination.area].filter(Boolean).join(', ')))}`
  const list = (values) => values?.length ? values.join(', ') : ''
  return <div className="destination-detail-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <DialogSurface onClose={onClose} className="destination-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="destination-detail-title">
      <header className="destination-detail-heading">
        <div><DestinationCategoryTags destination={destination} /><h2 id="destination-detail-title">{destination.name}</h2><p><MapPin size={15} />{destination.address || destination.area || 'Location not listed'}</p></div>
        <button type="button" className="destination-detail-close" onClick={onClose} aria-label="Close destination details"><X size={20} /></button>
      </header>
      <PhotoGallery key={destination.id || destination.destination_id} destination={destination} />
      <div className="destination-detail-content">
        <section aria-labelledby="destination-about-title"><h3 id="destination-about-title">About this destination</h3><p className="destination-detail-description">{destination.description || 'A description has not been added yet.'}</p></section>
        <dl className="destination-detail-summary">
          <Detail label="Entrance fee">{destination.entrance_fee == null ? 'Not listed' : Number(destination.entrance_fee) === 0 ? 'Free' : peso.format(Number(destination.entrance_fee))}</Detail>
          <Detail label="Operating hours">{destination.hours}</Detail>
          <Detail label="Visit duration">{destination.visit_minutes ? `${destination.visit_minutes} minutes` : ''}</Detail>
          <Detail label="Visitor rating">{destination.average_rating == null ? 'No ratings yet' : `${destination.average_rating} / 5`}{` · ${destination.review_count || 0} review${destination.review_count === 1 ? '' : 's'}`}</Detail>
        </dl>
        <section aria-labelledby="destination-visitor-title"><h3 id="destination-visitor-title">Visitor information</h3><dl className="destination-detail-info">
          <Detail label="Complete address">{destination.address}</Detail>
          <Detail label="Area or barangay">{destination.area}</Detail>
          <Detail label="Operating days">{list(destination.operating_days)}</Detail>
          <Detail label="Seasonal availability">{destination.availability_start || destination.availability_end ? `${destination.availability_start || 'Any start date'} to ${destination.availability_end || 'No end date'}` : 'No seasonal dates listed'}</Detail>
          <Detail label="Activities">{list(destination.activities)}</Detail>
          <Detail label="Traveler interests">{list(destination.interests)}</Detail>
          <Detail label="Accessibility">{destination.accessibility || destination.accessibility_information || 'Contact the venue for accessibility details.'}</Detail>
          <Detail label="Transportation">{list(destination.transportation_options)}</Detail>
          <Detail label="Recommended companions">{list(destination.recommended_companions)}</Detail>
          <Detail label="Contact information">{destination.contact_information}</Detail>
          <Detail label="Safety reminders">{list(destination.safety_reminders)}</Detail>
          <Detail label="Tourism office verification">{destination.is_verified ? 'Verified' : 'Not verified'}</Detail>
          {destination.estimated_travel_time && <Detail label="Estimated travel time">{destination.estimated_travel_time}</Detail>}
        </dl></section>
        {destination.advisory && <div className="destination-detail-advisory"><strong>Tourism advisory</strong><p>{destination.advisory}</p></div>}
        <div className="destination-detail-actions"><a href={mapUrl} target="_blank" rel="noreferrer"><Navigation size={16} /> View on Map</a><button type="button" onClick={() => onAdd(destination)}><Clock3 size={16} /> Add to Itinerary</button></div>
      </div>
    </DialogSurface>
  </div>
}
