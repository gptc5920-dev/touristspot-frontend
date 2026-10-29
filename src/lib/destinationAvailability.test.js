import assert from 'node:assert/strict'
import test from 'node:test'
import { destinationUnavailableReason, preferredDestinationErrors } from './destinationAvailability.js'

const destination = {
  id: 1, name: 'View point', is_active: true, is_verified: true,
  availability_start: '2026-11-01', availability_end: '2026-11-13',
  operating_days: ['Saturday', 'Sunday'],
}

test('a selected place outside its date range explains how to fix the selection', () => {
  const errors = preferredDestinationErrors({ travel_date: '2026-11-14', preferred_destinations: [1] }, [destination])
  assert.equal(errors.length, 1)
  assert.match(errors[0], /View point: Availability ended on/)
  assert.match(errors[0], /Change your travel date or deselect this place/)
})

test('availability includes both boundaries and respects the selected weekday', () => {
  const weekend = { ...destination, availability_end: '2026-11-14' }
  assert.equal(destinationUnavailableReason(weekend, '2026-11-01'), '')
  assert.equal(destinationUnavailableReason(weekend, '2026-11-14'), '')
  assert.match(destinationUnavailableReason(weekend, '2026-11-02'), /Closed on Monday/)
  assert.match(destinationUnavailableReason(weekend, '2026-10-31'), /Available from/)
})

test('changing the date or removing the place resolves the selection error', () => {
  assert.deepEqual(preferredDestinationErrors({ travel_date: '2026-11-08', preferred_destinations: [1] }, [destination]), [])
  assert.deepEqual(preferredDestinationErrors({ travel_date: '2026-11-14', preferred_destinations: [] }, [destination]), [])
})

test('unlimited availability dates still respect operating days', () => {
  const unlimited = { ...destination, availability_start: '', availability_end: '' }
  assert.equal(destinationUnavailableReason(unlimited, '2026-11-14'), '')
  assert.match(destinationUnavailableReason(unlimited, '2026-11-13'), /Closed on Friday/)
})

test('inactive and deleted places cannot pass preferred destination validation', () => {
  assert.match(destinationUnavailableReason({ ...destination, is_active: false }, '2026-11-08'), /active and verified/)
  assert.match(preferredDestinationErrors({ travel_date: '2026-11-08', preferred_destinations: [99] }, [destination])[0], /no longer available/)
})
