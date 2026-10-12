import { useEffect, useState } from 'react'
import { Compass, LogOut, MapPin, Menu, Navigation, Route, Share2, Sparkles, UserRound, X } from '../../fontawesome-icons'
import { ROUTES } from '../../config/travel'
import DialogSurface from '../common/DialogSurface'

export default function TouristSidebar({ user, settings, view, navigateTo, onShare, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => setMenuOpen(false), [view])
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 861px)')
    const closeOnDesktop = () => { if (desktop.matches) setMenuOpen(false) }
    desktop.addEventListener('change', closeOnDesktop)
    return () => desktop.removeEventListener('change', closeOnDesktop)
  }, [])

  function followLink(event, nextView) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    setMenuOpen(false)
    navigateTo(nextView)
  }

  const items = [
    { view: 'home', label: 'Home', Icon: Compass },
    { view: 'discover', label: 'Discover', Icon: MapPin },
    { view: 'planner', label: 'Planner', Icon: Route },
    { view: user.preferences_completed ? 'recommendations' : 'preferences', label: 'Recommendations', Icon: Sparkles, active: ['preferences', 'recommendations'].includes(view) },
    { view: 'profile', label: 'My profile', Icon: UserRound },
  ]

  function content() {
    return <>
      <a className="brand tourist-sidebar-brand" href={ROUTES.home} onClick={(event) => followLink(event, 'home')} aria-label={`${settings.site_name} home`}>
        <span className="brand-mark">{settings.logo_url ? <img src={settings.logo_url} alt="" /> : <Navigation size={20} />}</span>
        <span>{settings.site_name}</span>
      </a>
      <p className="tourist-sidebar-label">Your travel space</p>
      <nav className="tourist-sidebar-nav" aria-label="Tourist navigation">
        {items.map(({ view: nextView, label, Icon, active = view === nextView }) => <a key={label} href={ROUTES[nextView]} className={active ? 'active' : ''} aria-current={active ? 'page' : undefined} onClick={(event) => followLink(event, nextView)}><Icon size={19} /><span>{label}</span></a>)}
      </nav>
      <div className="tourist-sidebar-footer">
        {view === 'planner' && <button className="tourist-sidebar-action" type="button" onClick={() => { setMenuOpen(false); onShare() }}><Share2 size={18} /> Share itinerary</button>}
        <a className="tourist-sidebar-account" href={ROUTES.profile} onClick={(event) => followLink(event, 'profile')}>
          <span className="tourist-avatar"><UserRound size={20} /></span>
          <span><strong>{user.display_name || user.email || user.username}</strong><small>Tourist account</small></span>
        </a>
        <button className="tourist-sidebar-action" type="button" onClick={() => { setMenuOpen(false); onLogout() }}><LogOut size={18} /> Sign out</button>
      </div>
    </>
  }

  return <>
    <aside className="tourist-sidebar tourist-sidebar-desktop" aria-label="Tourist account">{content()}</aside>
    <button className="tourist-menu-toggle" type="button" aria-label="Open tourist menu" aria-expanded={menuOpen} aria-controls={menuOpen ? 'tourist-menu' : undefined} onClick={() => setMenuOpen(true)}><Menu size={20} /><span>Menu</span></button>
    {menuOpen && <div className="tourist-menu-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setMenuOpen(false) }}>
      <DialogSurface id="tourist-menu" className="tourist-sidebar tourist-sidebar-drawer" aria-label="Tourist account menu" onClose={() => setMenuOpen(false)}>
        <button type="button" className="tourist-menu-close" aria-label="Close tourist menu" onClick={() => setMenuOpen(false)}><X size={20} /></button>
        {content()}
      </DialogSurface>
    </div>}
  </>
}
