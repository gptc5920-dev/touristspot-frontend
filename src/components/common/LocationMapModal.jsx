import { useEffect, useState } from 'react'
import { Check, CircleAlert, LocateFixed, MapPin, MapPinned, RefreshCw, Search, X } from '../../fontawesome-icons'

export default function LocationMapModal({ draft, onApply, onClose, eyebrow = 'Destination location', title = 'Choose location on map', description = 'Search the address, confirm the coordinates, then apply them to the destination.', applyLabel = 'Apply location' }) {
  const initialLatitude = String(draft.latitude || '')
  const initialLongitude = String(draft.longitude || '')
  const initialAddress = draft.address || ''
  const initialTarget = Number.isFinite(Number(initialLatitude)) && initialLatitude && Number.isFinite(Number(initialLongitude)) && initialLongitude
    ? `${initialLatitude},${initialLongitude}`
    : initialAddress || 'Sergio Osmeña, Zamboanga del Norte, Philippines'
  const [address, setAddress] = useState(initialAddress)
  const [latitude, setLatitude] = useState(initialLatitude)
  const [longitude, setLongitude] = useState(initialLongitude)
  const [mapTarget, setMapTarget] = useState(initialTarget)
  const [mapError, setMapError] = useState('')
  const [locating, setLocating] = useState(false)
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapTarget)}&z=15&output=embed`

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [onClose])

  function validCoordinates() {
    const parsedLatitude = Number(latitude)
    const parsedLongitude = Number(longitude)
    return latitude !== '' && longitude !== '' && Number.isFinite(parsedLatitude) && Number.isFinite(parsedLongitude)
      && parsedLatitude >= -90 && parsedLatitude <= 90 && parsedLongitude >= -180 && parsedLongitude <= 180
  }

  function searchAddress() {
    if (address.trim().length < 3) {
      setMapError('Enter an address or place name before searching the map.')
      return
    }
    setMapError('')
    setMapTarget(address.trim())
  }

  function previewCoordinates() {
    if (!validCoordinates()) {
      setMapError('Enter valid latitude and longitude values before previewing the pin.')
      return
    }
    setMapError('')
    setMapTarget(`${latitude},${longitude}`)
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setMapError('Current location is not supported by this browser.')
      return
    }
    setLocating(true)
    setMapError('')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLatitude = position.coords.latitude.toFixed(6)
        const nextLongitude = position.coords.longitude.toFixed(6)
        setLatitude(nextLatitude)
        setLongitude(nextLongitude)
        setMapTarget(`${nextLatitude},${nextLongitude}`)
        setLocating(false)
      },
      () => {
        setMapError('Location access was unavailable. Enter the coordinates manually instead.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  function applyLocation(event) {
    event.preventDefault()
    if (!validCoordinates()) {
      setMapError('Enter valid latitude and longitude values before applying this location.')
      return
    }
    onApply({ address: address.trim(), latitude, longitude })
  }

  return <div className="modal-backdrop map-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="location-map-dialog" role="dialog" aria-modal="true" aria-labelledby="location-map-title">
      <header><div><span className="map-dialog-icon"><MapPinned size={20} /></span><div><span className="eyebrow">{eyebrow}</span><h2 id="location-map-title">{title}</h2><p>{description}</p></div></div><button type="button" className="dialog-close" title="Close map" onClick={onClose}><X size={18} /></button></header>
      <div className="location-map-layout">
        <div className="embedded-map-frame"><iframe title="Destination location map" src={mapUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen /><span><MapPin size={13} /> Map preview: {mapTarget}</span></div>
        <form className="map-location-form" onSubmit={applyLocation}>
          <div className="map-form-intro"><strong>Location details</strong><span>Search helps you inspect the area. Coordinates define the exact itinerary pin.</span></div>
          <label>Address or place name <small>Optional in map picker</small><span className="map-search-control"><input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Search an address or apply coordinates only" autoFocus /><button type="button" onClick={searchAddress}><Search size={15} /> Search</button></span></label>
          <div className="admin-form-grid two-columns"><label>Latitude <b>*</b><input type="number" min="-90" max="90" step="0.000001" value={latitude} onChange={(event) => setLatitude(event.target.value)} placeholder="8.300095" /></label><label>Longitude <b>*</b><input type="number" min="-180" max="180" step="0.000001" value={longitude} onChange={(event) => setLongitude(event.target.value)} placeholder="123.505903" /></label></div>
          <div className="map-coordinate-actions"><button type="button" onClick={previewCoordinates}><MapPin size={15} /> Preview coordinates</button><button type="button" onClick={useCurrentLocation} disabled={locating}>{locating ? <RefreshCw className="spin" size={15} /> : <LocateFixed size={15} />}{locating ? ' Finding you...' : ' Use current location'}</button></div>
          {mapError && <div className="map-form-error" role="alert"><CircleAlert size={15} /><span>{mapError}</span></div>}
          <div className="map-dialog-actions"><button type="button" className="admin-access-secondary" onClick={onClose}>Cancel</button><button type="submit" className="admin-primary-button"><Check size={16} /> {applyLabel}</button></div>
        </form>
      </div>
    </section>
  </div>
}
