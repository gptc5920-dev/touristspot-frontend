const dateFormatter = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium' })

function formatDate(value) {
  return dateFormatter.format(new Date(`${value}T12:00:00`))
}

// Use the selected calendar date in local time, without converting it to UTC.
export function destinationUnavailableReason(destination, travelDate) {
  if (destination.is_active === false || destination.is_verified === false) {
    return 'This place is not currently active and verified.'
  }
  if (!travelDate || !Number.isFinite(new Date(`${travelDate}T12:00:00`).getTime())) return ''
  if (destination.availability_start && travelDate < destination.availability_start) {
    return `Available from ${formatDate(destination.availability_start)}.`
  }
  if (destination.availability_end && travelDate > destination.availability_end) {
    return `Availability ended on ${formatDate(destination.availability_end)}.`
  }
  const day = new Date(`${travelDate}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long' })
  if (Array.isArray(destination.operating_days) && !destination.operating_days.includes(day)) {
    return destination.operating_days.length
      ? `Closed on ${day}. Open on ${destination.operating_days.join(', ')}.`
      : 'Operating days are not listed.'
  }
  return ''
}

export function preferredDestinationErrors(preferences, destinations) {
  return preferences.preferred_destinations.flatMap((id) => {
    const destination = destinations.find((item) => item.id === id)
    const reason = destination ? destinationUnavailableReason(destination, preferences.travel_date) : 'This place is no longer available.'
    return reason ? [`${destination?.name || 'Selected destination'}: ${reason} Change your travel date or deselect this place.`] : []
  })
}
