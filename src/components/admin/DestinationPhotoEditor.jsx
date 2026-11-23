import { useState } from 'react'
import { readApiJson, resolveDestinationMedia } from '../../api'
import { apiErrorMessage, requestErrorMessage } from '../../lib/app'
import DestinationImage from '../common/DestinationImage'
import ImageCropDialog from './ImageCropDialog'

export default function DestinationPhotoEditor({ apiFetch, destinationId, photos, disabled, onChange }) {
  const [busy, setBusy] = useState(null)
  const [crop, setCrop] = useState(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')

  async function updatePhoto(position, file) {
    if (file && (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024)) {
      setError('Choose a JPG, PNG, or WebP image that is 5 MB or smaller.')
      return
    }
    setBusy(position)
    setError('')
    setStatus('')
    try {
      const body = new FormData()
      if (file) body.append('image', file)
      const response = await apiFetch(`/admin/destinations/${destinationId}/photos/${position}/`, { method: file ? 'POST' : 'DELETE', ...(file ? { body } : {}) })
      const data = await readApiJson(response)
      if (!response.ok) throw new Error(apiErrorMessage(data, 'Could not update supporting photo.'))
      onChange(destinationId, resolveDestinationMedia(data.destination).supporting_photos)
      setStatus(`Photo ${position + 1} ${file ? 'saved' : 'removed'}.`)
    } catch (requestError) {
      setError(requestErrorMessage(requestError, 'Could not update supporting photo.'))
    } finally {
      setBusy(null)
    }
  }

  return <div className="destination-photo-editor">
    <p>{destinationId ? `${photos.length} of 6 supporting photos uploaded. Photo changes are saved immediately.` : 'Save the destination first, then upload its six supporting photos.'}</p>
    <div className="destination-photo-slots">
      {Array.from({ length: 6 }, (_, position) => {
        const photo = photos.find((item) => item.position === position)
        const locked = disabled || busy !== null || !destinationId
        return <div className="destination-photo-slot" key={position}>
          {photo ? <DestinationImage destination={{ ...photo, name: `Supporting photo ${position + 1}` }} /> : <div className="destination-photo-empty">Photo {position + 1}</div>}
          <label>Photo {position + 1}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={locked} aria-label={`${photo ? 'Replace' : 'Upload'} supporting photo ${position + 1}`} onChange={(event) => { const file = event.target.files?.[0]; if (file && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) && file.size <= 5 * 1024 * 1024) setCrop({ position, source: file }); else if (file) updatePhoto(position, file); event.target.value = '' }} /></label>
          {photo && <button type="button" disabled={locked} onClick={() => setCrop({ position, source: photo.image_url })}>Crop photo {position + 1}</button>}
          {photo && <button type="button" disabled={locked} onClick={() => updatePhoto(position)}>Remove photo {position + 1}</button>}
          {busy === position && <small role="status">Saving photo...</small>}
        </div>
      })}
    </div>
    <small>JPG, PNG, or WebP · maximum 5 MB per photo.</small>
    {error && <p role="alert" className="admin-field-error">{error}</p>}
    <p role="status">{status}</p>
    {crop && <ImageCropDialog source={crop.source} onClose={() => setCrop(null)} onApply={(file) => { updatePhoto(crop.position, file); setCrop(null) }} />}
  </div>
}
