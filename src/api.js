const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

export function apiEndpoint(path) {
  return `${API_BASE_URL}/${path.replace(/^\//, '')}`
}

export async function readApiJson(response) {
  const payload = await response.text()
  if (!payload) return {}
  try {
    return JSON.parse(payload)
  } catch {
    const source = response.url || 'the server'
    throw new Error(`The server returned an unexpected response from ${source}. Please retry after confirming the API is running.`)
  }
}
