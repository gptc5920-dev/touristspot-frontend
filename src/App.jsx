import { useEffect, useState } from 'react'
import { BadgeCheck, Compass, LayoutDashboard, LogIn, LogOut, MapPin, Navigation, Route, Share2, Sparkles, UserPlus, UserRound } from './fontawesome-icons'
import AdminAccessPage from './components/admin/AdminAccessPage'
import AdminWorkspace from './components/admin/AdminWorkspace'
import { AdminLoginDialog, AuthDialog } from './components/auth/AuthDialogs'
import { AppModal } from './components/common/Dialogs'
import LocationMapModal from './components/common/LocationMapModal'
import ClientHomePage from './components/client/ClientHomePage'
import ClientDiscoverPage from './components/client/ClientDiscoverPage'
import DestinationFeedbackDialog from './components/client/DestinationFeedbackDialog'
import TouristProfilePage from './components/client/TouristProfilePage'
import PlannerPage from './components/planner/PlannerPage'
import PreferenceOnboardingPage from './components/recommendations/PreferenceOnboardingPage'
import RecommendationsPage from './components/recommendations/RecommendationsPage'
import { useSiteSettings } from './contexts/siteSettingsState'
import useApiFetch from './hooks/useApiFetch'
import useAuthentication from './hooks/useAuthentication'
import useNavigation from './hooks/useNavigation'
import usePlanner from './hooks/usePlanner'
import useTouristRecommendations from './hooks/useTouristRecommendations'
import './styles/index.css'

function App() {
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [modal, setModal] = useState(null)
  const [feedbackDestination, setFeedbackDestination] = useState(null)
  const apiFetch = useApiFetch()
  const { settings } = useSiteSettings()
  const { view, navigateTo } = useNavigation()
  const auth = useAuthentication({
    apiFetch,
    navigateTo,
    onError: setError,
    onModal: setModal,
    onNotice: setNotice,
  })
  const planner = usePlanner({
    apiFetch,
    navigateTo,
    onError: setError,
    onModal: setModal,
    onNotice: setNotice,
    onRequireAuthentication: (message) => {
      auth.openAuth('signin')
      auth.setError(message)
    },
  })
  const recommendations = useTouristRecommendations({
    apiFetch,
    user: auth.user,
    onUserChange: auth.setUser,
    navigateTo,
    verifiedDestinations: planner.destinations,
  })

  useEffect(() => {
    if (auth.checking) return
    if (auth.user.role === 'admin' && view !== 'admin') navigateTo('admin', { replace: true })
    if (auth.user.role === 'tourist' && !auth.user.preferences_completed && !['home', 'discover', 'profile', 'preferences', 'admin'].includes(view)) navigateTo('preferences', { replace: true })
  }, [auth.checking, auth.user.preferences_completed, auth.user.role, navigateTo, view])

  function requireTouristSignIn() {
    setFeedbackDestination(null)
    auth.openAuth('signin')
    auth.setError('Sign in or create a tourist account to share destination feedback.')
  }

  function showDiscover() {
    navigateTo('discover')
  }

  const isAdminRoute = view === 'admin'
  const isProfileRoute = view === 'profile'
  const isHomeRoute = view === 'home'
  const isDiscoverRoute = view === 'discover'
  const isRecommendationsRoute = view === 'recommendations'
  const showAdminWorkspace = isAdminRoute && !auth.checking && auth.user.role === 'admin'

  return (
    <div className={`app-shell ${!isAdminRoute ? 'with-mobile-nav' : ''} ${isHomeRoute ? 'home-route' : ''} ${isDiscoverRoute ? 'discover-route' : ''}`}>
      {!isAdminRoute && <header className="topbar">
        <a className="brand" href="/" aria-label={`${settings.site_name} home`} onClick={(event) => { event.preventDefault(); navigateTo('home') }}>
          <span className="brand-mark">{settings.logo_url ? <img className="h-full w-full object-contain" src={settings.logo_url} alt="" /> : <Navigation size={20} strokeWidth={2.5} />}</span>
          <span>{settings.site_name}</span>
        </a>
        <nav className="main-nav" aria-label="Primary navigation">
          <button type="button" className={isHomeRoute ? 'active' : ''} onClick={() => navigateTo('home')}>Home</button>
          <button type="button" className={view === 'planner' ? 'active' : ''} onClick={() => navigateTo('planner')}>Planner</button>
          <button type="button" className={isDiscoverRoute ? 'active' : ''} onClick={showDiscover}>Discover</button>
          {auth.user.role === 'admin' && <button type="button" onClick={() => navigateTo('admin')}><LayoutDashboard size={15} /> Dashboard</button>}
          {auth.user.role === 'tourist' && <button type="button" className={isRecommendationsRoute ? 'active' : ''} onClick={() => navigateTo(auth.user.preferences_completed ? 'recommendations' : 'preferences')}><Sparkles size={15} /> Recommendations</button>}
          {auth.user.role === 'tourist' && <button type="button" className={isProfileRoute ? 'active' : ''} onClick={() => navigateTo('profile')}><UserRound size={15} /> Profile</button>}
        </nav>
        <div className="topbar-actions">
          {!isHomeRoute && !isDiscoverRoute && <span className="verified"><BadgeCheck size={16} /> Verified tourism data</span>}
          {view === 'planner' && <button className="icon-text-button" type="button" onClick={planner.shareItinerary}><Share2 size={16} /> Share</button>}
          {auth.user.is_authenticated
            ? <><button className="account-name account-button" type="button" onClick={() => navigateTo(auth.user.role === 'admin' ? 'admin' : 'profile')}><UserRound size={15} /> {auth.user.display_name || auth.user.email || auth.user.username}</button><button className="icon-text-button" type="button" onClick={() => auth.logout()}><LogOut size={16} /> Sign out</button></>
            : <><button className="auth-text-button" type="button" onClick={() => auth.openAuth('signin')}><LogIn size={16} /> Sign in</button><button className="signup-button" type="button" onClick={() => auth.openAuth('signup')}><UserPlus size={16} /> Sign up</button></>}
        </div>
      </header>}

      {!isAdminRoute && <nav className="mobile-nav" aria-label="Mobile navigation">
        <button type="button" className={isHomeRoute ? 'active' : ''} aria-current={isHomeRoute ? 'page' : undefined} onClick={() => navigateTo('home')}><Compass size={18} /><span>Home</span></button>
        <button type="button" className={view === 'planner' ? 'active' : ''} aria-current={view === 'planner' ? 'page' : undefined} onClick={() => navigateTo('planner')}><Route size={18} /><span>Planner</span></button>
        <button type="button" className={isDiscoverRoute ? 'active' : ''} aria-current={isDiscoverRoute ? 'page' : undefined} onClick={showDiscover}><MapPin size={18} /><span>Discover</span></button>
        {auth.user.role === 'admin' && <button type="button" onClick={() => navigateTo('admin')}><LayoutDashboard size={18} /><span>Dashboard</span></button>}
        {auth.user.role === 'tourist' && <button type="button" className={['preferences', 'recommendations'].includes(view) ? 'active' : ''} aria-current={['preferences', 'recommendations'].includes(view) ? 'page' : undefined} onClick={() => navigateTo(auth.user.preferences_completed ? 'recommendations' : 'preferences')}><Sparkles size={18} /><span>Matches</span></button>}
        {auth.user.role === 'tourist' && <button type="button" className={isProfileRoute ? 'active' : ''} aria-current={isProfileRoute ? 'page' : undefined} onClick={() => navigateTo('profile')}><UserRound size={18} /><span>Profile</span></button>}
      </nav>}

      {isAdminRoute
        ? showAdminWorkspace
          ? <AdminWorkspace apiFetch={apiFetch} user={auth.user} onLogout={() => auth.logout({ stayOnAdmin: true })} onModal={setModal} />
          : <AdminAccessPage checking={auth.checking} user={auth.user} onLogin={() => auth.openAuth('signin', 'admin')} onLogout={() => auth.logout({ stayOnAdmin: true })} />
        : view === 'preferences'
          ? <PreferenceOnboardingPage
            user={auth.user}
            checking={auth.checking}
            preferences={recommendations.preferences}
            loading={recommendations.loadingPreferences}
            saving={recommendations.saving}
            generating={recommendations.generating}
            errors={recommendations.fieldErrors}
            error={recommendations.error}
            onChange={recommendations.updatePreference}
            onToggle={recommendations.togglePreferenceList}
            onSubmit={recommendations.savePreferences}
            onSignIn={() => auth.openAuth('signin')}
          />
        : isRecommendationsRoute
          ? <RecommendationsPage
            user={auth.user}
            checking={auth.checking}
            preferences={recommendations.preferences}
            loadingPreferences={recommendations.loadingPreferences}
            data={recommendations.recommendationData}
            generating={recommendations.generating}
            error={recommendations.error}
            onGenerate={recommendations.generateRecommendations}
            onUpdatePreferences={() => navigateTo('preferences')}
            onAddToItinerary={planner.addRecommendationToPlanner}
          />
          : isDiscoverRoute
          ? <ClientDiscoverPage destinations={planner.destinations} loading={planner.loading} error={error} onPlan={planner.startPlanning} onFeedback={setFeedbackDestination} />
          : isProfileRoute
          ? <TouristProfilePage apiFetch={apiFetch} user={auth.user} checking={auth.checking} onSignIn={() => auth.openAuth('signin')} onSignUp={() => auth.openAuth('signup')} onBack={() => navigateTo('planner')} onUserChange={auth.setUser} onProfileSaved={recommendations.syncProfilePreferences} onUsePreferences={planner.applyProfilePreferences} />
          : isHomeRoute
            ? <ClientHomePage destinations={planner.destinations} loading={planner.loading} user={auth.user} onPlan={planner.startPlanning} onDiscover={showDiscover} onSignUp={() => auth.openAuth('signup')} onProfile={() => navigateTo('profile')} onFeedback={setFeedbackDestination} />
            : <PlannerPage
              form={planner.form}
              destinations={planner.destinations}
              itinerary={planner.itinerary}
              loading={planner.loading}
              generating={planner.generating}
              error={error}
              notice={notice}
              focusedStop={planner.focusedStop}
              plannerOpenSection={planner.openSection}
              plannerCoordinates={planner.coordinates}
              fieldErrors={planner.fieldErrors}
              selectedDestinationIds={planner.selectedDestinationIds}
              onToggleSection={planner.toggleSection}
              onUpdateForm={planner.updateForm}
              onPlannerCoordinatesChange={planner.setCoordinates}
              onOpenMap={() => planner.setShowMap(true)}
              onToggleInterest={planner.toggleInterest}
              onToggleDestination={planner.toggleDestination}
              onRegenerate={planner.regenerate}
              onSave={planner.saveItinerary}
              onDownload={planner.downloadItinerary}
              onFocusStop={planner.setFocusedStop}
              onFeedback={setFeedbackDestination}
              onMoveEarlier={planner.moveEarlier}
              onRemoveStop={planner.removeStop}
              onAddAlternative={planner.addAlternative}
              onDismissError={() => setError('')}
              onDismissNotice={() => setNotice('')}
            />}

      {planner.showMap && <LocationMapModal
        draft={{ address: planner.form.starting_location, ...planner.coordinates }}
        eyebrow="Trip starting point"
        title="Choose your starting point"
        description="Search for a place, preview coordinates, or use your current location for this itinerary."
        applyLabel="Apply starting point"
        onClose={() => planner.setShowMap(false)}
        onApply={({ address, latitude, longitude }) => {
          planner.updateForm('starting_location', address || `${latitude}, ${longitude}`)
          planner.setCoordinates({ latitude, longitude })
          planner.setShowMap(false)
        }}
      />}
      {auth.showLogin && (auth.context === 'admin'
        ? <AdminLoginDialog credentials={auth.credentials} setCredentials={auth.setCredentials} error={auth.error} onClose={auth.closeAuth} onSubmit={auth.login} loading={auth.loading} />
        : <AuthDialog mode={auth.mode} setMode={(mode) => { auth.setMode(mode); auth.setError('') }} credentials={auth.credentials} setCredentials={auth.setCredentials} signupDetails={auth.signupDetails} setSignupDetails={auth.setSignupDetails} error={auth.error} onClose={auth.closeAuth} onSignIn={auth.login} onSignUp={auth.signup} loading={auth.loading} />)}
      {feedbackDestination && <DestinationFeedbackDialog destination={feedbackDestination} user={auth.user} apiFetch={apiFetch} onClose={() => setFeedbackDestination(null)} onRequireAuth={requireTouristSignIn} />}
      {modal && <AppModal title={modal.title} message={modal.message} tone={modal.tone} onClose={() => setModal(null)} />}
    </div>
  )
}

export default App
