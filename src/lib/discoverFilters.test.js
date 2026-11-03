import assert from 'node:assert/strict'
import test from 'node:test'
import { readDiscoverFilters, writeDiscoverFilters } from './discoverFilters.js'
import { destinationCategories, destinationCategoryLabel } from './destinationCategories.js'

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
