import { useMemo, useState } from 'react'
import {
  Database, MapPin, PencilLine, Plus, RefreshCw, Search, ShieldCheck, Star,
  Trash2, UserRound, Users,
} from '../../fontawesome-icons'
import { peso } from '../../lib/app'

export function UsersTable({ users: userRecords, loading }) {
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('all')
  const [status, setStatus] = useState('all')
  const filteredUsers = useMemo(() => {
    const searchTerm = query.trim().toLowerCase()
    return userRecords.filter((user) => {
      const matchesSearch = !searchTerm || [user.display_name, user.username, user.email, user.home_location]
        .some((value) => String(value || '').toLowerCase().includes(searchTerm))
      return matchesSearch
        && (role === 'all' || user.role === role)
        && (status === 'all' || (status === 'active' ? user.is_active : !user.is_active))
    })
  }, [query, role, status, userRecords])

  const formatAccountDate = (value) => value
    ? new Date(value).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Never'

  function resetFilters() {
    setQuery('')
    setRole('all')
    setStatus('all')
  }

  if (loading) return <section className="admin-table-card"><div className="admin-table-loading"><RefreshCw className="spin" size={20} /> Loading users table</div></section>

  return <section className="admin-table-card">
    <header className="admin-table-heading">
      <div><span className="eyebrow"><Users size={14} /> Account directory</span><h2>All registered users</h2><p>Monitor account roles, saved travel preferences, and contribution activity.</p></div>
      <span className="admin-table-count">{filteredUsers.length} of {userRecords.length}</span>
    </header>
    <div className="admin-table-toolbar users-table-toolbar">
      <label className="admin-table-search"><Search size={16} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, username, email, or location" aria-label="Search users" /></label>
      <label><span>Role</span><select value={role} onChange={(event) => setRole(event.target.value)}><option value="all">All roles</option><option value="tourist">Tourists</option><option value="admin">Administrators</option></select></label>
      <label><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
    </div>
    {filteredUsers.length ? <>
      <div className="admin-table-scroll" role="region" aria-label="Registered users table" tabIndex="0">
        <table className="destination-data-table users-data-table">
          <caption>Registered Travel Osmena users</caption>
          <thead><tr><th scope="col">User</th><th scope="col">Role</th><th scope="col">Travel preferences</th><th scope="col">Saved trips</th><th scope="col">Reviews</th><th scope="col">Last sign-in</th><th scope="col">Joined</th><th scope="col">Status</th></tr></thead>
          <tbody>{filteredUsers.map((user) => <tr key={user.id}>
            <td><div className="table-user-cell"><span>{(user.display_name || user.username || 'U').charAt(0).toUpperCase()}</span><div><strong>{user.display_name || user.username}</strong><small>@{user.username}</small><small title={user.email}>{user.email || 'No email provided'}</small></div></div></td>
            <td><span className={`table-role ${user.role}`}>{user.role === 'admin' ? <ShieldCheck size={13} /> : <UserRound size={13} />}{user.role === 'admin' ? 'Administrator' : 'Tourist'}</span></td>
            <td>{user.role === 'tourist' ? <div className="table-preferences"><strong>{user.interests?.length ? `${user.interests.length} interests` : 'No interests saved'}</strong><small>{[user.preferred_pace, user.preferred_transportation, user.preferred_language].filter(Boolean).join(' · ') || 'Preferences not completed'}</small>{user.home_location && <small><MapPin size={11} /> {user.home_location}</small>}</div> : <span className="table-no-rating">Not applicable</span>}</td>
            <td><span className="table-user-metric"><strong>{user.saved_itinerary_count}</strong><small>itineraries</small></span></td>
            <td><span className="table-user-metric"><strong>{user.review_count}</strong><small>contributions</small></span></td>
            <td><span className="table-date">{formatAccountDate(user.last_login)}</span></td>
            <td><span className="table-date">{formatAccountDate(user.date_joined)}</span></td>
            <td><span className={`table-status ${user.is_active ? 'ready' : 'inactive'}`}><i />{user.is_active ? 'Active' : 'Inactive'}</span></td>
          </tr>)}</tbody>
        </table>
      </div>
      <footer className="admin-table-footer"><span>Showing {filteredUsers.length} matching account{filteredUsers.length === 1 ? '' : 's'}</span><small>Profile preferences remain private to authorized administrators.</small></footer>
    </> : <div className="admin-table-empty filtered"><Search size={26} /><strong>No users match these filters</strong><p>Try another search, role, or account status.</p><button type="button" className="admin-secondary-button" onClick={resetFilters}>Clear filters</button></div>}
  </section>
}

export function DestinationTable({ records, loading, onEdit, onDelete, onAdd }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [category, setCategory] = useState('all')
  const categories = useMemo(() => [...new Set(records.map((item) => item.category).filter(Boolean))].sort(), [records])
  const filteredRecords = useMemo(() => {
    const searchTerm = query.trim().toLowerCase()
    return records.filter((destination) => {
      const destinationStatus = !destination.is_active ? 'inactive' : destination.is_verified ? 'ready' : 'pending'
      const matchesSearch = !searchTerm || [destination.name, destination.category, destination.area, destination.address]
        .some((value) => String(value || '').toLowerCase().includes(searchTerm))
      return matchesSearch
        && (status === 'all' || status === destinationStatus)
        && (category === 'all' || category === destination.category)
    })
  }, [category, query, records, status])

  function resetFilters() {
    setQuery('')
    setStatus('all')
    setCategory('all')
  }

  if (loading) return <section className="admin-table-card"><div className="admin-table-loading"><RefreshCw className="spin" size={20} /> Loading destination table</div></section>
  if (!records.length) return <section className="admin-table-card"><div className="admin-table-empty"><Database size={28} /><strong>No destination records yet</strong><p>Add the first tourism destination to start the table.</p><button type="button" className="admin-primary-button" onClick={onAdd}><Plus size={16} /> Add destination</button></div></section>

  return <section className="admin-table-card">
    <header className="admin-table-heading">
      <div><span className="eyebrow"><Database size={14} /> Destination database</span><h2>All destinations</h2><p>Review publishing status, entrance fees, opening hours, and traveler ratings.</p></div>
      <span className="admin-table-count">{filteredRecords.length} of {records.length}</span>
    </header>
    <div className="admin-table-toolbar">
      <label className="admin-table-search"><Search size={16} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, area, category, or address" aria-label="Search destinations" /></label>
      <label><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option><option value="ready">Verified</option><option value="pending">Pending verification</option><option value="inactive">Unavailable</option></select></label>
      <label><span>Category</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
    </div>
    {filteredRecords.length ? <>
      <div className="admin-table-scroll" role="region" aria-label="Tourism destinations table" tabIndex="0">
        <table className="destination-data-table">
          <caption>Tourism destination records</caption>
          <thead><tr><th scope="col">Destination</th><th scope="col">Category</th><th scope="col">Hours</th><th scope="col">Entrance fee</th><th scope="col">Traveler rating</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>{filteredRecords.map((destination) => {
            const statusKey = !destination.is_active ? 'inactive' : destination.is_verified ? 'ready' : 'pending'
            const statusLabel = statusKey === 'ready' ? 'Verified' : statusKey === 'pending' ? 'Pending' : 'Unavailable'
            return <tr key={destination.id}>
              <td><div className="table-destination-cell"><span>{destination.image_url ? <img src={destination.image_url} alt="" /> : <MapPin size={17} />}</span><div><strong>{destination.name}</strong><small>{destination.area || 'Area not provided'}</small><small title={destination.address}>{destination.address}</small></div></div></td>
              <td><span className="table-category">{destination.category}</span></td>
              <td><strong className="table-hours">{destination.hours}</strong><small className="table-days">{destination.operating_days?.length || 0} operating days</small></td>
              <td><strong className="table-fee">{peso.format(Number(destination.entrance_fee || 0))}</strong></td>
              <td>{destination.review_count ? <span className="table-rating"><Star size={14} fill="currentColor" /><strong>{destination.average_rating}</strong><small>{destination.review_count} review{destination.review_count === 1 ? '' : 's'}</small></span> : <span className="table-no-rating">No reviews</span>}</td>
              <td><span className={`table-status ${statusKey}`}><i />{statusLabel}</span></td>
              <td><div className="table-row-actions"><button type="button" className="table-edit-button" onClick={() => onEdit(destination.id)} title={`Edit ${destination.name}`}><PencilLine size={15} /> Edit</button><button type="button" className="table-delete-button" onClick={() => onDelete(destination)} title={`Delete ${destination.name}`} aria-label={`Delete ${destination.name}`}><Trash2 size={15} /></button></div></td>
            </tr>
          })}</tbody>
        </table>
      </div>
      <footer className="admin-table-footer"><span>Showing {filteredRecords.length} matching destination{filteredRecords.length === 1 ? '' : 's'}</span><small>Use Edit to open the full destination form.</small></footer>
    </> : <div className="admin-table-empty filtered"><Search size={26} /><strong>No destinations match these filters</strong><p>Try another search, status, or category.</p><button type="button" className="admin-secondary-button" onClick={resetFilters}>Clear filters</button></div>}
  </section>
}
