import { useEffect, useRef, useState } from 'react'
import { Check, CircleAlert, LocateFixed, MapPin, MapPinned, RefreshCw, Search, X } from '../../fontawesome-icons'
import SelectableMap from './SelectableMap'

export default function LocationMapModal({ draft, onApply, onClose, eyebrow = 'Destination location', title = 'Choose location on map', description = 'Search the address, confirm the coordinates, then apply them to the destination.', applyLabel = 'Apply location' }) {
  const initialLatitude = String(draft.latitude || '')
  const initialLongitude = String(draft.longitude || '')
  const initialAddress = draft.address || ''
  const [address, setAddress] = useState(initialAddress)
  const [latitude, setLatitude] = useState(initialLatitude)
  const [longitude, setLongitude] = useState(initialLongitude)
  const [mapTarget, setMapTarget] = useState(initialLatitude && initialLongitude ? { latitude: Number(initialLatitude), longitude: Number(initialLongitude) } : null)
  const [mapError, setMapError] = useState('')
  const [locating, setLocating] = useState(false)
  const [searching, setSearching] = useState(false)
  const lastSearchAt = useRef(0)

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

  async function searchAddress() {
    if (address.trim().length < 3) {
      setMapError('Enter an address or place name before searching the map.')
      return
    }
    if (searching) return
    if (Date.now() - lastSearchAt.current < 1000) {
      setMapError('Please wait a moment before searching again.')
      return
    }
    lastSearchAt.current = Date.now()
    setMapError('')
    setSearching(true)
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(address.trim())}`, { headers: { Accept: 'application/json' } })
      if (!response.ok) throw new Error('Search is unavailable right now. Try placing a pin on the map or entering coordinates.')
      const results = await response.json()
      if (!results.length) throw new Error('No matching place found. Try a more specific address or place a pin on the map.')
      const nextLatitude = Number(results[0].lat).toFixed(6)
      const nextLongitude = Number(results[0].lon).toFixed(6)
      setLatitude(nextLatitude)
      setLongitude(nextLongitude)
      setAddress(results[0].display_name.slice(0, 255))
      setMapTarget({ latitude: Number(nextLatitude), longitude: Number(nextLongitude) })
    } catch (error) {
      setMapError(error.message || 'Search failed. Try placing a pin on the map or entering coordinates.')
    } finally {
      setSearching(false)
    }
  }

  function previewCoordinates() {
    if (!validCoordinates()) {
      setMapError('Enter valid latitude and longitude values before previewing the pin.')
      return
    }
    setMapError('')
    setMapTarget({ latitude: Number(latitude), longitude: Number(longitude) })
  }

  function selectPin(position) {
    setLatitude(position.latitude.toFixed(6))
    setLongitude(position.longitude.toFixed(6))
    setAddress('')
    setMapError('')
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
        setAddress('')
        setMapTarget({ latitude: Number(nextLatitude), longitude: Number(nextLongitude) })
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
        <div className="embedded-map-frame"><SelectableMap latitude={latitude} longitude={longitude} target={mapTarget} onSelect={selectPin} /></div>
        <form className="map-location-form" onSubmit={applyLocation}>
          <div className="map-form-intro"><strong>Location details</strong><span>Search for a place or click the map to set the pin. You can also enter coordinates.</span></div>
          <label>Address or place name <small>Optional in map picker</small><span className="map-search-control"><input value={address} maxLength="255" onChange={(event) => { setAddress(event.target.value); setLatitude(''); setLongitude('') }} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); if (!searching) searchAddress() } }} placeholder="Search an address or apply coordinates only" autoFocus /><button type="button" onClick={searchAddress} disabled={searching}>{searching ? <RefreshCw className="spin" size={15} /> : <Search size={15} />}{searching ? ' Searching...' : ' Search'}</button></span></label>
          <div className="admin-form-grid two-columns"><label>Latitude <b>*</b><input type="number" min="-90" max="90" step="0.000001" value={latitude} onChange={(event) => setLatitude(event.target.value)} placeholder="8.300095" /></label><label>Longitude <b>*</b><input type="number" min="-180" max="180" step="0.000001" value={longitude} onChange={(event) => setLongitude(event.target.value)} placeholder="123.505903" /></label></div>
          <div className="map-coordinate-actions"><button type="button" onClick={previewCoordinates}><MapPin size={15} /> Preview coordinates</button><button type="button" onClick={useCurrentLocation} disabled={locating}>{locating ? <RefreshCw className="spin" size={15} /> : <LocateFixed size={15} />}{locating ? ' Finding you...' : ' Use current location'}</button></div>
          {mapError && <div className="map-form-error" role="alert"><CircleAlert size={15} /><span>{mapError}</span></div>}
          <div className="map-dialog-actions"><button type="button" className="admin-access-secondary" onClick={onClose}>Cancel</button><button type="submit" className="admin-primary-button"><Check size={16} /> {applyLabel}</button></div>
        </form>
      </div>
    </section>
  </div>
}
