import { useCallback } from 'react'
import { apiEndpoint, readApiJson } from '../api'
import { apiErrorMessage, getCookie } from '../lib/app'

export default function useApiFetch() {
  return useCallback(async (url, options = {}) => {
    const method = (options.method || 'GET').toUpperCase()
    const headers = { ...(options.headers || {}) }

    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      if (!getCookie('csrftoken')) {
        const csrfResponse = await fetch(apiEndpoint('/auth/csrf/'), { credentials: 'include' })
        if (!csrfResponse.ok) {
          const payload = await readApiJson(csrfResponse)
          throw new Error(apiErrorMessage(payload, 'Could not initialize a secure session.'))
        }
      }

      const csrfToken = getCookie('csrftoken')
      if (!csrfToken) throw new Error('Could not initialize a secure session. Refresh the page and try again.')
      headers['X-CSRFToken'] = csrfToken
    }

    return fetch(apiEndpoint(url), { ...options, method, headers, credentials: 'include' })
  }, [])
}
