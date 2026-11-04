import assert from 'node:assert/strict'
import test from 'node:test'
import { readDiscoverFilters, writeDiscoverFilters } from './discoverFilters.js'
import { destinationCategories, destinationCategoryLabel } from './destinationCategories.js'
import { suggestedDestinationActivities } from '../config/travel.js'

test('multiple category selections survive a URL round trip alongside other filters', () => {
  const filters = {
    searchTerm: 'Local sights', categories: ['Nature & eco-tourism', 'Waterfall & river'],
    freeOnly: true, savedOnly: true, sortBy: 'name',
  }
  const path = writeDiscoverFilters(new URL('https://travel.test/discover/?other=keep#places'), filters)
  const url = new URL(path, 'https://travel.test')
  assert.deepEqual(readDiscoverFilters(url.search), filters)
  assert.equal(url.searchParams.get('other'), 'keep')
  assert.equal(url.hash, '#places')
  assert.deepEqual(readDiscoverFilters(new URL(writeDiscoverFilters(url, { ...filters, categories: [] }), url).search).categories, [])
})

test('old single-category links work, duplicate selections and removed categories are ignored', () => {
  assert.deepEqual(readDiscoverFilters('?category=Historical+site').categories, ['Historical site'])
  assert.deepEqual(readDiscoverFilters('?category=Historical+site&category=Historical+site&category=Beach+%26+coastal').categories, ['Historical site'])
})

test('destinations expose all categories and support older single-category responses', () => {
  const destination = { category: 'Nature & eco-tourism', categories: ['Nature & eco-tourism', 'Waterfall & river'] }
  assert.deepEqual(destinationCategories(destination), ['Nature & eco-tourism', 'Waterfall & river'])
  assert.equal(destinationCategoryLabel(destination), 'Nature & eco-tourism · Waterfall & river')
  assert.deepEqual(destinationCategories({ category: 'Historical site' }), ['Historical site'])
  assert.deepEqual(destinationCategories({ category: 'Beach & coastal' }), [])
})

test('pool, mountain and food and accommodation tags retain their filter values', () => {
  const categories = ['Pool', 'Mountain & viewpoint', 'Food & Accommodation']
  const destination = { categories }
  assert.deepEqual(destinationCategories(destination), categories)
  assert.equal(destinationCategoryLabel(destination), 'Pool · Mountain View · Food & Accommodation')
  const filters = { ...readDiscoverFilters(''), categories }
  const path = writeDiscoverFilters(new URL('https://travel.test/discover/'), filters)
  assert.deepEqual(readDiscoverFilters(new URL(path, 'https://travel.test').search).categories, categories)
})

test('changing categories keeps selected activities visible and camping available', () => {
  const selected = ['Swimming', 'Camping']
  const suggestions = suggestedDestinationActivities(['Historical site'], selected)
  assert.ok(suggestions.includes('Swimming'))
  assert.ok(suggestions.includes('Camping'))
  assert.equal(suggestions.filter((activity) => activity === 'Camping').length, 1)
  assert.ok(suggestedDestinationActivities([]).includes('Camping'))
})
