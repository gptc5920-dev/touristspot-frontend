import { useEffect, useRef, useState } from 'react'
import {
  BadgeCheck, CircleAlert, RefreshCw, Settings2, ShieldCheck, SlidersHorizontal,
  Sparkles, WandSparkles,
} from '../../fontawesome-icons'
import DestinationDetailsDialog from './DestinationDetailsDialog'
import RecommendationCard from './RecommendationCard'

const GROUP_ORDER = ['Best Match', 'Highly Recommended', 'Other Matching Destinations', 'Popular Destinations']

export default function RecommendationsPage({
  user, checking, preferences, data, generating, error,
  onGenerate, onUpdatePreferences, onAddToItinerary,
}) {
  const [details, setDetails] = useState(null)
  const requestedForUser = useRef('')

  useEffect(() => {
    if (!checking && user.role === 'tourist' && user.preferences_completed && !data && !generating && requestedForUser.current !== user.username) {
      requestedForUser.current = user.username
      onGenerate()
    }
  }, [checking, data, generating, onGenerate, user.preferences_completed, user.role, user.username])

  if (checking || (generating && !data)) return <main className="grid min-h-[calc(100vh-64px)] place-items-center bg-slate-50 px-5"><div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50"><span className="mx-auto grid size-16 place-items-center rounded-2xl bg-teal-50 text-teal-700"><WandSparkles size={30} /></span><h1 className="mt-5 text-2xl font-extrabold text-slate-950">Creating your recommendations</h1><p className="mt-2 text-sm leading-6 text-slate-500">Comparing your preferences with active, verified destination records.</p><RefreshCw className="spin mx-auto mt-5 text-teal-700" size={22} /></div></main>
  if (!user.is_authenticated || user.role !== 'tourist') return <main className="grid min-h-[calc(100vh-64px)] place-items-center bg-slate-50 px-5"><section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50"><ShieldCheck className="mx-auto text-teal-700" size={32} /><h1 className="mt-4 text-3xl font-extrabold text-slate-950">Tourist recommendations are private</h1><p className="mt-3 leading-7 text-slate-600">Sign in with a tourist account to view your personalized destination matches.</p></section></main>
  if (!user.preferences_completed) return <main className="grid min-h-[calc(100vh-64px)] place-items-center bg-slate-50 px-5"><section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50"><SlidersHorizontal className="mx-auto text-teal-700" size={32} /><h1 className="mt-4 text-3xl font-extrabold text-slate-950">Complete your preferences first</h1><p className="mt-3 leading-7 text-slate-600">A few travel choices are required before we can rank verified destinations for you.</p><button type="button" className="mt-6 min-h-12 rounded-xl bg-teal-700 px-6 text-sm font-bold text-white" onClick={onUpdatePreferences}>Set travel preferences</button></section></main>

  const recommendations = data?.recommendations || []
  const groups = GROUP_ORDER.map((name) => ({ name, items: recommendations.filter((item) => item.match_tier === name) })).filter((group) => group.items.length)

  return <main className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
    <div className="mx-auto w-full max-w-7xl">
      <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"><div><span className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.12em] text-teal-800"><Sparkles size={14} /> {data?.personalized === false ? 'Verified popular places' : 'AI-powered matches'}</span><h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Recommended tourist spots for you</h1><p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">Ranked from verified tourism records using your interests, categories, budget, time, travel style, location, accessibility needs, ratings, and office verification.</p></div><div className="flex flex-wrap gap-3"><button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 hover:border-teal-400 hover:bg-teal-50" onClick={onUpdatePreferences}><Settings2 size={16} /> Update Preferences</button><button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-bold text-white hover:bg-teal-800" onClick={() => onGenerate({ method: 'POST' })} disabled={generating}>{generating ? <RefreshCw className="spin" size={16} /> : <RefreshCw size={16} />} Refresh recommendations</button></div></header>

      <section className="mt-7 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-label="Current recommendation preferences"><span className="mr-2 inline-flex items-center gap-2 text-sm font-extrabold text-slate-800"><SlidersHorizontal size={16} className="text-teal-700" /> Your match profile</span>{preferences.selected_interests?.map((interest) => <span key={interest} className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold capitalize text-teal-800">{interest}</span>)}<span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold capitalize text-blue-800">{preferences.travel_pace} pace</span><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold capitalize text-amber-800">{preferences.transportation_preference}</span></section>

      {(data?.message || error) && <div className={`mt-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-semibold ${data?.fallback ? 'border-amber-200 bg-amber-50 text-amber-900' : error ? 'border-red-200 bg-red-50 text-red-800' : 'border-slate-200 bg-white text-slate-700'}`} role="status">{data?.fallback ? <CircleAlert className="mt-0.5 shrink-0" size={18} /> : <Sparkles className="mt-0.5 shrink-0" size={18} />}<span>{data?.message || error}</span></div>}
      {data?.data_warning && <div className="mt-4 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold leading-6 text-blue-900"><CircleAlert className="mt-0.5 shrink-0" size={18} /><span>{data.data_warning}</span></div>}

      {groups.length ? <div className="mt-10 grid gap-12">{groups.map((group) => <section key={group.name}><header className="mb-5 flex items-center gap-3"><span className={`grid size-9 place-items-center rounded-xl ${group.name === 'Best Match' ? 'bg-teal-700 text-white' : 'bg-white text-teal-700 shadow-sm'}`}>{group.name === 'Best Match' ? <Sparkles size={18} /> : <BadgeCheck size={18} />}</span><div><h2 className="text-xl font-extrabold text-slate-950">{group.name}</h2><p className="text-sm text-slate-500">{group.items.length} verified destination{group.items.length === 1 ? '' : 's'}</p></div></header><div className="grid gap-6">{group.items.map((recommendation) => <RecommendationCard key={recommendation.destination_id} recommendation={recommendation} onDetails={setDetails} onAdd={(destination) => onAddToItinerary(preferences, destination.destination_id)} />)}</div></section>)}</div> : <section className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><Sparkles className="mx-auto text-slate-400" size={34} /><h2 className="mt-4 text-2xl font-extrabold text-slate-900">No matching destinations yet</h2><p className="mx-auto mt-2 max-w-2xl text-base leading-7 text-slate-600">{data?.message || 'No tourist destinations currently match all your selected preferences. Try changing your interests, available time, location, or budget.'}</p><button type="button" className="mt-6 min-h-11 rounded-xl bg-teal-700 px-5 text-sm font-bold text-white" onClick={onUpdatePreferences}>Change preferences</button></section>}
    </div>
    <DestinationDetailsDialog destination={details} onClose={() => setDetails(null)} onAdd={(destination) => { setDetails(null); onAddToItinerary(preferences, destination.destination_id) }} />
  </main>
}
