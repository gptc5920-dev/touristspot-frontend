import {
  ArrowRight, BadgeCheck, BarChart3, ClipboardCheck, Database, FileClock,
  ListChecks, RefreshCw, TriangleAlert,
} from '../../fontawesome-icons'
import { peso } from '../../lib/app'

export default function AdminDashboardOverview({ dashboard, loading, onManage, onEdit }) {
  const stats = dashboard?.stats || {}
  const interests = dashboard?.popular_interests || []
  const categories = dashboard?.category_counts || []
  const attentionItems = dashboard?.attention_items || []
  const recentItineraries = dashboard?.recent_itineraries || []
  const readiness = Number(stats.readiness_percent || 0)
  const maxInterestCount = Math.max(1, ...interests.map(([, count]) => count))

  if (loading) return <div className="admin-dashboard-loading"><RefreshCw className="spin" size={22} /> Preparing dashboard</div>

  return <div className="admin-dashboard">
    <section className="admin-stat-grid" aria-label="Tourism data summary">
      <article><span className="admin-stat-icon teal"><Database size={18} /></span><div><span>Destination records</span><strong>{stats.destinations ?? 0}</strong><small>Across {stats.areas ?? 0} areas</small></div></article>
      <article><span className="admin-stat-icon green"><ClipboardCheck size={18} /></span><div><span>Ready for travelers</span><strong>{stats.ready_destinations ?? 0}</strong><small>{readiness}% of all records</small></div></article>
      <article><span className="admin-stat-icon amber"><TriangleAlert size={18} /></span><div><span>Needs review</span><strong>{stats.pending_destinations ?? 0}</strong><small>{stats.advisory_destinations ?? 0} active advisories</small></div></article>
      <article><span className="admin-stat-icon blue"><FileClock size={18} /></span><div><span>Saved itineraries</span><strong>{stats.saved_itineraries ?? 0}</strong><small>Traveler planning activity</small></div></article>
    </section>

    <section className="admin-insight-grid">
      <article className="admin-dashboard-panel readiness-panel">
        <div className="dashboard-panel-heading"><div><span className="eyebrow"><ClipboardCheck size={14} /> Publishing health</span><h2>Destination readiness</h2></div><button type="button" onClick={onManage}>Manage records <ArrowRight size={15} /></button></div>
        <div className="readiness-content">
          <div className="readiness-dial" style={{ '--readiness': `${readiness}%` }}><span><strong>{readiness}%</strong><small>ready</small></span></div>
          <div className="readiness-breakdown">
            <div><span><i className="status-dot ready" /> Ready for travelers</span><strong>{stats.ready_destinations ?? 0}</strong></div>
            <div><span><i className="status-dot pending" /> Awaiting verification</span><strong>{stats.pending_destinations ?? 0}</strong></div>
            <div><span><i className="status-dot inactive" /> Unavailable</span><strong>{stats.inactive_destinations ?? 0}</strong></div>
          </div>
        </div>
        <div className="coverage-strip"><span><strong>{stats.categories ?? 0}</strong> categories</span><span><strong>{stats.areas ?? 0}</strong> covered areas</span><span><strong>{stats.average_entrance_fee == null ? '—' : peso.format(stats.average_entrance_fee)}</strong> average entry</span></div>
      </article>

      <article className="admin-dashboard-panel interest-panel">
        <div className="dashboard-panel-heading"><div><span className="eyebrow"><BarChart3 size={14} /> Content signals</span><h2>Interest coverage</h2></div></div>
        {interests.length ? <div className="interest-bars">{interests.map(([interest, count]) => <div key={interest}><div><span>{interest}</span><strong>{count}</strong></div><span className="interest-track"><i style={{ width: `${Math.max(8, (count / maxInterestCount) * 100)}%` }} /></span></div>)}</div> : <div className="dashboard-empty compact"><BarChart3 size={23} /><strong>No interest data yet</strong><span>Add destinations to see coverage signals.</span></div>}
        {categories.length > 0 && <div className="category-summary"><span>Top categories</span><div>{categories.map(({ category, count }) => <strong key={category}>{category} <small>{count}</small></strong>)}</div></div>}
      </article>
    </section>

    <section className="admin-activity-grid">
      <article className="admin-dashboard-panel">
        <div className="dashboard-panel-heading"><div><span className="eyebrow"><ListChecks size={14} /> Action queue</span><h2>Needs attention</h2></div><span className="panel-count">{attentionItems.length}</span></div>
        {attentionItems.length ? <div className="attention-list">{attentionItems.map((item) => <button type="button" key={item.id} onClick={() => onEdit(item.id)}><span className="attention-icon"><TriangleAlert size={16} /></span><span><strong>{item.name}</strong><small>{item.category} · {item.area}</small></span><em>{item.issue}</em><ArrowRight size={15} /></button>)}</div> : <div className="dashboard-empty"><BadgeCheck size={25} /><strong>Everything is up to date</strong><span>No destination records currently need attention.</span></div>}
      </article>

      <article className="admin-dashboard-panel">
        <div className="dashboard-panel-heading"><div><span className="eyebrow"><FileClock size={14} /> Traveler activity</span><h2>Recent itineraries</h2></div></div>
        {recentItineraries.length ? <div className="recent-itinerary-list">{recentItineraries.map((itinerary) => <div key={itinerary.id}><span className="itinerary-date"><strong>{new Date(`${itinerary.travel_date}T00:00:00`).toLocaleDateString('en-PH', { day: '2-digit' })}</strong><small>{new Date(`${itinerary.travel_date}T00:00:00`).toLocaleDateString('en-PH', { month: 'short' })}</small></span><span><strong>{itinerary.name}</strong><small>Travel date · {new Date(`${itinerary.travel_date}T00:00:00`).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}</small></span></div>)}</div> : <div className="dashboard-empty"><FileClock size={25} /><strong>No saved itineraries yet</strong><span>Traveler activity will appear here after plans are saved.</span></div>}
      </article>
    </section>
  </div>
}
