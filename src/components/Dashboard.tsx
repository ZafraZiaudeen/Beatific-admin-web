import { useEffect, useMemo, useState } from 'react'
import DashboardService from '../services/dashboardService'
import type { DashboardAlert, DashboardOverview, DashboardTrendPoint } from '../api/types'

type Props = {
  onNewContent: () => void
  onViewContent: () => void
  onViewUsers: () => void
  onViewSettings: () => void
}

function fmtNumber(value: number): string {
  return Intl.NumberFormat('en-US').format(value)
}

function fmtDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function fmtDateTime(value: string): string {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function fmtRelative(value?: string): string {
  if (!value) return 'No recent activity'
  const time = new Date(value).getTime()
  const diff = Date.now() - time
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function severityStyles(severity: DashboardAlert['severity']): string {
  if (severity === 'critical') return 'bg-rose-50 border-rose-200 text-rose-800'
  if (severity === 'warning') return 'bg-amber-50 border-amber-200 text-amber-800'
  return 'bg-sky-50 border-sky-200 text-sky-800'
}

function buildFallbackPoints(days = 7): DashboardTrendPoint[] {
  const out: DashboardTrendPoint[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    out.push({ date: d.toISOString(), count: 0 })
  }

  return out
}

function TrendBars({ points, tone }: { points: DashboardTrendPoint[]; tone: 'sky' | 'emerald' | 'violet' }) {
  const safePoints = points.length > 0 ? points : buildFallbackPoints()

  const maxValue = useMemo(() => {
    const values = safePoints.map((p) => {
      const numeric = Number(p.count)
      return Number.isFinite(numeric) ? numeric : 0
    })
    return Math.max(...values, 1)
  }, [safePoints])

  const hasActivity = useMemo(
    () => safePoints.some((p) => {
      const numeric = Number(p.count)
      return Number.isFinite(numeric) && numeric > 0
    }),
    [safePoints]
  )

  const toneClass =
    tone === 'emerald'
      ? 'bg-emerald-500/80'
      : tone === 'violet'
        ? 'bg-violet-500/80'
        : 'bg-sky-500/80'

  return (
    <div className="h-36 rounded-xl border border-stone-200 bg-linear-to-b from-stone-50 to-white p-3">
      <div className="h-full border border-stone-100 rounded-md bg-white/70 p-2">
        <div className="h-full flex items-end gap-1">
          {safePoints.map((p) => {
            const numeric = Number(p.count)
            const count = Number.isFinite(numeric) ? numeric : 0
            const h = Math.max((count / maxValue) * 100, count > 0 ? 10 : 8)
            const barOpacity = hasActivity ? 'opacity-90' : 'opacity-60'

            return (
              <div key={p.date} className="flex-1 h-full group relative flex items-end">
                <div
                  className={`w-full rounded-t-sm transition-all duration-200 hover:opacity-100 ${barOpacity} ${toneClass}`}
                  style={{ height: `${h}%` }}
                  title={`${fmtDate(p.date)}: ${count}`}
                />
                <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] px-1.5 py-0.5 rounded bg-stone-900 text-white whitespace-nowrap">
                  {count}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {!hasActivity && (
        <p className="mt-2 text-[11px] text-stone-500">No activity in selected window yet.</p>
      )}
    </div>
  )
}

function KpiCard({
  title,
  value,
  sub,
  accent,
}: {
  title: string
  value: string
  sub: string
  accent: 'sky' | 'emerald' | 'violet' | 'rose' | 'amber' | 'stone'
}) {
  const accentClass =
    accent === 'emerald'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
      : accent === 'violet'
        ? 'bg-violet-50 text-violet-700 border-violet-100'
        : accent === 'rose'
          ? 'bg-rose-50 text-rose-700 border-rose-100'
          : accent === 'amber'
            ? 'bg-amber-50 text-amber-700 border-amber-100'
            : accent === 'stone'
              ? 'bg-stone-100 text-stone-700 border-stone-200'
              : 'bg-sky-50 text-sky-700 border-sky-100'

  return (
    <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">{title}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${accentClass}`}>{sub}</span>
      </div>
      <p className="text-3xl font-semibold text-stone-900 tracking-tight">{value}</p>
    </div>
  )
}

export default function Dashboard({ onNewContent, onViewContent, onViewUsers, onViewSettings }: Props) {
  const [days, setDays] = useState<number>(30)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [overview, setOverview] = useState<DashboardOverview | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await DashboardService.getOverview(days)
        if (!active) return
        setOverview(data)
      } catch (e) {
        if (!active) return
        const msg = e && typeof e === 'object' && 'message' in e ? String((e as { message?: string }).message) : 'Failed to load dashboard data.'
        setError(msg)
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [days])

  return (
    <div id="subview-dashboard" className="flex-1 overflow-y-auto p-6 md:p-8 bg-linear-to-b from-stone-50 to-stone-100/50">
      <div className="max-w-7xl mx-auto space-y-6 animate-slide-up">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900 tracking-tight mb-1">Operations Dashboard</h1>
            <p className="text-sm text-stone-500">Unified visibility for growth, content throughput, and platform risk.</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-stone-200 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <button
              onClick={onNewContent}
              className="px-4 py-2 bg-stone-900 text-white text-xs font-medium rounded-lg hover:bg-stone-800 transition-colors"
            >
              New Content
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-28 bg-white border border-stone-200 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {!loading && overview && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
              <KpiCard title="Total Users" value={fmtNumber(overview.kpis.totalUsers)} sub={`${fmtNumber(overview.kpis.appUsers)} app`} accent="sky" />
              <KpiCard title="Admin Team" value={fmtNumber(overview.kpis.adminUsers)} sub="staff" accent="violet" />
              <KpiCard title="Active Users" value={fmtNumber(overview.kpis.activeUsersInWindow)} sub={`${overview.windowDays}d window`} accent="emerald" />
              <KpiCard title="Published" value={fmtNumber(overview.kpis.publishedContent)} sub={`${overview.kpis.publishRate}% ratio`} accent="emerald" />
              <KpiCard title="Draft Content" value={fmtNumber(overview.kpis.draftContent)} sub="needs review" accent="amber" />
              <KpiCard title="Banned Users" value={fmtNumber(overview.kpis.bannedAppUsers)} sub="risk queue" accent="rose" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-stone-900">User Signups Trend</h3>
                  <span className="text-xs text-stone-500">Daily</span>
                </div>
                <TrendBars points={overview.trends.userSignups} tone="sky" />
              </div>
              <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-stone-900">Content Created Trend</h3>
                  <span className="text-xs text-stone-500">Daily</span>
                </div>
                <TrendBars points={overview.trends.contentCreated} tone="violet" />
              </div>
              <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-stone-900">Publishing Trend</h3>
                  <span className="text-xs text-stone-500">Daily</span>
                </div>
                <TrendBars points={overview.trends.contentPublished} tone="emerald" />
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="xl:col-span-2 bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-stone-900">Recent App Users</h3>
                  <button onClick={onViewUsers} className="text-xs font-medium text-sky-700 hover:text-sky-800">
                    Open Users
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-140">
                    <thead className="bg-stone-50 border-b border-stone-200">
                      <tr className="text-left text-[11px] uppercase tracking-wide text-stone-500">
                        <th className="px-4 py-2.5 font-semibold">Name</th>
                        <th className="px-4 py-2.5 font-semibold">Email</th>
                        <th className="px-4 py-2.5 font-semibold">Status</th>
                        <th className="px-4 py-2.5 font-semibold">Created</th>
                        <th className="px-4 py-2.5 font-semibold">Last Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.recent.users.map((u) => (
                        <tr key={u.id} className="border-b border-stone-100 text-sm">
                          <td className="px-4 py-3 font-medium text-stone-900">{u.name}</td>
                          <td className="px-4 py-3 text-stone-600">{u.email}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${u.isBanned ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {u.isBanned ? 'Banned' : 'Active'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-stone-600">{fmtDateTime(u.createdAt)}</td>
                          <td className="px-4 py-3 text-stone-500">{fmtRelative(u.lastActiveAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-stone-900 mb-3">Content Mix</h3>
                <div className="space-y-3">
                  {overview.contentByType.length === 0 && (
                    <p className="text-xs text-stone-500">No content data available.</p>
                  )}
                  {overview.contentByType.map((row) => (
                    <div key={row.type}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-stone-700 capitalize">{row.type}</span>
                        <span className="text-stone-500">{fmtNumber(row.count)} ({row.share}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                        <div className="h-full rounded-full bg-sky-500" style={{ width: `${Math.max(row.share, 3)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="xl:col-span-2 bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-stone-900">Recent Content Updates</h3>
                  <button onClick={onViewContent} className="text-xs font-medium text-sky-700 hover:text-sky-800">
                    Open Content
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-140">
                    <thead className="bg-stone-50 border-b border-stone-200">
                      <tr className="text-left text-[11px] uppercase tracking-wide text-stone-500">
                        <th className="px-4 py-2.5 font-semibold">Item</th>
                        <th className="px-4 py-2.5 font-semibold">Type</th>
                        <th className="px-4 py-2.5 font-semibold">Category</th>
                        <th className="px-4 py-2.5 font-semibold">Status</th>
                        <th className="px-4 py-2.5 font-semibold">Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.recent.content.map((c) => (
                        <tr key={c.id} className="border-b border-stone-100 text-sm">
                          <td className="px-4 py-3 font-medium text-stone-900">{c.name}</td>
                          <td className="px-4 py-3 text-stone-600 capitalize">{c.itemType}</td>
                          <td className="px-4 py-3 text-stone-600">{c.category ?? 'Unassigned'}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${c.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {c.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-stone-600">{fmtDateTime(c.updatedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-stone-900">System Alerts</h3>
                  <button onClick={onViewSettings} className="text-xs font-medium text-sky-700 hover:text-sky-800">
                    Open Settings
                  </button>
                </div>
                <div className="space-y-2.5">
                  {overview.alerts.length === 0 && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                      <p className="text-xs font-medium text-emerald-700">No active alerts. Platform posture looks healthy.</p>
                    </div>
                  )}
                  {overview.alerts.map((alert) => (
                    <div key={alert.id} className={`rounded-lg border p-3 ${severityStyles(alert.severity)}`}>
                      <p className="text-xs font-semibold mb-0.5">{alert.title}</p>
                      <p className="text-xs opacity-90">{alert.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-stone-900">Quick Actions</h3>
                <span className="text-xs text-stone-500">Updated {fmtDateTime(overview.generatedAt)}</span>
              </div>
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={onNewContent}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-stone-200 hover:border-sky-300 hover:bg-sky-50 transition-all"
                >
                  <span className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-lg">+</span>
                  <span className="text-xs font-medium text-stone-700">Create Content</span>
                </button>
                <button
                  onClick={onViewContent}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-stone-200 hover:border-violet-300 hover:bg-violet-50 transition-all"
                >
                  <span className="w-9 h-9 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center text-sm font-bold">C</span>
                  <span className="text-xs font-medium text-stone-700">Manage Content</span>
                </button>
                <button
                  onClick={onViewUsers}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all"
                >
                  <span className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">U</span>
                  <span className="text-xs font-medium text-stone-700">Manage Users</span>
                </button>
                <button
                  onClick={onViewSettings}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-stone-200 hover:border-amber-300 hover:bg-amber-50 transition-all"
                >
                  <span className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold">S</span>
                  <span className="text-xs font-medium text-stone-700">System Settings</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
