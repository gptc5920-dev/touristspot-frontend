import { GUEST_USER, ROUTES } from '../config/travel'

export const peso = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
})

export function formatEstimate(value) {
  return Number.isFinite(value) ? peso.format(value) : 'Unavailable'
}

export function viewFromPath(pathname) {
  const normalized = pathname.replace(/\/+$/, '')
  const matchedView = Object.entries(ROUTES)
    .find(([, path]) => path !== '/' && normalized === path.replace(/\/+$/, ''))
  return matchedView?.[0] || 'home'
}

export function getCookie(name) {
  const prefix = `${encodeURIComponent(name)}=`
  const cookie = document.cookie.split('; ').find((item) => item.startsWith(prefix))
  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : ''
}

export function authUserFromPayload(user) {
  if (!user || typeof user !== 'object' || typeof user.is_authenticated !== 'boolean') {
    throw new Error('The server returned an invalid sign-in response.')
  }
  if (!user.is_authenticated) return GUEST_USER
  if (!user.username && !user.email) throw new Error('The signed-in account has no username or email.')
  return {
    is_authenticated: true,
    role: user.role === 'admin' ? 'admin' : 'tourist',
    username: String(user.username || ''),
    email: String(user.email || ''),
    display_name: String(user.display_name || user.username || ''),
    preferences_completed: Boolean(user.preferences_completed),
  }
}

export function apiErrorMessage(payload, fallback) {
  const fieldMessage = payload?.errors && Object.values(payload.errors)
    .flatMap((messages) => Array.isArray(messages) ? messages : [messages])
    .find(Boolean)
  return fieldMessage || payload?.error || payload?.message || payload?.detail || fallback
}

export function requestErrorMessage(error, fallback) {
  if (error instanceof TypeError) {
    return 'Could not connect to the Travel Osmena API. Confirm the Django server is running and try again.'
  }
  return error?.message || fallback
}
