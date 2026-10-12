import { useState } from 'react'
import { MapPinned } from '../../fontawesome-icons'

export default function DestinationImage({ destination, className = '' }) {
  const [failedUrl, setFailedUrl] = useState(null)
  return destination.image_url && destination.image_url !== failedUrl
    ? <img className={className} src={destination.image_url} alt={destination.name} loading="lazy" decoding="async" onError={() => setFailedUrl(destination.image_url)} />
    : <span className={`discover-image-placeholder ${className}`} role="img" aria-label={`Photo unavailable for ${destination.name}`}><MapPinned size={32} /></span>
}
