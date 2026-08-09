import { LogIn, LogOut, Navigation, RefreshCw, ShieldCheck } from '../../fontawesome-icons'
import { useSiteSettings } from '../../contexts/siteSettingsState'

export default function AdminAccessPage({ checking, user, onLogin, onLogout }) {
  const { settings } = useSiteSettings()
  const signedInWithoutAccess = user.is_authenticated && user.role !== 'admin'

  return (
    <main className="admin-access-page">
      <div className="admin-access-brand" aria-label={`${settings.site_name} administration`}>
        <span className="admin-brand-mark">{settings.logo_url ? <img className="h-full w-full object-contain" src={settings.logo_url} alt="" /> : <Navigation size={19} />}</span>
        <span><strong>{settings.site_name}</strong><small>Administration console</small></span>
      </div>
      <section className="admin-access-card" aria-live="polite">
        <span className={checking ? 'admin-access-icon checking' : 'admin-access-icon'}>
          {checking ? <RefreshCw className="spin" size={25} /> : <ShieldCheck size={27} />}
        </span>
        <span className="eyebrow">Protected administration</span>
        <h1>{checking ? 'Verifying your session' : signedInWithoutAccess ? 'Administrator permission required' : 'Admin sign-in required'}</h1>
        <p>{checking
          ? 'Please wait while we confirm your account and permissions.'
          : signedInWithoutAccess
            ? 'This dashboard is restricted to authorized tourism administrators. Your current account does not have admin access.'
            : 'Sign in with an authorized administrator account to open the tourism operations dashboard.'}</p>
        {!checking && <div className="admin-access-actions">
          {!signedInWithoutAccess && <button type="button" className="admin-access-primary" onClick={onLogin}><LogIn size={17} /> Sign in as admin</button>}
          {signedInWithoutAccess && <button type="button" className="admin-access-primary" onClick={onLogout}><LogOut size={17} /> Sign out and use an admin account</button>}
        </div>}
      </section>
    </main>
  )
}
