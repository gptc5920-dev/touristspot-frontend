import { useEffect, useState } from 'react'
import { apiEndpoint, readApiJson } from '../api'
import { EMPTY_SIGNUP, GUEST_USER } from '../config/travel'
import { apiErrorMessage, authUserFromPayload, requestErrorMessage } from '../lib/app'

export default function useAuthentication({ apiFetch, navigateTo, onError, onModal, onNotice }) {
  const [user, setUser] = useState(GUEST_USER)
  const [checking, setChecking] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const [mode, setMode] = useState('signin')
  const [context, setContext] = useState('public')
  const [credentials, setCredentials] = useState({ identifier: '', password: '' })
  const [signupDetails, setSignupDetails] = useState(EMPTY_SIGNUP)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadSession() {
      try {
        const csrfResponse = await fetch(apiEndpoint('/auth/csrf/'), { credentials: 'include' })
        if (!csrfResponse.ok) throw new Error('Could not initialize a secure session.')
        const response = await fetch(apiEndpoint('/auth/me/'), { credentials: 'include' })
        const body = await readApiJson(response)
        if (!response.ok) throw new Error(apiErrorMessage(body, 'Could not check the current session.'))
        setUser(authUserFromPayload(body.user))
      } catch {
        setUser(GUEST_USER)
      } finally {
        setChecking(false)
      }
    }
    loadSession()
  }, [])

  function openAuth(nextMode = 'signin', nextContext = 'public') {
    setContext(nextContext)
    setMode(nextContext === 'admin' ? 'signin' : nextMode)
    setError('')
    setShowLogin(true)
  }

  function closeAuth() {
    setShowLogin(false)
    setError('')
  }

  async function login(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    onError('')
    try {
      const response = await apiFetch('/auth/login/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials),
      })
      const body = await readApiJson(response)
      if (!response.ok) throw new Error(apiErrorMessage(body, 'Could not sign in.'))
      const signedInUser = authUserFromPayload(body.user)
      if (!signedInUser.is_authenticated) throw new Error('The server did not create a signed-in session.')
      if (context === 'admin' && signedInUser.role !== 'admin') {
        await apiFetch('/auth/logout/', { method: 'POST' })
        setUser(GUEST_USER)
        throw new Error('This account does not have administrator access.')
      }
      setUser(signedInUser)
      setCredentials({ identifier: '', password: '' })
      setShowLogin(false)
      onNotice(`Signed in as ${signedInUser.email || signedInUser.username}.`)
      if (signedInUser.role === 'admin') navigateTo('admin')
      else navigateTo(signedInUser.preferences_completed ? 'recommendations' : 'preferences')
    } catch (requestError) {
      setError(requestErrorMessage(requestError, 'Could not sign in.'))
    } finally {
      setLoading(false)
    }
  }

  async function signup(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    onError('')
    try {
      const response = await apiFetch('/auth/signup/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(signupDetails),
      })
      const body = await readApiJson(response)
      if (!response.ok) throw new Error(apiErrorMessage(body, 'Could not create your account.'))
      const signedInUser = authUserFromPayload(body.user)
      setUser(signedInUser)
      setSignupDetails(EMPTY_SIGNUP)
      setShowLogin(false)
      onNotice('Your tourist account is ready. Add your travel preferences to personalize recommendations.')
      navigateTo('preferences')
    } catch (requestError) {
      setError(requestErrorMessage(requestError, 'Could not create your account.'))
    } finally {
      setLoading(false)
    }
  }

  async function logout({ stayOnAdmin = false } = {}) {
    try {
      const response = await apiFetch('/auth/logout/', { method: 'POST' })
      const body = await readApiJson(response)
      if (!response.ok) throw new Error(apiErrorMessage(body, 'Could not sign out.'))
      setUser(authUserFromPayload(body.user))
      navigateTo(stayOnAdmin ? 'admin' : 'home')
      onNotice('You have been signed out.')
    } catch (requestError) {
      const message = requestErrorMessage(requestError, 'Could not sign out. Please try again.')
      onError(message)
      onModal({ title: 'Sign-out failed', message, tone: 'error' })
    }
  }

  return {
    user,
    setUser,
    checking,
    showLogin,
    mode,
    setMode,
    context,
    credentials,
    setCredentials,
    signupDetails,
    setSignupDetails,
    loading,
    error,
    setError,
    openAuth,
    closeAuth,
    login,
    signup,
    logout,
  }
}
