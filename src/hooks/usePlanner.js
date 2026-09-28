import { useEffect, useMemo, useState } from 'react'
import { readApiJson, resolveMediaUrl } from '../api'
import { INITIAL_PLANNER_FORM } from '../config/travel'
import { apiErrorMessage, requestErrorMessage } from '../lib/app'

export default function usePlanner({
  apiFetch,
  navigateTo,
  onError,
  onModal,
  onNotice,
  onRequireAuthentication,
}) {
  const [form, setForm] = useState(INITIAL_PLANNER_FORM)
  const [destinations, setDestinations] = useState([])
  const [itinerary, setItinerary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [focusedStop, setFocusedStop] = useState(null)
  const [showMap, setShowMap] = useState(false)
  const [coordinates, setCoordinates] = useState({ latitude: '', longitude: '' })
  const [openSection, setOpenSection] = useState('when')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    let cancelled = false
    async function loadDestinations() {
      try {
        const response = await apiFetch('/destinations/')
        if (!response.ok) throw new Error('Destination data is unavailable.')
        const body = await readApiJson(response)
        if (!cancelled) setDestinations((body.destinations || []).map((destination) => ({
          ...destination, image_url: resolveMediaUrl(destination.image_url),
        })))
      } catch (requestError) {
        if (!cancelled) onError(requestErrorMessage(requestError, 'Could not load verified destinations.'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadDestinations()
    return () => { cancelled = true }
  }, [apiFetch, onError])

  const selectedDestinationIds = useMemo(
    () => new Set(form.preferred_destinations),
    [form.preferred_destinations],
  )

  function toggleSection(section) {
    setOpenSection((current) => current === section ? '' : section)
  }

  function startPlanning(destinationId = null) {
    if (destinationId) {
      setForm((current) => ({
        ...current,
        preferred_destinations: [destinationId, ...current.preferred_destinations.filter((id) => id !== destinationId)],
        excluded_destinations: current.excluded_destinations.filter((id) => id !== destinationId),
      }))
      setOpenSection('places')
    } else {
      setOpenSection('when')
    }
    navigateTo('planner')
  }

  function updateForm(field, value) {
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
    setForm((current) => ({ ...current, [field]: value }))
  }

  function toggleInterest(value) {
    setForm((current) => ({
      ...current,
      interests: current.interests.includes(value)
        ? current.interests.filter((item) => item !== value)
        : [...current.interests, value],
    }))
  }

  function toggleDestination(id) {
    setForm((current) => ({
      ...current,
      preferred_destinations: current.preferred_destinations.includes(id)
        ? current.preferred_destinations.filter((item) => item !== id)
        : [...current.preferred_destinations, id],
      excluded_destinations: current.excluded_destinations.filter((item) => item !== id),
    }))
  }

  function validate(preferences) {
    if (!destinations.length) return 'No verified destinations are available yet. A tourism administrator must add and verify destination records first.'
    if (!preferences.travel_date || !preferences.starting_location.trim()) return 'Enter both a travel date and starting location before generating an itinerary.'
    if (!preferences.start_time || !preferences.end_time) return 'Select a preferred start and return time.'
    if (!preferences.interests.length) return 'Select at least one travel interest so recommendations can be ranked.'
    if (preferences.budget && Number(preferences.budget) < 0) return 'Your estimated budget cannot be a negative amount.'
    return ''
  }

  async function createItinerary(preferences = form) {
    const validationError = validate(preferences)
    if (validationError) {
      onModal({ title: 'Review your trip details', message: validationError, tone: 'warning' })
      return
    }
    setGenerating(true)
    onError('')
    setFieldErrors({})
    try {
      const response = await apiFetch('/itineraries/generate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      })
      const body = await readApiJson(response)
      if (!response.ok) {
        setFieldErrors(body.errors || {})
        throw new Error(body.message || body.error || 'The system could not generate your itinerary.')
      }
      setItinerary(body.itinerary)
      setFocusedStop(body.itinerary.map?.[0]?.id || null)
    } catch (requestError) {
      const message = requestErrorMessage(requestError, 'The system could not generate your itinerary.')
      onError(message)
      onModal({ title: 'Itinerary unavailable', message, tone: 'error' })
    } finally {
      setGenerating(false)
    }
  }

  function regenerate() {
    createItinerary(form)
  }

  function removeStop(id) {
    const nextForm = {
      ...form,
      preferred_destinations: form.preferred_destinations.filter((item) => item !== id),
      excluded_destinations: [...new Set([...form.excluded_destinations, id])],
    }
    setForm(nextForm)
    createItinerary(nextForm)
  }

  function addAlternative(id) {
    const nextForm = {
      ...form,
      preferred_destinations: [id, ...form.preferred_destinations.filter((item) => item !== id)],
      excluded_destinations: form.excluded_destinations.filter((item) => item !== id),
    }
    setForm(nextForm)
    createItinerary(nextForm)
  }

  function moveEarlier(id) {
    const route = itinerary?.map?.map((stop) => stop.id) || []
    const index = route.indexOf(id)
    if (index < 1) return
    const reordered = [...route]
    ;[reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]]
    const nextForm = { ...form, preferred_destinations: reordered }
    setForm(nextForm)
    createItinerary(nextForm)
  }

  async function saveItinerary() {
    if (!itinerary) return
    try {
      const response = await apiFetch('/itineraries/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: form, itinerary }),
      })
      const body = await readApiJson(response)
      if (!response.ok) {
        if (response.status === 401) {
          onRequireAuthentication('Sign in to save this itinerary to your account.')
          return
        }
        throw new Error(apiErrorMessage(body, 'Could not save itinerary.'))
      }
      onNotice('Itinerary saved to the local travel desk.')
    } catch (requestError) {
      const message = requestErrorMessage(requestError, 'Could not save itinerary.')
      onError(message)
      onModal({ title: 'Could not save itinerary', message, tone: 'error' })
    }
  }

  function downloadItinerary() {
    if (!itinerary) return
    const blob = new Blob([JSON.stringify({ preferences: form, itinerary }, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'travel-osmena-itinerary.json'
    link.click()
    URL.revokeObjectURL(link.href)
    onNotice('Itinerary download prepared.')
  }

  async function shareItinerary() {
    const shareData = { title: itinerary?.title || 'Travel Osmena itinerary', text: 'My personalized Travel Osmena itinerary.' }
    try {
      if (navigator.share) await navigator.share(shareData)
      else await navigator.clipboard.writeText(`${shareData.title}: ${window.location.href}`)
      onNotice('Itinerary link is ready to share.')
    } catch {
      // Cancelling the operating system share sheet is not an application error.
    }
  }

  function applyProfilePreferences(profile) {
    setForm((current) => ({
      ...current,
      starting_location: profile.home_location || current.starting_location,
      interests: profile.interests || [],
      pace: profile.preferred_pace || 'balanced',
      transportation: profile.preferred_transportation || 'public',
      language: profile.preferred_language || 'English',
      accessibility: profile.accessibility_needs || '',
      budget: profile.typical_budget === '' || profile.typical_budget == null ? '' : String(profile.typical_budget),
    }))
    setOpenSection('when')
    navigateTo('planner')
    onNotice('Your saved travel preferences are ready in the planner.')
  }

  function addRecommendationToPlanner(preferences, destinationId) {
    setForm((current) => ({
      ...current,
      starting_location: preferences.starting_location || current.starting_location,
      start_time: preferences.available_start_time || current.start_time,
      end_time: preferences.available_end_time || current.end_time,
      interests: preferences.selected_interests || current.interests,
      pace: preferences.travel_pace || current.pace,
      transportation: preferences.transportation_preference || current.transportation,
      companion: preferences.traveler_type || current.companion,
      language: preferences.preferred_language || current.language,
      accessibility: preferences.accessibility_requirements || '',
      budget: preferences.budget_max === '' || preferences.budget_max == null ? current.budget : String(preferences.budget_max),
      preferred_destinations: [destinationId, ...current.preferred_destinations.filter((id) => id !== destinationId)],
      excluded_destinations: current.excluded_destinations.filter((id) => id !== destinationId),
    }))
    setCoordinates({
      latitude: preferences.latitude === '' || preferences.latitude == null ? '' : String(preferences.latitude),
      longitude: preferences.longitude === '' || preferences.longitude == null ? '' : String(preferences.longitude),
    })
    setOpenSection('places')
    navigateTo('planner')
    onNotice('Recommended destination added. Review your trip details, then build the itinerary.')
  }

  return {
    form,
    destinations,
    itinerary,
    loading,
    generating,
    focusedStop,
    setFocusedStop,
    showMap,
    setShowMap,
    coordinates,
    setCoordinates,
    openSection,
    fieldErrors,
    selectedDestinationIds,
    toggleSection,
    startPlanning,
    updateForm,
    toggleInterest,
    toggleDestination,
    regenerate,
    removeStop,
    addAlternative,
    moveEarlier,
    saveItinerary,
    downloadItinerary,
    shareItinerary,
    applyProfilePreferences,
    addRecommendationToPlanner,
  }
}
