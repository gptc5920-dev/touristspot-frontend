import { useEffect, useRef, useState } from 'react'

const TILE_SIZE = 256
const MAX_LATITUDE = 85.05112878

function project(latitude, longitude, zoom) {
  const scale = TILE_SIZE * 2 ** zoom
  const lat = Math.max(-MAX_LATITUDE, Math.min(MAX_LATITUDE, latitude)) * Math.PI / 180
  return {
    x: (longitude + 180) / 360 * scale,
    y: (1 - Math.log(Math.tan(lat) + 1 / Math.cos(lat)) / Math.PI) / 2 * scale,
  }
}

function unproject(x, y, zoom) {
  const scale = TILE_SIZE * 2 ** zoom
  return {
    latitude: Math.atan(Math.sinh(Math.PI * (1 - 2 * y / scale))) * 180 / Math.PI,
    longitude: ((x / scale * 360 + 180) % 360 + 360) % 360 - 180,
  }
}

export default function SelectableMap({ latitude, longitude, target, onSelect }) {
  const containerRef = useRef(null)
  const gestureRef = useRef(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [zoom, setZoom] = useState(13)
  const [center, setCenter] = useState(() => target || { latitude: 8.300095, longitude: 123.505903 })

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (target) setCenter(target)
  }, [target])

  const centerPoint = project(center.latitude, center.longitude, zoom)
  const selectedPoint = latitude !== '' && longitude !== '' ? project(Number(latitude), Number(longitude), zoom) : null
  const tileCount = 2 ** zoom
  const firstX = Math.floor((centerPoint.x - size.width / 2) / TILE_SIZE)
  const lastX = Math.floor((centerPoint.x + size.width / 2) / TILE_SIZE)
  const firstY = Math.max(0, Math.floor((centerPoint.y - size.height / 2) / TILE_SIZE))
  const lastY = Math.min(tileCount - 1, Math.floor((centerPoint.y + size.height / 2) / TILE_SIZE))
  const tiles = []
  for (let x = firstX; x <= lastX; x += 1) {
    for (let y = firstY; y <= lastY; y += 1) {
      tiles.push({ x, y, left: x * TILE_SIZE - centerPoint.x + size.width / 2, top: y * TILE_SIZE - centerPoint.y + size.height / 2 })
    }
  }

  function handlePointerDown(event) {
    if (event.target.closest('button, a')) return
    event.currentTarget.setPointerCapture(event.pointerId)
    gestureRef.current = { x: event.clientX, y: event.clientY, center, moved: false }
  }

  function handlePointerMove(event) {
    const gesture = gestureRef.current
    if (!gesture) return
    const deltaX = event.clientX - gesture.x
    const deltaY = event.clientY - gesture.y
    if (Math.abs(deltaX) + Math.abs(deltaY) > 5) gesture.moved = true
    if (gesture.moved) {
      const origin = project(gesture.center.latitude, gesture.center.longitude, zoom)
      setCenter(unproject(origin.x - deltaX, origin.y - deltaY, zoom))
    }
  }

  function handlePointerUp(event) {
    const gesture = gestureRef.current
    if (!gesture) return
    gestureRef.current = null
    if (gesture.moved) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const point = project(center.latitude, center.longitude, zoom)
    onSelect(unproject(point.x + event.clientX - bounds.left - bounds.width / 2, point.y + event.clientY - bounds.top - bounds.height / 2, zoom))
  }

  return <div ref={containerRef} className="selectable-map" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={() => { gestureRef.current = null }} aria-label="Map. Click or tap to choose a location, drag to move the map.">
    {tiles.map(({ x, y, left, top }) => <img key={`${zoom}-${x}-${y}`} className="selectable-map-tile" src={`https://tile.openstreetmap.org/${zoom}/${((x % tileCount) + tileCount) % tileCount}/${y}.png`} alt="" draggable="false" style={{ left, top }} />)}
    {selectedPoint && <span className="selectable-map-pin" style={{ left: selectedPoint.x - centerPoint.x + size.width / 2, top: selectedPoint.y - centerPoint.y + size.height / 2 }} aria-label="Selected location" />}
    <div className="selectable-map-zoom"><button type="button" aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(18, value + 1))}>+</button><button type="button" aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(2, value - 1))}>−</button></div>
    <span className="selectable-map-hint">Click the map to place your pin</span>
    <a className="selectable-map-attribution" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a>
  </div>
}
