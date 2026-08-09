import { useEffect, useState } from 'react'
import {
  BadgeCheck, Building2, CircleAlert, ImagePlus, Mail, MapPinned,
  Navigation, Phone, RefreshCw, RotateCcw, Save, Trash2, Upload,
} from '../../fontawesome-icons'
import { readApiJson } from '../../api'
import { useSiteSettings } from '../../contexts/siteSettingsState'
import { apiErrorMessage, requestErrorMessage } from '../../lib/app'

const TEXT_FIELDS = ['site_name', 'tagline', 'organization_name', 'municipality_name', 'support_email', 'support_phone']

function editableSettings(settings) {
  return Object.fromEntries(TEXT_FIELDS.map((field) => [field, settings[field] || '']))
}

export default function AdminSettings({ apiFetch }) {
  const { settings, updateSettings } = useSiteSettings()
  const [draft, setDraft] = useState(() => editableSettings(settings))
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [requestError, setRequestError] = useState('')
  const [pendingLogo, setPendingLogo] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [removingLogo, setRemovingLogo] = useState(false)

  useEffect(() => {
    let active = true
    async function loadSettings() {
      try {
        const response = await apiFetch('/admin/settings/')
        const body = await readApiJson(response)
        if (!response.ok) throw new Error(apiErrorMessage(body, 'Could not load site settings.'))
        if (active) {
          updateSettings(body.settings)
          setDraft(editableSettings(body.settings))
        }
      } catch (error) {
        if (active) setRequestError(requestErrorMessage(error, 'Could not load site settings.'))
      } finally {
        if (active) setLoading(false)
      }
    }
    loadSettings()
    return () => { active = false }
  }, [apiFetch, updateSettings])

  useEffect(() => {
    if (!pendingLogo) {
      setPreviewUrl('')
      return undefined
    }
    const objectUrl = URL.createObjectURL(pendingLogo)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [pendingLogo])

  function changeField(field, value) {
    setDraft((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setMessage('')
  }

  function validate() {
    const nextErrors = {}
    if (draft.site_name.trim().length < 2) nextErrors.site_name = 'Enter a site name with at least 2 characters.'
    if (draft.tagline.trim().length < 5) nextErrors.tagline = 'Enter a helpful tagline with at least 5 characters.'
    if (draft.organization_name.trim().length < 2) nextErrors.organization_name = 'Enter the managing office or organization.'
    if (draft.municipality_name.trim().length < 2) nextErrors.municipality_name = 'Enter the public location name.'
    if (draft.support_email && !/^\S+@\S+\.\S+$/.test(draft.support_email)) nextErrors.support_email = 'Enter a valid email address.'
    return nextErrors
  }

  function chooseLogo(file) {
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrors((current) => ({ ...current, logo: 'Choose a JPG, PNG, or WebP logo.' }))
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors((current) => ({ ...current, logo: 'Choose a logo that is 2 MB or smaller.' }))
      return
    }
    setPendingLogo(file)
    setErrors((current) => ({ ...current, logo: undefined }))
    setMessage('')
  }

  async function saveSettings(event) {
    event.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors)
      setRequestError('Review the highlighted fields before saving.')
      return
    }
    setSaving(true)
    setRequestError('')
    setMessage('')
    try {
      const response = await apiFetch('/admin/settings/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      const body = await readApiJson(response)
      if (!response.ok) {
        if (body.fields) setErrors(Object.fromEntries(Object.entries(body.fields).map(([field, values]) => [field, values?.[0]])))
        throw new Error(apiErrorMessage(body, 'Could not save site settings.'))
      }

      let savedSettings = body.settings
      if (pendingLogo) {
        const media = new FormData()
        media.append('logo', pendingLogo)
        const logoResponse = await apiFetch('/admin/settings/logo/', { method: 'POST', body: media })
        const logoBody = await readApiJson(logoResponse)
        if (!logoResponse.ok) throw new Error(`Settings saved, but the logo was not uploaded. ${apiErrorMessage(logoBody, 'Choose another logo and retry.')}`)
        savedSettings = logoBody.settings
      }
      updateSettings(savedSettings)
      setDraft(editableSettings(savedSettings))
      setPendingLogo(null)
      setMessage('Brand and contact settings saved. The changes are now live.')
    } catch (error) {
      setRequestError(requestErrorMessage(error, 'Could not save site settings.'))
    } finally {
      setSaving(false)
    }
  }

  async function removeLogo() {
    if (pendingLogo) {
      setPendingLogo(null)
      return
    }
    if (!settings.has_logo) return
    setRemovingLogo(true)
    setRequestError('')
    try {
      const response = await apiFetch('/admin/settings/logo/', { method: 'DELETE' })
      const body = await readApiJson(response)
      if (!response.ok) throw new Error(apiErrorMessage(body, 'Could not remove the logo.'))
      updateSettings(body.settings)
      setMessage('Custom logo removed. The default navigation mark is active.')
    } catch (error) {
      setRequestError(requestErrorMessage(error, 'Could not remove the logo.'))
    } finally {
      setRemovingLogo(false)
    }
  }

  function resetForm() {
    setDraft(editableSettings(settings))
    setPendingLogo(null)
    setErrors({})
    setRequestError('')
    setMessage('Unsaved changes cleared.')
  }

  const displayedLogo = previewUrl || settings.logo_url
  const inputClass = (field) => `mt-2 min-h-12 w-full rounded-lg border bg-white px-4 text-[15px] text-slate-800 outline-none transition focus:ring-4 ${errors[field] ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'}`

  if (loading) return <div className="flex min-h-80 items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-500"><RefreshCw className="spin" size={18} /> Loading site settings</div>

  return <form className="grid w-full gap-6" onSubmit={saveSettings} noValidate>
    {(requestError || message) && <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-semibold ${requestError ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
      {requestError ? <CircleAlert className="mt-0.5 shrink-0" size={18} /> : <BadgeCheck className="mt-0.5 shrink-0" size={18} />}
      <span>{requestError || message}</span>
    </div>}

    <section className="grid overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm xl:grid-cols-[minmax(300px,0.7fr)_minmax(520px,1.3fr)]">
      <div className="border-b border-slate-200 bg-slate-50/70 p-6 xl:border-r xl:border-b-0 xl:p-8">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-blue-600"><ImagePlus size={15} /> Brand preview</span>
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
              {displayedLogo ? <img className="h-full w-full object-contain" src={displayedLogo} alt="Current site logo" /> : <Navigation size={30} strokeWidth={2.4} />}
            </span>
            <span className="min-w-0"><strong className="block truncate text-xl text-slate-900">{draft.site_name || 'Site name'}</strong><small className="mt-1 block text-sm leading-5 text-slate-500">{draft.organization_name || 'Organization name'}</small></span>
          </div>
          <p className="mt-5 border-t border-slate-100 pt-5 text-base leading-7 text-slate-600">{draft.tagline || 'Your public tagline will appear here.'}</p>
          <p className="mt-3 flex items-start gap-2 text-sm text-slate-500"><MapPinned className="mt-0.5 shrink-0" size={16} /> {draft.municipality_name || 'Municipality'}</p>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-bold text-slate-800" htmlFor="site-logo">Logo image</label>
          <p className="mt-1 text-sm leading-6 text-slate-500">Use a square or horizontal logo with a transparent background when possible. JPG, PNG, or WebP; maximum 2 MB.</p>
          <input id="site-logo" className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => chooseLogo(event.target.files?.[0])} />
          <div className="mt-4 flex flex-wrap gap-3">
            <label htmlFor="site-logo" className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"><Upload size={17} /> {displayedLogo ? 'Replace logo' : 'Upload logo'}</label>
            {(pendingLogo || settings.has_logo) && <button type="button" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-sm font-bold text-red-700 hover:bg-red-50" onClick={removeLogo} disabled={removingLogo || saving}>{removingLogo ? <RefreshCw className="spin" size={16} /> : <Trash2 size={16} />} {pendingLogo ? 'Discard upload' : 'Remove logo'}</button>}
          </div>
          {pendingLogo && <p className="mt-3 truncate text-sm font-semibold text-blue-700">Ready to upload: {pendingLogo.name}</p>}
          {errors.logo && <p className="mt-2 text-sm font-semibold text-red-600">{errors.logo}</p>}
        </div>
      </div>

      <div className="p-6 xl:p-8">
        <div className="flex items-start gap-3 border-b border-slate-200 pb-5">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600"><Building2 size={20} /></span>
          <div><h2 className="text-xl font-bold text-slate-900">Identity and public details</h2><p className="mt-1 text-sm leading-6 text-slate-500">These details appear throughout the tourist site, administration area, and public footer.</p></div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <label className="block text-sm font-bold text-slate-700">Site name <span className="text-red-500">*</span><input className={inputClass('site_name')} value={draft.site_name} maxLength={80} onChange={(event) => changeField('site_name', event.target.value)} placeholder="e.g. Travel Osmena" />{errors.site_name && <span className="mt-2 block text-sm font-semibold text-red-600">{errors.site_name}</span>}</label>
          <label className="block text-sm font-bold text-slate-700">Tourism office / organization <span className="text-red-500">*</span><span className="relative block"><Building2 className="pointer-events-none absolute left-4 top-[22px] text-slate-400" size={17} /><input className={`${inputClass('organization_name')} pl-11`} value={draft.organization_name} maxLength={180} onChange={(event) => changeField('organization_name', event.target.value)} placeholder="e.g. Municipal Tourism Office" /></span>{errors.organization_name && <span className="mt-2 block text-sm font-semibold text-red-600">{errors.organization_name}</span>}</label>
          <label className="block text-sm font-bold text-slate-700 lg:col-span-2">Tagline <span className="text-red-500">*</span><input className={inputClass('tagline')} value={draft.tagline} maxLength={180} onChange={(event) => changeField('tagline', event.target.value)} placeholder="A short promise to travelers" /><span className="mt-2 flex justify-between gap-3 text-xs font-normal text-slate-500"><span>Keep it clear and memorable for the home-page headline.</span><span>{draft.tagline.length}/180</span></span>{errors.tagline && <span className="mt-2 block text-sm font-semibold text-red-600">{errors.tagline}</span>}</label>
          <label className="block text-sm font-bold text-slate-700 lg:col-span-2">Municipality / public location <span className="text-red-500">*</span><span className="relative block"><MapPinned className="pointer-events-none absolute left-4 top-[22px] text-slate-400" size={17} /><input className={`${inputClass('municipality_name')} pl-11`} value={draft.municipality_name} maxLength={180} onChange={(event) => changeField('municipality_name', event.target.value)} placeholder="Municipality, province" /></span>{errors.municipality_name && <span className="mt-2 block text-sm font-semibold text-red-600">{errors.municipality_name}</span>}</label>
        </div>

        <div className="mt-8 flex items-start gap-3 border-b border-slate-200 pb-5">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><Mail size={20} /></span>
          <div><h2 className="text-xl font-bold text-slate-900">Contact information</h2><p className="mt-1 text-sm leading-6 text-slate-500">Optional public contact details for traveler questions and tourism assistance.</p></div>
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <label className="block text-sm font-bold text-slate-700">Support email<span className="relative block"><Mail className="pointer-events-none absolute left-4 top-[22px] text-slate-400" size={17} /><input className={`${inputClass('support_email')} pl-11`} type="email" value={draft.support_email} maxLength={254} onChange={(event) => changeField('support_email', event.target.value)} placeholder="tourism@example.gov.ph" /></span>{errors.support_email && <span className="mt-2 block text-sm font-semibold text-red-600">{errors.support_email}</span>}</label>
          <label className="block text-sm font-bold text-slate-700">Support phone<span className="relative block"><Phone className="pointer-events-none absolute left-4 top-[22px] text-slate-400" size={17} /><input className={`${inputClass('support_phone')} pl-11`} type="tel" value={draft.support_phone} maxLength={40} onChange={(event) => changeField('support_phone', event.target.value)} placeholder="+63 900 000 0000" /></span>{errors.support_phone && <span className="mt-2 block text-sm font-semibold text-red-600">{errors.support_phone}</span>}</label>
        </div>
      </div>
    </section>

    <div className="sticky bottom-4 z-10 flex flex-col items-stretch justify-between gap-4 rounded-xl border border-slate-200 bg-white/95 px-4 py-4 shadow-xl shadow-slate-200/60 backdrop-blur sm:flex-row sm:items-center sm:px-5">
      <p className="text-sm text-slate-500">Changes apply to both the client website and the admin dashboard.</p>
      <div className="grid grid-cols-2 gap-3 sm:flex"><button type="button" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50" onClick={resetForm} disabled={saving}><RotateCcw size={16} /> Reset</button><button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700" disabled={saving}>{saving ? <RefreshCw className="spin" size={17} /> : <Save size={17} />} {saving ? 'Saving changes' : 'Save settings'}</button></div>
    </div>
  </form>
}
