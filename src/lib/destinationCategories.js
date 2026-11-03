const REMOVED_CATEGORY = 'Beach & coastal'

export function destinationCategories(destination) {
  const values = Array.isArray(destination.categories) && destination.categories.length
    ? destination.categories
    : [destination.category]
  return [...new Set(values.filter((value) => typeof value === 'string' && value && value !== REMOVED_CATEGORY))]
}

export function destinationCategoryLabel(destination) {
  return destinationCategories(destination).join(' · ')
}
