const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

export function apiEndpoint(path) {
  return `${API_BASE_URL}/${path.replace(/^\//, '')}`
}

export function resolveMediaUrl(url) {
  if (!url || !url.startsWith('/media/')) return url || ''
  return `${new URL(API_BASE_URL, window.location.origin).origin}${url}`
}

export async function readApiJson(response) {
  const payload = await response.text()
  if (!payload) return {}
  try {
    return JSON.parse(payload)
  } catch {
    const source = response.url || 'the server'
    if (response.status === 413) throw new Error('The server rejected the upload as too large. Choose a smaller image or increase the server upload limit.')
    if (response.status >= 500) throw new Error(`The API failed while processing this request (HTTP ${response.status}) at ${source}. Check the server logs for the cause.`)
    throw new Error(`The server returned a non-JSON response (HTTP ${response.status}) from ${source}. Please retry or check the server logs.`)
  }
}
