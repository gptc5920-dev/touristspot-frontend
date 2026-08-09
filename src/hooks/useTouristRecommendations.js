import { useCallback, useEffect, useState } from 'react'
import { readApiJson } from '../api'
import { EMPTY_TOURIST_PREFERENCES } from '../config/preferences'
import { apiErrorMessage, authUserFromPayload, requestErrorMessage } from '../lib/app'

function validatePreferences(preferences) {
  const errors = {}
  if (!preferences.preferred_categories.length) errors.preferred_categories = 'Choose at least one tourism category.'
  if (!preferences.selected_interests.length) errors.selected_interests = 'Choose at least one travel interest.'
  const minimumBudget = Number(preferences.budget_min)
  const maximumBudget = Number(preferences.budget_max)
  if (preferences.budget_min === '' || !Number.isFinite(minimumBudget) || minimumBudget < 0) errors.budget_min = 'Enter a valid minimum budget.'
  if (preferences.budget_max === '' || !Number.isFinite(maximumBudget) || maximumBudget < 0) errors.budget_max = 'Enter a valid maximum budget.'
  if (!errors.budget_min && !errors.budget_max && minimumBudget > maximumBudget) errors.budget_max = 'Maximum budget must be at least the minimum budget.'
  if (!preferences.available_start_time) errors.available_start_time = 'Choose a start time.'
  if (!preferences.available_end_time) errors.available_end_time = 'Choose an end time.'
  if (preferences.available_start_time && preferences.available_end_time && preferences.available_start_time >= preferences.available_end_time) errors.available_end_time = 'End time must be later than start time.'
  if (!preferences.travel_pace) errors.travel_pace = 'Choose a travel pace.'
  if (!preferences.transportation_preference) errors.transportation_preference = 'Choose a transportation preference.'
  if (!preferences.traveler_type) errors.traveler_type = 'Choose who you travel with.'
  if (!preferences.preferred_language) errors.preferred_language = 'Choose a language.'
  if ((preferences.latitude === '') !== (preferences.longitude === '')) errors.coordinates = 'Choose both latitude and longitude or clear the location pin.'
  return errors
}

function popularFallback(destinations) {
  return [...destinations]
    .sort((first, second) => Number(second.average_rating || 0) - Number(first.average_rating || 0) || Number(second.review_count || 0) - Number(first.review_count || 0))
    .map((destination) => ({
      ...destination,
      destination_id: destination.id,
      destination_name: destination.name,
      match_score: null,
      match_tier: 'Popular Destinations',
      recommendation_reason: 'Popular with travelers and verified by the local tourism office.',
      estimated_travel_time: 'Estimate unavailable',
      accessibility_information: destination.accessibility || 'Information unavailable',
    }))
}

export default function useTouristRecommendations({ apiFetch, user, onUserChange, navigateTo, verifiedDestinations }) {
  const [preferences, setPreferences] = useState(EMPTY_TOURIST_PREFERENCES)
  const [recommendationData, setRecommendationData] = useState(null)
  const [loadingPreferences, setLoadingPreferences] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    if (!user.is_authenticated || user.role !== 'tourist') {
      setLoadingPreferences(false)
      return () => { active = false }
    }
    async function loadPreferences() {
      setLoadingPreferences(true)
      try {
        const response = await apiFetch('/tourist/preferences/')
        const body = await readApiJson(response)
        if (!response.ok) throw new Error(apiErrorMessage(body, 'Could not load your travel preferences.'))
        if (active) setPreferences({ ...EMPTY_TOURIST_PREFERENCES, ...body.preferences })
      } catch (requestError) {
        if (active) setError(requestErrorMessage(requestError, 'Could not load your travel preferences.'))
      } finally {
        if (active) setLoadingPreferences(false)
      }
    }
    loadPreferences()
    return () => { active = false }
  }, [apiFetch, user.is_authenticated, user.role, user.username])

  const generateRecommendations = useCallback(async ({ method = 'GET' } = {}) => {
    setGenerating(true)
    setError('')
    try {
      const path = method === 'POST' ? '/tourist/recommendations/generate/' : '/tourist/recommendations/'
      const response = await apiFetch(path, { method })
      const body = await readApiJson(response)
      if (!response.ok) throw new Error(apiErrorMessage(body, 'Could not generate personalized recommendations.'))
      setRecommendationData(body)
      return true
    } catch (requestError) {
      const message = requestErrorMessage(requestError, 'Personalized recommendations are temporarily unavailable. Popular tourist destinations are shown instead.')
      setError(message)
      setRecommendationData({
        success: true,
        personalized: false,
        fallback: true,
        message: 'Personalized recommendations are temporarily unavailable. Popular tourist destinations are shown instead.',
        data_warning: '',
        recommendations: popularFallback(verifiedDestinations),
      })
      return true
    } finally {
      setGenerating(false)
    }
  }, [apiFetch, verifiedDestinations])

  function updatePreference(field, value) {
    setPreferences((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined, coordinates: undefined }))
    setError('')
  }

  function togglePreferenceList(field, value) {
    setPreferences((current) => ({
      ...current,
      [field]: current[field].includes(value)
        ? current[field].filter((item) => item !== value)
        : [...current[field], value],
    }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
    setError('')
  }

  async function savePreferences(event) {
    event?.preventDefault()
    if (saving || generating) return
    const validationErrors = validatePreferences(preferences)
    if (Object.keys(validationErrors).length) {
      setFieldErrors(validationErrors)
      setError('Complete the required preferences before continuing.')
      return
    }
    setSaving(true)
    setFieldErrors({})
    setError('')
    try {
      const response = await apiFetch('/tourist/preferences/', {
        method: preferences.onboarding_completed ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(Object.entries(preferences).filter(([field]) => !['onboarding_completed', 'created_at', 'updated_at'].includes(field)))),
      })
      const body = await readApiJson(response)
      if (!response.ok) {
        setFieldErrors(Object.fromEntries(Object.entries(body.errors || {}).map(([field, messages]) => [field, Array.isArray(messages) ? messages[0] : messages])))
        throw new Error(apiErrorMessage(body, 'Could not save your travel preferences.'))
      }
      setPreferences({ ...EMPTY_TOURIST_PREFERENCES, ...body.preferences })
      if (body.user) onUserChange(authUserFromPayload(body.user))
      const generated = await generateRecommendations({ method: 'POST' })
      if (generated) navigateTo('recommendations')
    } catch (requestError) {
      setError(requestErrorMessage(requestError, 'Could not save your travel preferences. Your selections have been kept.'))
    } finally {
      setSaving(false)
    }
  }

  return {
    preferences,
    recommendationData,
    loadingPreferences,
    generating,
    saving,
    fieldErrors,
    error,
    setError,
    updatePreference,
    togglePreferenceList,
    savePreferences,
    generateRecommendations,
  }
}
