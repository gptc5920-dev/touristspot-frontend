import { destinationCategories, destinationCategoryName } from '../../lib/destinationCategories'

export default function DestinationCategoryTags({ destination, className = '' }) {
  return <div className={`destination-category-tags ${className}`} aria-label="Destination categories">
    {destinationCategories(destination).map((category) => <span className="destination-category-badge" key={category}>{destinationCategoryName(category)}</span>)}
  </div>
}
