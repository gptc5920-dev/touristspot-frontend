import { useEffect, useState } from 'react'
import { MapPin, RefreshCw } from '../../fontawesome-icons'
import { readApiJson } from '../../api'

export default function LocationFields({ apiFetch, draft, onChange }) {
  const [provinces, setProvinces] = useState([])
  const [municipalities, setMunicipalities] = useState([])
  const [barangays, setBarangays] = useState([])
  const [loading, setLoading] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      const requests = [['provinces', '/locations/provinces/']]
      if (draft.province_code) requests.push(['municipalities', `/locations/municipalities/?province_code=${draft.province_code}`])
      if (draft.municipality_code) requests.push(['barangays', `/locations/barangays/?municipality_code=${draft.municipality_code}`])
      setLoading('locations')
      setError('')
      try {
        const results = await Promise.all(requests.map(async ([level, path]) => {
          const response = await apiFetch(path)
          const body = await readApiJson(response)
          if (!response.ok) throw new Error(body.error || 'Location options are unavailable.')
          return [level, body.data]
        }))
        if (active) {
          for (const [level, rows] of results) {
            if (level === 'provinces') setProvinces(rows)
            if (level === 'municipalities') setMunicipalities(rows)
            if (level === 'barangays') setBarangays(rows)
          }
        }
      } catch (requestError) {
        if (active) setError(requestError.message || 'Location options are unavailable.')
      } finally {
        if (active) setLoading('')
      }
    }
    load()
    return () => { active = false }
  }, [apiFetch, draft.province_code, draft.municipality_code])

  function changeProvince(event) {
    onChange('province_code', event.target.value)
    onChange('municipality_code', '')
    onChange('barangay_code', '')
    setMunicipalities([])
    setBarangays([])
  }

  function changeMunicipality(event) {
    onChange('municipality_code', event.target.value)
    onChange('barangay_code', '')
    setBarangays([])
  }

  function changeBarangay(event) {
    onChange('barangay_code', event.target.value)
    const chosen = barangays.find((item) => item.code === event.target.value)
    if (chosen) onChange('area', chosen.name)
  }

  return <div className="location-options">
    <div className="location-options-title"><MapPin size={15} /><span>Philippine location</span>{loading && <RefreshCw size={13} className="spin" />}</div>
    <div className="admin-form-grid three-columns">
      <label>Province<select value={draft.province_code} onChange={changeProvince}><option value="">Select province</option>{provinces.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></label>
      <label>City or municipality<select value={draft.municipality_code} onChange={changeMunicipality} disabled={!draft.province_code}><option value="">Select city or municipality</option>{municipalities.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></label>
      <label>Barangay<select value={draft.barangay_code} onChange={changeBarangay} disabled={!draft.municipality_code}><option value="">Select barangay</option>{barangays.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></label>
    </div>
    {error && <p role="status" className="location-options-error">{error} You can still enter the address manually.</p>}
  </div>
}
