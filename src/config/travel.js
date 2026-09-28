export const INTERESTS = [
  ['nature', 'Nature', 'Leaf'],
  ['history', 'History', 'Landmark'],
  ['food', 'Food', 'Utensils'],
  ['adventure', 'Adventure', 'Mountain'],
  ['religious', 'Faith', 'Church'],
  ['water', 'Water', 'Waves'],
  ['family', 'Family', 'Heart'],
  ['photography', 'Photos', 'Camera'],
  ['shopping', 'Local finds', 'ShoppingBag'],
  ['relaxation', 'Leisure', 'Sun'],
]

export const DESTINATION_CATEGORIES = [
  'Nature & eco-tourism', 'Beach & coastal', 'Waterfall & river', 'Mountain & viewpoint',
  'Historical site', 'Cultural heritage', 'Religious site', 'Food & dining',
  'Adventure & recreation', 'Park & family attraction', 'Shopping & local products', 'Accommodation',
]

export const OPERATING_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
export const TRANSPORT_SUGGESTIONS = ['Public transport', 'Private vehicle', 'Motorcycle taxi', 'Walking', 'Boat transfer']
export const COMPANION_SUGGESTIONS = ['Solo travelers', 'Couples', 'Families', 'Friend groups', 'Senior travelers', 'Children']
export const ACCESSIBILITY_SUGGESTIONS = ['Wheelchair accessible', 'Accessible restroom', 'Senior-friendly', 'Child-friendly', 'Rest areas available']
export const SAFETY_SUGGESTIONS = ['Bring drinking water', 'Wear suitable footwear', 'Observe weather advisories', 'Children need supervision']

export const CATEGORY_ACTIVITY_SUGGESTIONS = {
  'Nature & eco-tourism': ['Nature walk', 'Bird watching', 'Photography'],
  'Beach & coastal': ['Swimming', 'Sunset viewing', 'Picnic'],
  'Waterfall & river': ['Swimming', 'Nature walk', 'Photography'],
  'Mountain & viewpoint': ['Hiking', 'Sightseeing', 'Photography'],
  'Historical site': ['Guided tour', 'Museum visit', 'Photography'],
  'Cultural heritage': ['Cultural tour', 'Local crafts', 'Community visit'],
  'Religious site': ['Prayer', 'Heritage tour', 'Quiet reflection'],
  'Food & dining': ['Local dining', 'Food tasting', 'Market visit'],
  'Adventure & recreation': ['Outdoor activity', 'Hiking', 'Group activity'],
  'Park & family attraction': ['Picnic', 'Children activities', 'Sightseeing'],
  'Shopping & local products': ['Souvenir shopping', 'Local crafts', 'Market visit'],
  Accommodation: ['Overnight stay', 'Dining', 'Relaxation'],
}

export const GOOGLE_MAP_URL = 'https://www.google.com/maps/place/Sergio+Osmena+Sr.,+Zamboanga+del+Norte/@8.2977209,123.3056737,12z/data=!3m1!4b1!4m6!3m5!1s0x325461ec27145fa3:0x2fc627c16640faa1!8m2!3d8.3000946!4d123.5059025!16zL20vMDZudG5w?entry=ttu&g_ep=EgoyMDI2MDgwMi4wIKXMDSoASAFQAw%3D%3D'
export const GOOGLE_MAP_EMBED_URL = 'https://www.google.com/maps?q=8.3000946,123.5059025&z=12&output=embed'

export const INITIAL_PLANNER_FORM = {
  travel_date: new Date().toISOString().slice(0, 10),
  starting_location: '',
  start_time: '08:00',
  end_time: '17:00',
  travel_days: '1',
  travelers: '2',
  companion: 'couple',
  interests: [],
  preferred_destinations: [],
  excluded_destinations: [],
  budget: '',
  transportation: 'public',
  pace: 'balanced',
  accessibility: '',
  language: 'English',
}

export const EMPTY_DESTINATION = {
  name: '', description: '', category: '', area: '', address: '', latitude: '', longitude: '',
  province_code: '', municipality_code: '', barangay_code: '',
  opening_time: '08:00', closing_time: '17:00', visit_minutes: '60', entrance_fee: '0',
  interests: [], operating_days: [], availability_start: '', availability_end: '', activities: [],
  accessibility: '', contact_information: '', transportation_options: [], safety_reminders: [],
  recommended_companions: [], advisory: '', image_url: '', saved_image_url: '', has_uploaded_image: false,
  is_active: true, is_verified: false,
}

export const EMPTY_SIGNUP = { full_name: '', username: '', email: '', password: '', password_confirm: '' }
export const GUEST_USER = { is_authenticated: false, role: 'guest', username: '', email: '', display_name: '', preferences_completed: false }

export const ROUTES = {
  admin: '/admin-dashboard/',
  home: '/',
  discover: '/discover/',
  planner: '/planner/',
  profile: '/profile/',
  preferences: '/tourist/preferences',
  recommendations: '/tourist/recommendations',
}
