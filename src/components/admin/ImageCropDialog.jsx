import { useEffect, useRef, useState } from 'react'
import DialogSurface from '../common/DialogSurface'

export default function ImageCropDialog({ source, onApply, onClose }) {
  const canvasRef = useRef(null)
  const [image, setImage] = useState(null)
  const [error, setError] = useState('')
  const [zoom, setZoom] = useState(1)
  const [horizontal, setHorizontal] = useState(50)
  const [vertical, setVertical] = useState(50)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const url = source instanceof File ? URL.createObjectURL(source) : source
    const loaded = new Image()
    if (!(source instanceof File)) loaded.crossOrigin = 'anonymous'
    loaded.onload = () => setImage(loaded)
    loaded.onerror = () => setError('This image could not be opened for cropping. Try uploading it again.')
    loaded.src = url
    return () => { loaded.onload = null; loaded.onerror = null; if (source instanceof File) URL.revokeObjectURL(url) }
  }, [source])

  useEffect(() => {
    if (!image) return
    const canvas = canvasRef.current
    const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight) * zoom
    const width = image.naturalWidth * scale
    const height = image.naturalHeight * scale
    const context = canvas.getContext('2d')
    context.fillStyle = '#fff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, -(width - canvas.width) * horizontal / 100, -(height - canvas.height) * vertical / 100, width, height)
  }, [image, zoom, horizontal, vertical])

  function applyCrop() {
    setSaving(true)
    try {
      canvasRef.current.toBlob((blob) => {
        if (!blob) { setError('Could not create the cropped image.'); setSaving(false); return }
        onApply(new File([blob], 'destination-cropped.jpg', { type: 'image/jpeg' }))
      }, 'image/jpeg', 0.9)
    } catch {
      setError('This image cannot be cropped from its current source. Try uploading it again.')
      setSaving(false)
    }
  }

  return <div className="modal-backdrop image-crop-backdrop" role="presentation"><DialogSurface className="image-crop-dialog" onClose={onClose} busy={saving} aria-labelledby="image-crop-title">
    <h2 id="image-crop-title">Crop image</h2><p>Adjust the image to choose what appears in the preview. The cropped image uses a wide 16:9 frame.</p>
    <canvas ref={canvasRef} width="1280" height="720" aria-label="Preview of the cropped image" />
    <label>Zoom <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} disabled={!image} /></label>
    <label>Horizontal position <input type="range" min="0" max="100" value={horizontal} onChange={(event) => setHorizontal(Number(event.target.value))} disabled={!image} /></label>
    <label>Vertical position <input type="range" min="0" max="100" value={vertical} onChange={(event) => setVertical(Number(event.target.value))} disabled={!image} /></label>
    {error && <p role="alert" className="admin-field-error">{error}</p>}
    <div className="image-crop-actions"><button type="button" className="admin-secondary-button" onClick={onClose} disabled={saving}>Cancel</button><button type="button" className="admin-primary-button" onClick={applyCrop} disabled={!image || saving}>Apply crop</button></div>
  </DialogSurface></div>
}
