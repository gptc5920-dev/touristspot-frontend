import { useEffect, useState } from 'react'
import {
  BadgeCheck, CalendarDays, CircleAlert, Database, LayoutDashboard,
  ListChecks, LogOut, MapPin, MapPinned, Menu, Navigation, PanelLeftClose,
  PanelLeftOpen, Plus, RefreshCw, Settings2, ShieldCheck, Users, X,
} from '../../fontawesome-icons'
import { readApiJson } from '../../api'
import { DESTINATION_CATEGORIES, EMPTY_DESTINATION } from '../../config/travel'
import { apiErrorMessage, peso, requestErrorMessage } from '../../lib/app'
import { ConfirmDialog } from '../common/Dialogs'
import { useSiteSettings } from '../../contexts/siteSettingsState'
import AdminDashboardOverview from './AdminDashboardOverview'
import AdminSettings from './AdminSettings'
import { DestinationTable, UsersTable } from './AdminTables'
import DestinationEditor from './DestinationEditor'

export default function AdminWorkspace({ apiFetch, user, onLogout, onModal }) {
  const { settings } = useSiteSettings()
  const [dashboard, setDashboard] = useState(null)
  const [records, setRecords] = useState([])
  const [users, setUsers] = useState([])
  const [adminSection, setAdminSection] = useState('overview')
  const [selectedId, setSelectedId] = useState(null)
  const [draft, setDraft] = useState(EMPTY_DESTINATION)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [draftErrors, setDraftErrors] = useState({})
  const [pendingImage, setPendingImage] = useState(null)
  const [removingImage, setRemovingImage] = useState(false)
  const [deleteCandidate, setDeleteCandidate] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.localStorage.getItem('travel-osmena-admin-sidebar') === 'collapsed')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [recordsDrawerOpen, setRecordsDrawerOpen] = useState(false)

  useEffect(() => {
    if (!mobileSidebarOpen && !recordsDrawerOpen) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setMobileSidebarOpen(false)
        setRecordsDrawerOpen(false)
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [mobileSidebarOpen, recordsDrawerOpen])

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [summaryResponse, destinationsResponse, usersResponse] = await Promise.all([
          apiFetch('/admin/dashboard/'), apiFetch('/admin/destinations/'), apiFetch('/admin/users/'),
        ])
        const [summary, destinations, userRecords] = await Promise.all([readApiJson(summaryResponse), readApiJson(destinationsResponse), readApiJson(usersResponse)])
        if (!summaryResponse.ok) throw new Error(apiErrorMessage(summary, 'Could not load the administration workspace.'))
        if (!destinationsResponse.ok) throw new Error(apiErrorMessage(destinations, 'Could not load destination records.'))
        if (!usersResponse.ok) throw new Error(apiErrorMessage(userRecords, 'Could not load user records.'))
        setDashboard(summary)
        setRecords(destinations.destinations || [])
        setUsers(userRecords.users || [])
        if (destinations.destinations?.[0]) selectDestination(destinations.destinations[0])
      } catch (requestError) {
        setError(requestErrorMessage(requestError, 'Could not load the administration workspace.'))
      } finally {
        setLoading(false)
      }
    }
    loadAdminData()
  }, [apiFetch])

  function destinationDraft(destination) {
    return {
      ...EMPTY_DESTINATION,
      ...destination,
      latitude: String(destination.coordinates?.[0] ?? ''),
      longitude: String(destination.coordinates?.[1] ?? ''),
      interests: Array.isArray(destination.interests) ? destination.interests : [],
      operating_days: Array.isArray(destination.operating_days) ? destination.operating_days : [],
      activities: Array.isArray(destination.activities) ? destination.activities : [],
      transportation_options: Array.isArray(destination.transportation_options) ? destination.transportation_options : [],
      safety_reminders: Array.isArray(destination.safety_reminders) ? destination.safety_reminders : [],
      recommended_companions: Array.isArray(destination.recommended_companions) ? destination.recommended_companions : [],
      image_url: destination.external_image_url || '',
      saved_image_url: destination.image_url || '',
    }
  }

  function selectDestination(destination) {
    setSelectedId(destination.id)
    setDraft(destinationDraft(destination))
    setMessage('')
    setDraftErrors({})
    setPendingImage(null)
    setRecordsDrawerOpen(false)
  }

  function changeDraft(field, value) {
    setDraft((current) => ({ ...current, [field]: value }))
    setDraftErrors((current) => ({ ...current, [field]: undefined }))
  }

  function toggleDraftList(field, value) {
    setDraft((current) => ({
      ...current,
      [field]: current[field].includes(value)
        ? current[field].filter((item) => item !== value)
        : [...current[field], value],
    }))
    setDraftErrors((current) => ({ ...current, [field]: undefined }))
  }

  function chooseImage(file) {
    if (!file) return
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setDraftErrors((current) => ({ ...current, image: 'Choose a JPG, PNG, or WebP image.' }))
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setDraftErrors((current) => ({ ...current, image: 'Choose an image that is 5 MB or smaller.' }))
      return
    }
    setPendingImage(file)
    setDraftErrors((current) => ({ ...current, image: undefined }))
  }

  function startNewDestination() {
    setSelectedId(null)
    setDraft({ ...EMPTY_DESTINATION })
    setMessage('')
    setDraftErrors({})
    setPendingImage(null)
    setAdminSection('destinations')
    setMobileSidebarOpen(false)
    setRecordsDrawerOpen(false)
  }

  function editDestination(destinationId) {
    const destination = records.find((item) => item.id === destinationId)
    if (destination) selectDestination(destination)
    setAdminSection('destinations')
    setMobileSidebarOpen(false)
  }

  function selectAdminSection(section) {
    setAdminSection(section)
    setMobileSidebarOpen(false)
    setRecordsDrawerOpen(false)
  }

  function toggleSidebar() {
    setSidebarCollapsed((current) => {
      const next = !current
      window.localStorage.setItem('travel-osmena-admin-sidebar', next ? 'collapsed' : 'expanded')
      return next
    })
  }

  function validateDestination() {
    const errors = {}
    if (draft.name.trim().length < 3) errors.name = 'Enter a destination name with at least 3 characters.'
    if (!DESTINATION_CATEGORIES.includes(draft.category)) errors.category = 'Choose a category from the list.'
    if (draft.description.trim().length < 20) errors.description = 'Add a helpful description with at least 20 characters.'
    if (!draft.interests.length) errors.interests = 'Choose at least one traveler interest.'
    if (!draft.area.trim()) errors.area = 'Enter the municipality area or barangay.'
    if (draft.address.trim().length < 5) errors.address = 'Enter a complete visitor-facing address.'

    const latitude = Number(draft.latitude)
    const longitude = Number(draft.longitude)
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) errors.latitude = 'Latitude must be between -90 and 90.'
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) errors.longitude = 'Longitude must be between -180 and 180.'
    if (!draft.operating_days.length) errors.operating_days = 'Choose at least one operating day.'
    if (!draft.opening_time) errors.opening_time = 'Choose an opening time.'
    if (!draft.closing_time) errors.closing_time = 'Choose a closing time.'
    if (draft.opening_time && draft.closing_time && draft.opening_time >= draft.closing_time) errors.closing_time = 'Closing time must be later than opening time.'
    if (!Number.isFinite(Number(draft.visit_minutes)) || Number(draft.visit_minutes) < 15 || Number(draft.visit_minutes) > 720) errors.visit_minutes = 'Use a realistic visit duration between 15 and 720 minutes.'
    if (!Number.isFinite(Number(draft.entrance_fee)) || Number(draft.entrance_fee) < 0) errors.entrance_fee = 'Entrance fee must be zero or a positive amount.'
    if (draft.availability_start && draft.availability_end && draft.availability_start > draft.availability_end) errors.availability_end = 'End date must be on or after the start date.'
    if (draft.image_url) {
      try {
        const imageUrl = new URL(draft.image_url)
        if (!['http:', 'https:'].includes(imageUrl.protocol)) errors.image_url = 'Use a complete http:// or https:// image URL.'
      } catch {
        errors.image_url = 'Enter a valid, complete image URL.'
      }
    }
    return errors
  }

  async function saveDestination(event) {
    event.preventDefault()
    const validationErrors = validateDestination()
    if (Object.keys(validationErrors).length) {
      setDraftErrors(validationErrors)
      setError('Review the highlighted fields before saving this destination.')
      return
    }
    setSaving(true)
    setError('')
    const payload = {
      name: draft.name, description: draft.description, category: draft.category, area: draft.area, address: draft.address,
      latitude: draft.latitude, longitude: draft.longitude, opening_time: draft.opening_time, closing_time: draft.closing_time, visit_minutes: draft.visit_minutes,
      entrance_fee: draft.entrance_fee, interests: draft.interests, operating_days: draft.operating_days,
      availability_start: draft.availability_start || null, availability_end: draft.availability_end || null,
      activities: draft.activities, accessibility: draft.accessibility, contact_information: draft.contact_information,
      image_url: draft.image_url, transportation_options: draft.transportation_options,
      safety_reminders: draft.safety_reminders, recommended_companions: draft.recommended_companions, advisory: draft.advisory,
      is_active: draft.is_active, is_verified: draft.is_verified,
    }
    try {
      const url = selectedId ? `/admin/destinations/${selectedId}/` : '/admin/destinations/'
      const response = await apiFetch(url, { method: selectedId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const body = await readApiJson(response)
      if (!response.ok) {
        if (body?.fields) setDraftErrors(Object.fromEntries(Object.entries(body.fields).map(([field, messages]) => [field, messages?.[0] || 'Review this field.'])))
        throw new Error(apiErrorMessage(body, 'Could not save destination.'))
      }
      let saved = body.destination
      if (pendingImage) {
        const media = new FormData()
        media.append('image', pendingImage)
        const imageResponse = await apiFetch(`/admin/destinations/${saved.id}/image/`, { method: 'POST', body: media })
        const imageBody = await readApiJson(imageResponse)
        if (!imageResponse.ok) {
          setRecords((current) => selectedId ? current.map((item) => item.id === saved.id ? saved : item) : [saved, ...current])
          selectDestination(saved)
          const uploadMessage = `Destination saved, but the cover image could not be uploaded. ${apiErrorMessage(imageBody, 'Choose another image and try again.')}`
          setError(uploadMessage)
          onModal({ title: 'Cover image not uploaded', message: uploadMessage, tone: 'warning' })
          return
        }
        saved = imageBody.destination
      }
      setRecords((current) => selectedId ? current.map((item) => item.id === saved.id ? saved : item) : [saved, ...current])
      selectDestination(saved)
      setMessage(selectedId ? 'Destination updated.' : 'Destination added to the tourism database.')
      const dashboardResponse = await apiFetch('/admin/dashboard/')
      if (dashboardResponse.ok) setDashboard(await readApiJson(dashboardResponse))
    } catch (requestError) {
      const message = requestErrorMessage(requestError, 'Could not save destination.')
      setError(message)
      onModal({ title: 'Could not save destination', message, tone: 'error' })
    } finally {
      setSaving(false)
    }
  }

  async function removeSavedImage() {
    if (pendingImage) {
      setPendingImage(null)
      return
    }
    if (!selectedId || !draft.has_uploaded_image) {
      changeDraft('image_url', '')
      return
    }
    setRemovingImage(true)
    setError('')
    try {
      const response = await apiFetch(`/admin/destinations/${selectedId}/image/`, { method: 'DELETE' })
      const body = await readApiJson(response)
      if (!response.ok) throw new Error(apiErrorMessage(body, 'Could not remove the cover image.'))
      const saved = body.destination
      setRecords((current) => current.map((item) => item.id === saved.id ? saved : item))
      selectDestination(saved)
      setMessage('Cover image removed.')
    } catch (requestError) {
      setError(requestErrorMessage(requestError, 'Could not remove the cover image.'))
    } finally {
      setRemovingImage(false)
    }
  }

  function requestDestinationDelete(destination) {
    setDeleteCandidate(destination)
    setError('')
    setMessage('')
  }

  async function deleteDestination() {
    if (!deleteCandidate) return
    const destination = deleteCandidate
    setDeleting(true)
    setError('')
    try {
      const response = await apiFetch(`/admin/destinations/${destination.id}/`, { method: 'DELETE' })
      const body = await readApiJson(response)
      if (!response.ok) throw new Error(apiErrorMessage(body, 'Could not delete destination.'))
      setRecords((current) => current.filter((item) => item.id !== destination.id))
      if (selectedId === destination.id) {
        setSelectedId(null)
        setDraft({ ...EMPTY_DESTINATION })
        setDraftErrors({})
        setPendingImage(null)
      }
      setDeleteCandidate(null)
      setMessage(`${destination.name} was deleted.`)
      const dashboardResponse = await apiFetch('/admin/dashboard/')
      if (dashboardResponse.ok) setDashboard(await readApiJson(dashboardResponse))
    } catch (requestError) {
      const deleteMessage = requestErrorMessage(requestError, 'Could not delete destination.')
      setDeleteCandidate(null)
      setError(deleteMessage)
      onModal({ title: 'Could not delete destination', message: deleteMessage, tone: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  const accountLabel = user.email || user.username || 'Administrator'
  const accountInitial = accountLabel.charAt(0).toUpperCase()
  const adminSectionCopy = {
    overview: ['Dashboard overview', 'Track destination readiness, content coverage, and traveler activity.'],
    table: ['Destination table', 'Search, filter, and review every tourism destination record in one place.'],
    users: ['Users table', 'Review tourist and administrator accounts, preferences, and platform activity.'],
    destinations: ['Destination management', 'Create, verify, and maintain the destination records used by the planner.'],
    settings: ['General settings', 'Manage the logo, site identity, tourism office details, and public contact information.'],
  }[adminSection]

  return (
    <main className={`admin-shell${sidebarCollapsed ? ' sidebar-collapsed' : ''}${mobileSidebarOpen ? ' sidebar-mobile-open' : ''}${recordsDrawerOpen ? ' records-drawer-open' : ''}`}>
      <aside className="admin-sidebar" aria-label="Admin menu">
        <div className="admin-brand"><span className="admin-brand-mark">{settings.logo_url ? <img className="h-full w-full object-contain" src={settings.logo_url} alt="" /> : <Navigation size={19} />}</span><span><strong>{settings.site_name}</strong><small>Admin console</small></span></div>
        <span className="sidebar-label">Workspace</span>
        <nav className="sidebar-navigation" aria-label="Admin navigation">
          <button type="button" title="Dashboard" className={adminSection === 'overview' ? 'active' : ''} onClick={() => selectAdminSection('overview')}><LayoutDashboard size={17} /><span>Dashboard</span></button>
          <button type="button" title="Destination table" className={adminSection === 'table' ? 'active' : ''} onClick={() => selectAdminSection('table')}><Database size={17} /><span>Destination table</span><em>{records.length}</em></button>
          <button type="button" title="Users table" className={adminSection === 'users' ? 'active' : ''} onClick={() => selectAdminSection('users')}><Users size={17} /><span>Users table</span><em>{users.length}</em></button>
          <button type="button" title="Destinations" className={adminSection === 'destinations' ? 'active' : ''} onClick={() => selectAdminSection('destinations')}><MapPinned size={17} /><span>Destinations</span><em>{records.length}</em></button>
          <button type="button" title="General settings" className={adminSection === 'settings' ? 'active' : ''} onClick={() => selectAdminSection('settings')}><Settings2 size={17} /><span>Settings</span></button>
        </nav>
        <button type="button" title="Sign out" className="admin-sidebar-signout" onClick={onLogout}><LogOut size={16} /><span>Sign out</span></button>
      </aside>
      <button type="button" className="admin-sidebar-backdrop" aria-label="Close admin menu" onClick={() => setMobileSidebarOpen(false)} />

      <section className="admin-main">
        <header className="admin-topbar"><div className="admin-topbar-leading"><button type="button" className="admin-collapse-menu" aria-label={sidebarCollapsed ? 'Expand admin menu' : 'Collapse admin menu'} aria-expanded={!sidebarCollapsed} onClick={toggleSidebar}>{sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}</button><button type="button" className="admin-mobile-menu" aria-label="Open admin menu" aria-expanded={mobileSidebarOpen} onClick={() => setMobileSidebarOpen(true)}><Menu size={19} /></button><div className="admin-breadcrumb"><span>Admin workspace</span><strong>{adminSectionCopy[0]}</strong></div></div><div className="admin-topbar-account"><span className="admin-today"><CalendarDays size={15} /> {new Date().toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' })}</span><span className="admin-avatar">{accountInitial}</span><span className="admin-account-copy"><strong>{accountLabel}</strong><small>Administrator</small></span><button type="button" title="Sign out" onClick={onLogout}><LogOut size={16} /></button></div></header>

        <div className="admin-workspace">
      <div className="admin-page-heading">
        <div><span className="eyebrow"><ShieldCheck size={15} /> Tourism operations</span><h1>{adminSectionCopy[0]}</h1><p>{adminSectionCopy[1]}</p></div>
        <div className="admin-heading-actions">{adminSection === 'destinations' && <button type="button" className="admin-secondary-button" aria-expanded={recordsDrawerOpen} onClick={() => setRecordsDrawerOpen(true)}><ListChecks size={16} /> Destination records <span>{records.length}</span></button>}{['overview', 'table', 'destinations'].includes(adminSection) && <button type="button" className="admin-primary-button" onClick={startNewDestination}><Plus size={17} /> Add destination</button>}</div>
      </div>

      <nav className="admin-section-nav" aria-label="Administration sections">
        <button type="button" className={adminSection === 'overview' ? 'active' : ''} onClick={() => selectAdminSection('overview')}><LayoutDashboard size={16} /> Overview</button>
        <button type="button" className={adminSection === 'table' ? 'active' : ''} onClick={() => selectAdminSection('table')}><Database size={16} /> Table <span>{records.length}</span></button>
        <button type="button" className={adminSection === 'users' ? 'active' : ''} onClick={() => selectAdminSection('users')}><Users size={16} /> Users <span>{users.length}</span></button>
        <button type="button" className={adminSection === 'destinations' ? 'active' : ''} onClick={() => selectAdminSection('destinations')}><MapPinned size={16} /> Destinations <span>{records.length}</span></button>
        <button type="button" className={adminSection === 'settings' ? 'active' : ''} onClick={() => selectAdminSection('settings')}><Settings2 size={16} /> Settings</button>
      </nav>

      {error && <div className="alert error"><CircleAlert size={18} /><span>{error}</span><button type="button" title="Dismiss message" onClick={() => setError('')}><X size={16} /></button></div>}
      {message && <div className="alert success"><BadgeCheck size={18} /><span>{message}</span><button type="button" title="Dismiss message" onClick={() => setMessage('')}><X size={16} /></button></div>}

      {adminSection === 'overview'
        ? <AdminDashboardOverview dashboard={dashboard} loading={loading} onManage={() => selectAdminSection('destinations')} onEdit={editDestination} />
        : adminSection === 'table'
          ? <DestinationTable records={records} loading={loading} onEdit={editDestination} onDelete={requestDestinationDelete} onAdd={startNewDestination} />
          : adminSection === 'users'
            ? <UsersTable users={users} loading={loading} />
          : adminSection === 'settings'
            ? <AdminSettings apiFetch={apiFetch} />
          : <section className="admin-content-grid">
        <button type="button" className="admin-records-backdrop" aria-label="Close destination records" onClick={() => setRecordsDrawerOpen(false)} />
        <aside className="admin-destination-list" aria-label="Destination records">
          <div className="admin-list-heading"><div><span className="eyebrow"><MapPinned size={14} /> Destination records</span><strong>{records.length} places</strong></div><div className="admin-list-heading-actions"><button type="button" title="Add destination" onClick={startNewDestination}><Plus size={16} /></button><button type="button" title="Close destination records" onClick={() => setRecordsDrawerOpen(false)}><X size={16} /></button></div></div>
          {loading ? <div className="admin-list-loading"><RefreshCw className="spin" size={18} /> Loading records</div> : records.length ? records.map((destination) => <button key={destination.id} type="button" onClick={() => selectDestination(destination)} className={selectedId === destination.id ? 'admin-list-item active' : 'admin-list-item'}><span className="record-image">{destination.image_url ? <img src={destination.image_url} alt="" /> : <MapPin size={17} />}</span><span><strong>{destination.name}</strong><small>{destination.category} · {destination.area}</small><small className="record-entrance-fee">Entrance fee · {peso.format(Number(destination.entrance_fee || 0))}</small><em className={destination.is_active && destination.is_verified ? 'record-status ready' : 'record-status'}>{destination.is_active ? destination.is_verified ? 'Verified' : 'Pending verification' : 'Unavailable'}</em></span></button>) : <div className="admin-list-empty"><MapPinned size={24} /><strong>No destinations yet</strong><span>Add the first tourism-office record.</span><button type="button" onClick={startNewDestination}>Add destination</button></div>}
        </aside>

        <DestinationEditor
          dashboard={dashboard}
          draft={draft}
          errors={draftErrors}
          pendingImage={pendingImage}
          removingImage={removingImage}
          saving={saving}
          selectedId={selectedId}
          onChange={changeDraft}
          onChooseImage={chooseImage}
          onRemoveImage={removeSavedImage}
          onDelete={() => requestDestinationDelete(records.find((item) => item.id === selectedId) || { id: selectedId, name: draft.name })}
          onSubmit={saveDestination}
          onToggleList={toggleDraftList}
        />
      </section>}
        </div>
      </section>
      {deleteCandidate && <ConfirmDialog
        title="Delete destination?"
        message={`This will permanently remove ${deleteCandidate.name} and its traveler feedback. This action cannot be undone.`}
        confirmLabel="Delete destination"
        loading={deleting}
        onClose={() => { if (!deleting) setDeleteCandidate(null) }}
        onConfirm={deleteDestination}
      />}
    </main>
  )
}
