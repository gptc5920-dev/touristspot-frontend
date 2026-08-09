export const EMPTY_TOURIST_PREFERENCES = {
  selected_interests: [],
  preferred_categories: [],
  budget_min: '0',
  budget_max: '1500',
  available_start_time: '08:00',
  available_end_time: '17:00',
  travel_pace: 'balanced',
  transportation_preference: 'public',
  traveler_type: 'solo',
  accessibility_requirements: '',
  preferred_language: 'English',
  starting_location: '',
  latitude: '',
  longitude: '',
  onboarding_completed: false,
}

export const TRANSPORTATION_OPTIONS = [
  ['public', 'Public transit'],
  ['motorcycle', 'Motorcycle taxi'],
  ['private', 'Private vehicle'],
  ['walking', 'Walking'],
]

export const TRAVELER_OPTIONS = [
  ['solo', 'Solo traveler'],
  ['couple', 'Couple'],
  ['family', 'Family'],
  ['friends', 'Friend group'],
  ['senior', 'Senior traveler'],
]

export const PACE_OPTIONS = [
  ['relaxed', 'Relaxed', 'Fewer stops with more time at each place'],
  ['balanced', 'Balanced', 'A comfortable mix of activities and rest'],
  ['fast', 'Fast-paced', 'Fit more destinations into your available time'],
]
