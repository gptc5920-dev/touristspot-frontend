export default function PageHeading({ eyebrow, title, description, actions, className = '' }) {
  return <header className={`page-heading ${className}`}>
    <div>
      {eyebrow && <span className="page-eyebrow">{eyebrow}</span>}
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
    {actions && <div className="page-heading-actions">{actions}</div>}
  </header>
}
