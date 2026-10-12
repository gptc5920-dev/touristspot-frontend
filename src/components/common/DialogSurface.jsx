import { useLayoutEffect, useRef, useState } from 'react'

const surfaces = []
const focusable = 'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'

// Shared keyboard behavior, including nested dialogs and returning to the opener.
export default function DialogSurface({ children, onClose, busy = false, ...props }) {
  const ref = useRef(null)
  const closeRef = useRef(onClose)
  const busyRef = useRef(busy)
  const [opener] = useState(() => document.activeElement)
  useLayoutEffect(() => { closeRef.current = onClose; busyRef.current = busy }, [onClose, busy])
  useLayoutEffect(() => {
    const surface = ref.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    surfaces.push(surface)
    const controls = () => [...surface.querySelectorAll(focusable)].filter((element) => element.getClientRects().length && !element.closest('[inert]'))
    const focusFirst = () => (controls()[0] || surface).focus()
    if (!surface.contains(document.activeElement)) focusFirst()
    const onFocus = (event) => {
      if (surfaces.at(-1) === surface && !surface.contains(event.target)) focusFirst()
    }
    const onKey = (event) => {
      if (surfaces.at(-1) !== surface) return
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopImmediatePropagation()
        if (!busyRef.current) closeRef.current?.()
      }
      if (event.key === 'Tab') {
        const items = controls()
        const first = items[0] || surface
        const last = items.at(-1) || surface
        if (!items.length || (event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last)) {
          event.preventDefault()
          const target = event.shiftKey ? last : first
          target.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey, true)
    document.addEventListener('focusin', onFocus)
    return () => {
      surfaces.splice(surfaces.indexOf(surface), 1)
      document.removeEventListener('keydown', onKey, true)
      document.removeEventListener('focusin', onFocus)
      document.body.style.overflow = previousOverflow
      if (opener?.isConnected) opener.focus()
    }
  }, [opener])
  return <section {...props} ref={ref} tabIndex={-1} role={props.role || 'dialog'} aria-modal="true">{children}</section>
}
